import * as fs from "fs";
import { MetaLogger } from "../utils/index.js";
import { FreMetaLanguage } from "../languagedef/metalanguage/index.js";
import {
    GenerationStatus,
    FileUtil,
    Names,
    READER_FOLDER,
    READER_GEN_FOLDER,
    WRITER_FOLDER,
    WRITER_GEN_FOLDER,
} from "../utils/index.js";
import { FreEditUnit } from "../editordef/metalanguage/index.js";
import {WriterTemplate, GrammarGenerator, ReaderHelperTemplate, ReaderTemplate} from "./parserTemplates/index.js";
import { LanguageAnalyser } from "./parserTemplates/LanguageAnalyser.js";
import { GrammarModel } from "./parserTemplates/grammarModel/index.js";
import peggy from "peggy";

const LOGGER = new MetaLogger("ReaderWriterGenerator").mute();

/**
 * Generates the grammar for all units into one file, because the parser is able to learn how to process
 * the common parts. This will bring a small runtime efficiency advantage.
 *
 * The syntax analysis is generated into one file for the commonly used concepts and one file per model unit.
 * This is done to avoid overly large files.
 */
export class ReaderWriterGenerator {
    public outputfolder: string = ".";
    public language: FreMetaLanguage | undefined;
    private writerFolder: string = "";
    private writerGenFolder: string = "";
    private readerFolder: string = "";
    private readerGenFolder: string = "";

    generate(editDef: FreEditUnit): void {
        if (this.language === null || this.language === undefined) {
            LOGGER.error("Cannot generate parser and unparser because language is not set.");
            return;
        }
        const generationStatus = new GenerationStatus();
        this.getFolderNames();
        LOGGER.log(
            "Generating parser and unparser in folder " + this.writerGenFolder + " for language " + this.language?.name,
        );

        const unparserTemplate: WriterTemplate = new WriterTemplate();
        const helperTemplate: ReaderHelperTemplate = new ReaderHelperTemplate();
        const readerTemplate: ReaderTemplate = new ReaderTemplate();
        const grammarGenerator: GrammarGenerator = new GrammarGenerator();

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.writerGenFolder);
        FileUtil.deleteFilesInDir(this.writerGenFolder, generationStatus);
        FileUtil.createDirIfNotExisting(this.readerGenFolder);
        FileUtil.deleteFilesInDir(this.readerGenFolder, generationStatus);

        // set relative path to get the imports right
        const relativePath = "../../";

        //  Generate the writer
        const writerFilePath: string = `${this.writerGenFolder}/${Names.writer(this.language)}.ts`;
        let generatedGrammar: string = unparserTemplate.generateUnparser(this.language, editDef, relativePath);
        this.makeFile(`language writer`, writerFilePath, generatedGrammar, generationStatus);

        // Generate the reader
        // The complete structure model of the language is analysed. All concepts are split into groups.
        // Concepts used in just one unit are put into a group per unit.
        // Concepts used in more than one unit are put in a 'common' group.
        const analyser = new LanguageAnalyser();
        analyser.analyseModel(this.language);

        // Create in memory all grammar rules and syntax analysis methods
        const grammarModel: GrammarModel | undefined = grammarGenerator.createGrammar(this.language, analyser, editDef);
        if (!grammarModel) {
            return;
        }

        // Write the grammar to file
        generatedGrammar = grammarModel.toGrammar(relativePath);
        // test the generated grammar, if not ok error will be thrown
        // this.testGrammar(generatedContent, generationStatus);
        // write the grammar to file
        const grammarFilePath: string = `${this.readerGenFolder}/${Names.grammar(this.language)}.peggy`;
        // Do not use the prettier! This is not typescript.
        fs.writeFileSync(`${grammarFilePath}`, generatedGrammar);

        // Generate a parser from the grammar and write to file.
        let parser: string | undefined = undefined;
        try {
            // throws an exception if the grammar is invalid
            parser = peggy.generate(generatedGrammar, {
                output: "source",
                format: "es",
                allowedStartRules: grammarModel.getStartRules()
            });
        } catch (e) {
            // @ts-ignore
            LOGGER.error("Invalid Grammar: " + e.message + ", line: " + e.location.start.line + ", column: " + e.location.start.column);
            generationStatus.numberOfErrors += 1;
        }
        if (!!parser) {
            // Do not use the prettier! This is not typescript.
            const parserFilePath: string = `${this.readerGenFolder}/${Names.parser(this.language)}.js`;
            fs.writeFileSync(`${parserFilePath}`, parser);
        }

        // Generate and write the helper functions for the parser.
        const helpers: string = helperTemplate.generate();
        const helpersFilePath = `${this.readerGenFolder}/${Names.parserHelpers}.ts`;
        this.makeFile(`reader helpers`, helpersFilePath, helpers, generationStatus);

        // Generate and write the reader class.
        const reader: string = readerTemplate.generateReader(this.language, relativePath);
        const readerFilePath = `${this.readerGenFolder}/${Names.reader(this.language)}.ts`;
        this.makeFile(`reader`, readerFilePath, reader, generationStatus);

        // write the index file for the reader gen folder
        const indexContent: string =
            `export * from "./${Names.parser(this.language)}";
            export * from "./${Names.parserHelpers}";
            export * from "./${Names.reader(this.language)}";\n`;
        const indexFilePath = `${this.readerGenFolder}/index.ts`;
        this.makeFile(`reader index`, indexFilePath, indexContent, generationStatus);

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.error(
                `Generated reader and writer for ${this.language.name} with ${generationStatus.numberOfErrors} errors.`,
            );
        } else {
            LOGGER.info(`Successfully generated reader and writer.`);
        }
    }

    private getFolderNames() {
        this.writerFolder = this.outputfolder + "/" + WRITER_FOLDER;
        this.readerFolder = this.outputfolder + "/" + READER_FOLDER;
        this.writerGenFolder = this.outputfolder + "/" + WRITER_GEN_FOLDER;
        this.readerGenFolder = this.outputfolder + "/" + READER_GEN_FOLDER;
    }

    private makeFile(
        generationMessage: string,
        generatedFilePath: string,
        generatedContent: string,
        generationStatus: GenerationStatus,
    ) {
        LOGGER.log(`Generating ${generationMessage}: ${generatedFilePath}`);
        generatedContent = FileUtil.pretty(generatedContent, `${generatedFilePath}`, generationStatus);
        fs.writeFileSync(`${generatedFilePath}`, generatedContent);
    }

    clean(force: boolean) {
        this.getFolderNames();
        FileUtil.deleteDirAndContent(this.writerGenFolder);
        FileUtil.deleteDirAndContent(this.readerGenFolder);
        if (force) {
            FileUtil.deleteDirAndContent(this.writerFolder);
            FileUtil.deleteDirAndContent(this.readerFolder);
        } else {
            FileUtil.deleteDirIfEmpty(this.writerFolder);
            FileUtil.deleteDirIfEmpty(this.readerFolder);
        }
    }
}
