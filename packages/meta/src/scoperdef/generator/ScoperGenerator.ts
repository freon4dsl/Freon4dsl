import { Helpers } from "../../utils/Helpers";
import { PiLanguageUnit } from "../../languagedef/metalanguage/PiLanguage";
import * as fs from "fs";
import { SCOPER_FOLDER, SCOPER_GEN_FOLDER } from "../../utils/GeneratorConstants";
// import { PiScoperChecker } from "metalanguage/scoper/PiScoperChecker";
import { NamespaceTemplate } from "./templates/NamespaceTemplate";
import { Names } from "../../utils/Names";
import { ScoperTemplate } from "./templates/ScoperTemplate";
//import { ScoperIndexTemplate } from "./templates/ScoperIndexTemplate";
import { PiScopeDef } from "../metalanguage/PiScopeDefLang";

export class ScoperGenerator {
    public outputfolder: string = ".";
    public language: PiLanguageUnit;
    protected scoperGenFolder: string;
    protected scoperFolder: string;

    constructor(language: PiLanguageUnit) {
        this.language = language;
    }

    generate(scopedef: PiScopeDef): void {
        console.log("Start scoper generator");

        const namespace = new NamespaceTemplate();
        const scoper = new ScoperTemplate();

        //Prepare folders
        this.scoperFolder = this.outputfolder + "/" + SCOPER_FOLDER;
        this.scoperGenFolder = this.outputfolder + "/" + SCOPER_GEN_FOLDER;
        Helpers.createDirIfNotExisting(this.scoperFolder);
        Helpers.createDirIfNotExisting(this.scoperGenFolder);

        //  Generate it
        console.log("\t-generating Namespace.ts");
        var namespaceFile = Helpers.pretty(namespace.generateNamespace(this.language, scopedef), "Namespace Class");
        fs.writeFileSync(`${this.scoperGenFolder}/${Names.namespace(this.language, scopedef)}.ts`, namespaceFile);
        
        console.log("\t-generating Scoper.ts");
        var scoperFile = Helpers.pretty(scoper.generateScoper(this.language, scopedef), "Scoper Class");
        fs.writeFileSync(`${this.scoperGenFolder}/${Names.scoper(this.language, scopedef)}.ts`, scoperFile);

        // var scoperIndexFile = Helpers.pretty(ScoperIndexTemplate.generateIndex(this.language), "Scoper Index");
        // fs.writeFileSync(`${this.scoperFolder}/index.ts`, scoperIndexFile);
    } 
}
