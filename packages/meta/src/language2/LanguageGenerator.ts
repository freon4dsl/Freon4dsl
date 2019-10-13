import { PiLanguage } from "./PiLanguage";
import { PiLanguageTemplates } from "./PiLanguageTemplates";
import * as fs from "fs";

export class LanguageGenerator {
    outputfolder: string;

    constructor(output: string) {
        this.outputfolder == output;
    }

    generate(model: PiLanguage): void {
        const templates: PiLanguageTemplates = new PiLanguageTemplates();
        model.concepts.forEach(concept => {
            const generated: string = templates.generateMetaClass(concept, model);
            fs.writeFileSync(`gen/${concept.name}.ts`, generated);
        });
        model.enumerations.forEach(enumeration => {
            const generated: string = templates.generateEnumeration(enumeration);
            fs.writeFileSync(`gen/${enumeration.name}.ts`, generated);
        });
    }
}
