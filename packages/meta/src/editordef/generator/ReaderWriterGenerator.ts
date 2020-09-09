import * as fs from "fs";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiLanguage } from "../../languagedef/metalanguage";
import { GenerationStatus, Helpers, Names, READER_GEN_FOLDER, WRITER_GEN_FOLDER } from "../../utils";
import { PiEditUnit } from "../metalanguage";
import { WriterTemplate, PegjsTemplate, CreatorTemplate, ReaderTemplate } from "./parserTemplates";

const LOGGER = new PiLogger("ParserGenerator"); // .mute();
const peg = require("pegjs");

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
        const pegjsTemplate = new PegjsTemplate();
        const parserTemplate = new ReaderTemplate();
        const creatorTemplate = new CreatorTemplate();

        // Prepare folders
        Helpers.createDirIfNotExisting(this.writerGenFolder);
        Helpers.deleteFilesInDir(this.writerGenFolder, generationStatus);
        Helpers.createDirIfNotExisting(this.readerGenFolder);
        Helpers.deleteFilesInDir(this.readerGenFolder, generationStatus);

        // set relative path to get the imports right
        const relativePath = "../../";

        //  Generate it
        LOGGER.log(`Generating language writer: ${this.writerGenFolder}/${Names.writer(this.language)}.ts`);
        const unparserFile = Helpers.pretty(unparserTemplate.generateUnparser(this.language, editDef, relativePath), "Writer Class", generationStatus);
        fs.writeFileSync(`${this.writerGenFolder}/${Names.writer(this.language)}.ts`, unparserFile);

        LOGGER.log(`Generating unit parsers creator part: ${this.readerGenFolder}/${Names.parserCreator(this.language)}.ts`);
        const creatorFile = Helpers.pretty(creatorTemplate.generateCreatorPart(this.language, editDef, relativePath), "Creator Functions", generationStatus);
        fs.writeFileSync(`${this.readerGenFolder}/${Names.parserCreator(this.language)}.ts`, creatorFile);

        LOGGER.log(`Generating language reader: ${this.readerGenFolder}/${Names.reader(this.language)}.ts`);
        const parserFile = Helpers.pretty(parserTemplate.generateParser(this.language, editDef, relativePath), "Reader Class", generationStatus);
        fs.writeFileSync(`${this.readerGenFolder}/${Names.reader(this.language)}.ts`, parserFile);

        this.language.units.forEach(unit => {
            LOGGER.log(`Generating unit parser (pegjs input): ${this.readerGenFolder}/${Names.pegjs(unit)}.pegjs`);
            const pegjsFile = pegjsTemplate.generatePegjsForUnit(this.language, unit, editDef);
            fs.writeFileSync(`${this.readerGenFolder}/${Names.pegjs(unit)}.pegjs`, pegjsFile);

            try {
                LOGGER.log(`Generating unit parser (pegjs output): ${this.readerGenFolder}/${Names.pegjs(unit)}.js`);
                const pegjsParser = peg.generate(pegjsFile, { output: "source", format: "commonjs" });
                fs.writeFileSync(`${this.readerGenFolder}/${Names.pegjs(unit)}.js`, pegjsParser);
            } catch (e) {
                generationStatus.numberOfErrors += 1;

                // we remove the last dot of the error message, because the message is contained in another sentence
                LOGGER.error(this, `Error in call to pegjs: '${e.message.replace(/\.$/, '')}' [line: ${e.location?.start.line}, column: ${e.location?.start.column}] in file '${Names.pegjs(unit)}'.`);
            }
        });

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.info(this, `Generated reader and writer for ${this.language.name} with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(this, `Succesfully generated reader and writer.`);
        }
    }
}
