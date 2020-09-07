import * as fs from "fs";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiLanguage } from "../../languagedef/metalanguage";
import { GenerationStatus, Helpers, Names, PARSER_GEN_FOLDER, UNPARSER_GEN_FOLDER } from "../../utils";
import { PiEditUnit } from "../metalanguage";
import { UnparserTemplate, PegjsTemplate, CreatorTemplate, ParserTemplate } from "./parserTemplates";

const LOGGER = new PiLogger("ParserGenerator"); // .mute();
const peg = require("pegjs");

export class ParserGenerator {
    public outputfolder: string = ".";
    protected unparserGenFolder: string;
    protected parserGenFolder: string;
    language: PiLanguage;

    generate(editDef: PiEditUnit): void {
        const generationStatus = new GenerationStatus();
        this.unparserGenFolder = this.outputfolder + "/" + UNPARSER_GEN_FOLDER;
        this.parserGenFolder = this.outputfolder + "/" + PARSER_GEN_FOLDER;
        LOGGER.log("Generating parser and unparser in folder " + this.unparserGenFolder + " for language " + this.language?.name);

        const unparserTemplate = new UnparserTemplate();
        const pegjsTemplate = new PegjsTemplate();
        const parserTemplate = new ParserTemplate();
        const creatorTemplate = new CreatorTemplate();

        // Prepare folders
        Helpers.createDirIfNotExisting(this.unparserGenFolder);
        Helpers.deleteFilesInDir(this.unparserGenFolder, generationStatus);
        Helpers.createDirIfNotExisting(this.parserGenFolder);
        Helpers.deleteFilesInDir(this.parserGenFolder, generationStatus);

        // set relative path to get the imports right
        const relativePath = "../../";

        //  Generate it
        LOGGER.log(`Generating language unparser: ${this.unparserGenFolder}/${Names.unparser(this.language)}.ts`);
        const unparserFile = Helpers.pretty(unparserTemplate.generateUnparser(this.language, editDef, relativePath), "Unparser Class", generationStatus);
        fs.writeFileSync(`${this.unparserGenFolder}/${Names.unparser(this.language)}.ts`, unparserFile);

        LOGGER.log(`Generating language parser creator part: ${this.parserGenFolder}/${Names.parserCreator(this.language)}.ts`);
        const creatorFile = Helpers.pretty(creatorTemplate.generateCreatorPart(this.language, editDef, relativePath), "Creator Functions", generationStatus);
        fs.writeFileSync(`${this.parserGenFolder}/${Names.parserCreator(this.language)}.ts`, creatorFile);

        LOGGER.log(`Generating language parser: ${this.parserGenFolder}/${Names.fileReader(this.language)}.ts`);
        const parserFile = Helpers.pretty(parserTemplate.generateParser(this.language, editDef, relativePath), "Parser Class", generationStatus);
        fs.writeFileSync(`${this.parserGenFolder}/${Names.fileReader(this.language)}.ts`, parserFile);

        this.language.units.forEach(unit => {
            LOGGER.log(`Generating language parser pegjs input: ${this.parserGenFolder}/${Names.pegjs(unit)}.pegjs`);
            const pegjsFile = pegjsTemplate.generatePegjsForUnit(this.language, unit, editDef);
            fs.writeFileSync(`${this.parserGenFolder}/${Names.pegjs(unit)}.pegjs`, pegjsFile);

            try {
                LOGGER.log(`Generating language parser pegjs output: ${this.parserGenFolder}/${Names.pegjs(unit)}.js`);
                const pegjsParser = peg.generate(pegjsFile, { output: "source", format: "commonjs" });
                fs.writeFileSync(`${this.parserGenFolder}/${Names.pegjs(unit)}.js`, pegjsParser);
            } catch (e) {
                generationStatus.numberOfErrors += 1;

                // we remove the last dot of the error message, because the message is contained in another sentence
                LOGGER.error(this, `Error in call to pegjs: '${e.message.replace(/\.$/, '')}' [line: ${e.location?.start.line}, column: ${e.location?.start.column}] in file '${Names.pegjs(unit)}'.`);
            }
        });

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.info(this, `Generated parser and unparser for ${this.language.name} with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(this, `Succesfully generated parser and unparser`);
        }
    }
}
