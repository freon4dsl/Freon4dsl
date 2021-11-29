import * as fs from "fs";
import { MetaLogger } from "../utils/MetaLogger";
import { PiConcept, PiLanguage } from "../languagedef/metalanguage";
import { GenerationStatus, Helpers, Names, READER_FOLDER, READER_GEN_FOLDER, WRITER_FOLDER, WRITER_GEN_FOLDER } from "../utils";
import { PiEditUnit } from "../editordef/metalanguage";
import { WriterTemplate, ReaderTemplate, ParserGenerator } from "./parserTemplates";
import { net } from "net.akehurst.language-agl-processor";
import Agl = net.akehurst.language.agl.processor.Agl;
import { PiUnitDescription } from "../languagedef/metalanguage/PiLanguage";
import { LanguageAnalyser } from "./parserTemplates/LanguageAnalyser";

const LOGGER = new MetaLogger("ReaderWriterGenerator"); // .mute();

export class ReaderWriterGenerator {
    public outputfolder: string = ".";
    public language: PiLanguage;
    private writerFolder: string;
    private writerGenFolder: string;
    private readerFolder: string;
    private readerGenFolder: string;

    generate(editDef: PiEditUnit): void {
        if (this.language == null) {
            LOGGER.error(this, "Cannot generate parser and unparser because language is not set.");
            return;
        }
        const generationStatus = new GenerationStatus();
        this.getFolderNames();
        LOGGER.log("Generating parser and unparser in folder " + this.writerGenFolder + " for language " + this.language?.name);

        const unparserTemplate = new WriterTemplate();
        const readerTemplate = new ReaderTemplate();
        const parserGenerator = new ParserGenerator();
        let correctUnits: PiUnitDescription[] = [];

        // Prepare folders
        Helpers.createDirIfNotExisting(this.writerGenFolder);
        Helpers.deleteFilesInDir(this.writerGenFolder, generationStatus);
        Helpers.createDirIfNotExisting(this.readerGenFolder);
        Helpers.deleteFilesInDir(this.readerGenFolder, generationStatus);

        // set relative path to get the imports right
        const relativePath = "../../";

        //  Generate it
        let generatedFilePath = `${this.writerGenFolder}/${Names.writer(this.language)}.ts`;
        let generatedContent  = unparserTemplate.generateUnparser(this.language, editDef, relativePath);
        this.makeFile(`language writer`, generatedFilePath, generatedContent, generationStatus);

        const analyser = new LanguageAnalyser();
        analyser.analyseModel(this.language);
        parserGenerator.generateCommonParser(this.language, analyser, editDef);
        this.makeGrammarAndSyntaxAnalyser(parserGenerator, correctUnits, null, generationStatus, generatedFilePath, relativePath);

        analyser.unitAnalysers.forEach(unitAnalyser => {
            const unit = unitAnalyser.unit;
            // analyse the unit and generate the grammar and analyser together
            parserGenerator.generateParserForUnit(this.language, unitAnalyser, editDef);
            this.makeGrammarAndSyntaxAnalyser(parserGenerator, correctUnits, unit, generationStatus, generatedFilePath, relativePath);
        });

        // get the semantic analyser and write it to file
        generatedFilePath = `${this.readerGenFolder}/${Names.semanticAnalyser(this.language)}.ts`;
        generatedContent  = parserGenerator.getRefCorrectorContent(relativePath);
        this.makeFile(`semantic analyser`, generatedFilePath, generatedContent, generationStatus);

        // get the semantic analysis walker and write it to file
        generatedFilePath = `${this.readerGenFolder}/${Names.semanticWalker(this.language)}.ts`;
        generatedContent  = parserGenerator.getRefCorrectorWalkerContent(relativePath);
        this.makeFile(`semantic analysis walker`, generatedFilePath, generatedContent, generationStatus);

        // get the reader and write it to file
        generatedFilePath = `${this.readerGenFolder}/${Names.reader(this.language)}.ts`;
        generatedContent  = readerTemplate.generateReader(this.language, editDef, correctUnits, relativePath);
        this.makeFile(`language reader`, generatedFilePath, generatedContent, generationStatus);

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.error(this, `Generated reader and writer for ${this.language.name} with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(this, `Succesfully generated reader and writer.`);
        }
    }

    private makeGrammarAndSyntaxAnalyser(parserGenerator: ParserGenerator, correctUnits: PiUnitDescription[], unit: PiUnitDescription, generationStatus: GenerationStatus, generatedFilePath: string, relativePath: string) {
        // get the grammar
        let generatedContent: string = parserGenerator.getGrammarContent();
        // test the generated grammar, if not ok error will be thrown, otherwise add this unit to the list of correct units
        this.testGrammar(generatedContent, correctUnits, unit, generationStatus);
        // write the grammar to file
        generatedFilePath = `${this.readerGenFolder}/${Names.grammar(unit)}.ts`;
        this.makeFile(`agl grammar for unit`, generatedFilePath, generatedContent, generationStatus);
        // get the analyser and write it to file
        generatedFilePath = `${this.readerGenFolder}/${Names.syntaxAnalyser(unit)}.ts`;
        generatedContent = parserGenerator.getSyntaxAnalyserContent(relativePath);
        this.makeFile(`syntax analyser for unit`, generatedFilePath, generatedContent, generationStatus);
    }

    private testGrammar(generatedContent: string, correctUnits: PiUnitDescription[], unit: PiUnitDescription, generationStatus: GenerationStatus) {
        try {
            // strip generated content of stuff around the grammar
            let testContent = generatedContent.replace("export const", "// export const ");
            testContent = testContent.replace("}\`; // end of grammar", "}");
            testContent = testContent.replace(new RegExp("\\\\\\\\", "gm"), "\\");
            Agl.processorFromString(testContent, null, null, null);
            // if all went well, we can conclude that the grammar for this unit is correct
            if (unit !== null) {
                correctUnits.push(unit);
            }
        } catch (e) {
            generationStatus.numberOfErrors += 1;
            LOGGER.error(this, `Error in creating parser for ${unit?.name}: '${e.message}`);
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
        generatedContent = Helpers.pretty(generatedContent, `${generatedFilePath}`, generationStatus);
        fs.writeFileSync(`${generatedFilePath}`, generatedContent);
    }

    clean(force: boolean) {
        this.getFolderNames();
        Helpers.deleteDirAndContent(this.writerGenFolder);
        Helpers.deleteDirAndContent(this.readerGenFolder);
        Helpers.deleteDirIfEmpty(this.writerFolder);
        Helpers.deleteDirIfEmpty(this.readerFolder);
    }
}
