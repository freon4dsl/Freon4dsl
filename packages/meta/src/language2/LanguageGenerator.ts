import { ContextTemplate } from "./templates/ContextTemplate";
import { EnumerationTemplate } from "./templates/EnumerationTemplate";
import { LanguageTemplates } from "./templates/LanguageTemplate";
import { WithTypeTemplate } from "./templates/WithTypeTemplate";
import { ProjectionTemplate } from "./templates/ProjectionTemplate";
import { PiLanguageChecker } from "./PiLanguageChecker";
import { ActionsTemplate } from "./templates/ActionsTemplate";
import { PiLanguage } from "./PiLanguage";
import { ConceptTemplate } from "./templates/ConceptTemplate";
import { PiLanguageDef } from "./PiLanguageDef";
import * as fs from "fs";
import parserTypeScript = require("prettier/parser-typescript");

const prettier = require("prettier/standalone");

export class LanguageGenerator {
    outputfolder: string;

    constructor(output: string) {
        this.outputfolder == output;
    }

    generate(model: PiLanguageDef): void {
        const language = new PiLanguage(model);

        const checker = new PiLanguageChecker();
        checker.checkLanguage(language);
        checker.errors.forEach(error => console.log("ERROR: " + error));

        const templates: ConceptTemplate = new ConceptTemplate();
        const actions: ActionsTemplate = new ActionsTemplate();
        const projection: ProjectionTemplate  = new ProjectionTemplate();
        const withTypeTemplate: WithTypeTemplate  = new WithTypeTemplate();
        const languageTemplate: LanguageTemplates  = new LanguageTemplates();
        const enumerationTemplate: EnumerationTemplate  = new EnumerationTemplate();
        const contextTemplate: ContextTemplate  = new ContextTemplate();

        language.concepts.forEach(concept => {
            var generated = this.pretty(templates.generateConcept(concept), "concept "+ concept.name);
            fs.writeFileSync(`gen/${concept.name}.ts`, generated);
        });

        language.enumerations.forEach(enumeration => {
            var generated = this.pretty(enumerationTemplate.generateEnumeration(enumeration), "Enumeration "+ enumeration.name);
            fs.writeFileSync(`gen/${enumeration.name}.ts`, generated);
        });

        var languageFile = this.pretty(languageTemplate.generateLanguage(model, language), "Model info");
        fs.writeFileSync(`gen/${model.name}.ts`, languageFile);

        var withTypeFile = this.pretty(withTypeTemplate.generateTypeInterface(language), "Id Interface");
        fs.writeFileSync(`gen/WithType.ts`, withTypeFile);

        var projectionfile = this.pretty(projection.generateProjection(language), "Projection");
        fs.writeFileSync(`gen/${model.name}Projection.ts`, projectionfile);

        var actionsFile = this.pretty(actions.generateActions(language), "Actions");
        fs.writeFileSync(`gen/${model.name}Actions.ts`, actionsFile);

        var contextFile = this.pretty(contextTemplate.generateContext(language), "Context");
        fs.writeFileSync(`gen/${model.name}Context.ts`, contextFile);
    }

    pretty(typescriptFile: string, message: string): string {
        try {
            const prettyresult = prettier.format(typescriptFile, {
                parser: "typescript",
                printWidth: 140,
                tabWidth: 4,
                plugins: [parserTypeScript]
            });
            return prettyresult;
        } catch (e) {
            console.log("Syntax error: " + message);
            console.log(e.message);
        }
        return typescriptFile;
    }

}
