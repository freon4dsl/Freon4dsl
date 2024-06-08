import * as fs from "fs";
import { MetaLogger } from "../utils";
import { FreMetaLanguage } from "../languagedef/metalanguage";
import { GenerationStatus, FileUtil, Names, READER_FOLDER, READER_GEN_FOLDER, WRITER_FOLDER, WRITER_GEN_FOLDER } from "../utils";
import { FreEditUnit } from "../editordef/metalanguage";
import { WriterTemplate, ReaderTemplate, GrammarGenerator } from "./parserTemplates";
import { net } from "net.akehurst.language-agl-processor";
import Agl = net.akehurst.language.agl.processor.Agl;
import { LanguageAnalyser } from "./parserTemplates/LanguageAnalyser";
import { GrammarModel } from "./parserTemplates/grammarModel/GrammarModel";

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
    public language: FreMetaLanguage;
    private writerFolder: string;
    private writerGenFolder: string;
    private readerFolder: string;
    private readerGenFolder: string;

    generate(editDef: FreEditUnit): void {
        if (this.language === null) {
            LOGGER.error("Cannot generate parser and unparser because language is not set.");
            return;
        }
        const generationStatus = new GenerationStatus();
        this.getFolderNames();
        LOGGER.log("Generating parser and unparser in folder " + this.writerGenFolder + " for language " + this.language?.name);

        const unparserTemplate = new WriterTemplate();
        const readerTemplate = new ReaderTemplate();
        const grammarGenerator = new GrammarGenerator();

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.writerGenFolder);
        FileUtil.deleteFilesInDir(this.writerGenFolder, generationStatus);
        FileUtil.createDirIfNotExisting(this.readerGenFolder);
        FileUtil.deleteFilesInDir(this.readerGenFolder, generationStatus);

        // set relative path to get the imports right
        const relativePath = "../../";

        // remember all file names etc. for the index
        let indexContent: string = "";

        //  Generate the writer
        let generatedFilePath = `${this.writerGenFolder}/${Names.writer(this.language)}.ts`;
        let generatedContent = unparserTemplate.generateUnparser(this.language, editDef, relativePath);
        this.makeFile(`language writer`, generatedFilePath, generatedContent, generationStatus);

        // Generate the reader
        // The complete structure model of the language is analysed. All concepts are split into groups.
        // Concepts used in just one unit are put into a group per unit.
        // Concepts used in more than one unit are put in a 'common' group.
        const analyser = new LanguageAnalyser();
        analyser.analyseModel(this.language);

        // Create in memory all grammar rules and syntax analysis methods
        const grammarModel: GrammarModel = grammarGenerator.createGrammar(this.language, analyser, editDef);

        // Write the grammar to file
        generatedContent = grammarModel.toGrammar();
        // test the generated grammar, if not ok error will be thrown
        this.testGrammar(generatedContent, generationStatus);
        // write the grammar to file
        generatedFilePath = `${this.readerGenFolder}/${Names.grammar(this.language)}.ts`;
        indexContent += `export * from "./${Names.grammar(this.language)}";\n`;
        this.makeFile(`AGL grammar`, generatedFilePath, generatedContent, generationStatus);

        // Write the main syntax analyser to file
        generatedFilePath = `${this.readerGenFolder}/${Names.syntaxAnalyser(this.language)}.ts`;
        indexContent += `export * from "./${Names.syntaxAnalyser(this.language)}";\n`;
        const mainContent = grammarModel.toMethod();
        this.makeFile(`main syntax analyser`, generatedFilePath, mainContent, generationStatus);

        // Write the syntax analysers for each unit to file
        grammarModel.parts.forEach(grammarPart => {
            generatedFilePath = `${this.readerGenFolder}/${Names.unitAnalyser(this.language, grammarPart.unit)}.ts`;
            indexContent += `export * from "./${Names.unitAnalyser(this.language, grammarPart.unit)}";\n`;
            const analyserContent = grammarPart.toMethod(this.language, relativePath);
            let message: string;
            if (!!grammarPart.unit) {
                message = `syntax analyser for unit ${grammarPart.unit?.name}`;
            } else {
                message = "common syntax analyser";
            }
            this.makeFile(message, generatedFilePath, analyserContent, generationStatus);
        });

        // Get the semantic analyser and write it to file
        generatedFilePath = `${this.readerGenFolder}/${Names.semanticAnalyser(this.language)}.ts`;
        indexContent += `export * from "./${Names.semanticAnalyser(this.language)}";\n`;
        generatedContent = analyser.getRefCorrectorContent(this.language, relativePath);
        this.makeFile(`semantic analyser`, generatedFilePath, generatedContent, generationStatus);

        // get the semantic analysis walker and write it to file
        generatedFilePath = `${this.readerGenFolder}/${Names.semanticWalker(this.language)}.ts`;
        indexContent += `export * from "./${Names.semanticWalker(this.language)}";\n`;
        generatedContent = analyser.getRefCorrectorWalkerContent(this.language, relativePath);
        this.makeFile(`semantic analysis walker`, generatedFilePath, generatedContent, generationStatus);

        // get the reader and write it to file
        generatedFilePath = `${this.readerGenFolder}/${Names.reader(this.language)}.ts`;
        indexContent += `export * from "./${Names.reader(this.language)}";\n`;
        generatedContent = readerTemplate.generateReader(this.language, relativePath);
        this.makeFile(`language reader`, generatedFilePath, generatedContent, generationStatus);

        // write the index file for the reader gen folder
        generatedFilePath = `${this.readerGenFolder}/index.ts`;
        this.makeFile(`reader index`, generatedFilePath, indexContent, generationStatus);

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.error(`Generated reader and writer for ${this.language.name} with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(`Succesfully generated reader and writer.`);
        }
    }

    private testGrammar(generatedContent: string, generationStatus: GenerationStatus) {
        try {
            // strip generated content of stuff around the grammar
            let testContent = generatedContent.replace("export const", "// export const ");
            testContent = testContent.replace("}\`; // end of grammar", "}");
            testContent = testContent.replace(new RegExp("\\\\\\\\", "gm"), "\\");
            Agl.processorFromString(testContent, null, null, null);
        } catch (e: unknown) {
            if (e instanceof Error) {
                generationStatus.numberOfErrors += 1;
                LOGGER.error(`Error in creating grammar for ${this.language?.name}: '${e.message}`);
            }
        }
    }

    private getFolderNames() {
        this.writerFolder = this.outputfolder + "/" + WRITER_FOLDER;
        this.readerFolder = this.outputfolder + "/" + READER_FOLDER;
        this.writerGenFolder = this.outputfolder + "/" + WRITER_GEN_FOLDER;
        this.readerGenFolder = this.outputfolder + "/" + READER_GEN_FOLDER;
    }

    private makeFile(generationMessage: string, generatedFilePath: string, generatedContent: string, generationStatus: GenerationStatus) {
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
