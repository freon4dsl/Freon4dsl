import * as fs from "fs";
import { MetaLogger } from "../../utils/MetaLogger";
import { PiLanguage } from "../../languagedef/metalanguage";
import { GenerationStatus, Helpers, Names, READER_GEN_FOLDER, WRITER_GEN_FOLDER } from "../../utils";
import { PiEditUnit } from "../metalanguage";
import { WriterTemplate, ReaderTemplate, GrammarTemplate, SyntaxAnalyserTemplate } from "./parserTemplates";
import { Analyser } from "./parserTemplates/Analyser";
import { ParserGenerator } from "./parserTemplates/ParserGenerator";

const LOGGER = new MetaLogger("ReaderWriterGenerator"); // .mute();

export class ReaderWriterGenerator {
    public outputfolder: string = ".";
    protected writerGenFolder: string;
    protected readerGenFolder: string;
    language: PiLanguage;

    generate(editDef: PiEditUnit): void {
        const generationStatus = new GenerationStatus();
        this.writerGenFolder = this.outputfolder + "/" + WRITER_GEN_FOLDER;
        this.readerGenFolder = this.outputfolder + "/" + READER_GEN_FOLDER;
        LOGGER.log("Generating parser and unparser in folder " + this.writerGenFolder + " for language " + this.language?.name);

        const unparserTemplate = new WriterTemplate();
        const readerTemplate = new ReaderTemplate();
        const parserGenerator: ParserGenerator = new ParserGenerator();

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
        let generationMessage = `language writer`;
        this.makeFile(generationMessage, generatedFilePath, generatedContent, generationStatus);

        let noCorrectGrammar: boolean = false;
        this.language.units.forEach(unit => {
            try {
                parserGenerator.generateParserForUnit(this.language, unit, editDef);

                generatedFilePath = `${this.readerGenFolder}/${Names.grammar(unit)}.ts`;
                generatedContent  = parserGenerator.getGrammarContent();
                generationMessage = `agl grammar for unit`;
                this.makeFile(generationMessage, generatedFilePath, generatedContent, generationStatus);

                generatedFilePath = `${this.readerGenFolder}/${Names.syntaxAnalyser(unit)}.ts`;
                generatedContent  = parserGenerator.getSyntaxAnalyserContent(relativePath);
                generationMessage = `syntax analyser for unit`;
                this.makeFile(generationMessage, generatedFilePath, generatedContent, generationStatus);
                // TODO test the generated grammar, if not ok create stub
            } catch (e) {
                generationStatus.numberOfErrors += 1;
                noCorrectGrammar = true;

                // we remove the last dot of the error message, because the message is contained in another sentence
                LOGGER.error(this, `Error in creating parser for ${unit.name}: '${e.message.replace(/\.$/, '')}' [line: ${e.location?.start.line}, column: ${e.location?.start.column}]'.`);
            }
        });

        if (!noCorrectGrammar) {
            LOGGER.log(`Generating language reader: ${this.readerGenFolder}/${Names.reader(this.language)}.ts`);
            const readerFile = Helpers.pretty(readerTemplate.generateReader(this.language, editDef, relativePath), "Reader Class", generationStatus);
            fs.writeFileSync(`${this.readerGenFolder}/${Names.reader(this.language)}.ts`, readerFile);
        } else {
            LOGGER.log(`Generating STUB for language reader: ${this.readerGenFolder}/${Names.reader(this.language)}.ts`);
            const readerFile = Helpers.pretty(readerTemplate.generateStub(this.language, editDef, relativePath), "Reader Class", generationStatus);
            fs.writeFileSync(`${this.readerGenFolder}/${Names.reader(this.language)}.ts`, readerFile);
        }

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.error(this, `Generated reader and writer for ${this.language.name} with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(this, `Succesfully generated reader and writer.`);
        }
    }

    private makeFile(generationMessage: string, generatedFilePath: string, generatedContent: string, generationStatus: GenerationStatus) {
        LOGGER.log(`Generating ${generationMessage}: ${generatedFilePath}`);
        generatedContent = Helpers.pretty(generatedContent, `${generatedFilePath}`, generationStatus);
        fs.writeFileSync(`${generatedFilePath}`, generatedContent);
    }
}
