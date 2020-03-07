import { CommandLineStringParameter } from "@microsoft/ts-command-line";
import { ValidatorGenerator } from "../validatordef/generator/ValidatorGenerator";
import { LanguageParser } from "../languagedef/parser/LanguageParser";
import { ScoperParser } from "../scoperdef/parser/ScoperParser";
import { ProjectItGenerateAction } from "./ProjectitGenerateAction";

export class ProjectItGenerateValidator extends ProjectItGenerateAction {
    private scopeFile: CommandLineStringParameter;
    // protected languageGenerator: LanguageGenerator = new LanguageGenerator();
    protected validatorGenerator: ValidatorGenerator;

    public constructor() {
        super({
            actionName: "generate-validator",
            summary: "Generates the TypeScript code for the validator for your language",
            documentation: "Generates TypeScript code for the validator of language defined in the .lang file. The validator definition is found in the .valid file."
        });
    }

    generate(): void {
        const language = new LanguageParser().parse(this.languageFile); 
        // only read the .lang file, no need to generate
        // this.languageGenerator.outputfolder = this.outputFolder;
        // this.languageGenerator.generate(language);

        // scoperParser needs language because it has to perform checks!
        // const scoper = new ScoperParser(language).parse(this.scopeFile.value);

        // scoperGenerator needs language because ??? TODO
        this.validatorGenerator = new ValidatorGenerator(language);
        this.validatorGenerator.outputfolder = this.outputFolder;
        this.validatorGenerator.generate(null);
    }

    protected onDefineParameters(): void {
        this.scopeFile = this.defineStringParameter({
            argumentName: "VALIDATE",
            defaultValue: "LanguageDefinition.valid",
            parameterLongName: "--valid",
            parameterShortName: "-v",
            description: "Validation Definition file"
        });
    }
}
