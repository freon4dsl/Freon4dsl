import * as fs from "fs";
import { MetaLogger } from "../../utils/MetaLogger";
import { PiConcept, PiLanguage } from "../../languagedef/metalanguage";
import { GenerationStatus, Helpers, Names, READER_GEN_FOLDER, WRITER_GEN_FOLDER } from "../../utils";
import { PiEditUnit } from "../metalanguage";
import { WriterTemplate, ReaderTemplate } from "./parserTemplates";
import { ParserGenerator } from "./parserTemplates/ParserGenerator";
import { net } from "net.akehurst.language-agl-processor";
import Agl = net.akehurst.language.agl.processor.Agl;
import * as console from "console";

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
        const parserGenerator = new ParserGenerator();
        let correctUnits: PiConcept[] = [];

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
            // analyse the unit an dgenerate the grammar and analyser together
            parserGenerator.generateParserForUnit(this.language, unit, editDef);
            // get the grammar and write it to file
            generatedFilePath = `${this.readerGenFolder}/${Names.grammar(unit)}.ts`;
            generatedContent  = parserGenerator.getGrammarContent();
            generationMessage = `agl grammar for unit`;
            this.makeFile(generationMessage, generatedFilePath, generatedContent, generationStatus);
            // test the generated grammar, if not ok error will be thrown, otherwise add this unit to the list of correct units
            try {
                // strip generated content of stuff around the grammar
                generatedContent = generatedContent.replace("export const", "// export const " );
                generatedContent = generatedContent.replace("}\`; // end of grammar", "}" );
                generatedContent = generatedContent.replace(new RegExp("\\\\\\\\", "gm"), "\\" );
                const testParser = Agl.processorFromString(generatedContent, null, null, null);
                // if all went well, we can conclude that the grammar for this unit is correct
                correctUnits.push(unit);
            } catch (e) {
                generationStatus.numberOfErrors += 1;
                LOGGER.error(this, `Error in creating parser for ${unit.name}: '${e.message}`);
            }
            // get the analyser and write it to file
            generatedFilePath = `${this.readerGenFolder}/${Names.syntaxAnalyser(unit)}.ts`;
            generatedContent  = parserGenerator.getSyntaxAnalyserContent(relativePath);
            generationMessage = `syntax analyser for unit`;
            this.makeFile(generationMessage, generatedFilePath, generatedContent, generationStatus);
        });

        LOGGER.log(`Generating language reader: ${this.readerGenFolder}/${Names.reader(this.language)}.ts`);
        const readerFile = Helpers.pretty(readerTemplate.generateReader(this.language, editDef, correctUnits, relativePath), "Reader Class", generationStatus);
        fs.writeFileSync(`${this.readerGenFolder}/${Names.reader(this.language)}.ts`, readerFile);

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
