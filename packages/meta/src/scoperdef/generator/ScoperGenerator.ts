import { Helpers } from "../../utils/Helpers";
import { PiLanguageUnit } from "../../languagedef/metalanguage/PiLanguage";
import * as fs from "fs";
import { SCOPER_FOLDER, SCOPER_GEN_FOLDER } from "../../utils/GeneratorConstants";
import { NamespaceTemplate } from "./templates/NamespaceTemplate";
import { Names } from "../../utils/Names";
import { ScoperTemplate } from "./templates/ScoperTemplate";
import { PiScopeDef } from "../metalanguage/PiScopeDefLang";
import { PiLogger } from "../../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("ScoperGenerator"); // .mute();
export class ScoperGenerator {
    public outputfolder: string = ".";
    public language: PiLanguageUnit;
    protected scoperGenFolder: string;
    protected scoperFolder: string;

    constructor(language: PiLanguageUnit) {
        this.language = language;
    }

    generate(scopedef: PiScopeDef, verbose: boolean): void {
        this.scoperFolder = this.outputfolder + "/" + SCOPER_FOLDER;
        this.scoperGenFolder = this.outputfolder + "/" + SCOPER_GEN_FOLDER;
        if (verbose) LOGGER.log("Generating scoper '" + scopedef.scoperName + "' in folder " + this.scoperGenFolder);

        const namespace = new NamespaceTemplate();
        const scoper = new ScoperTemplate();

        //Prepare folders
        Helpers.createDirIfNotExisting(this.scoperFolder, verbose);
        Helpers.createDirIfNotExisting(this.scoperGenFolder, verbose);

        //  Generate it
        if (verbose) LOGGER.log("Generating Namespace");
        var namespaceFile = Helpers.pretty(namespace.generateNamespace(this.language, scopedef), "Namespace Class", verbose);
        fs.writeFileSync(`${this.scoperGenFolder}/${Names.namespace(this.language, scopedef)}.ts`, namespaceFile);
        
        if (verbose) LOGGER.log("Generating Scoper");
        var scoperFile = Helpers.pretty(scoper.generateScoper(this.language, scopedef), "Scoper Class", verbose);
        fs.writeFileSync(`${this.scoperGenFolder}/${Names.scoper(this.language, scopedef)}.ts`, scoperFile);

        // var scoperIndexFile = Helpers.pretty(ScoperIndexTemplate.generateIndex(this.language), "Scoper Index");
        // fs.writeFileSync(`${this.scoperFolder}/index.ts`, scoperIndexFile);

        if (verbose) LOGGER.log("Succesfully generated scoper: " + scopedef?.scoperName);

    } 
}
