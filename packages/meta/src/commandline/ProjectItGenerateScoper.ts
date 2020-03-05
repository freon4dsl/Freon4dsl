import { CommandLineStringParameter } from "@microsoft/ts-command-line";
import { EditorGenerator } from "../generator/editor/EditorGenerator";
import { LanguageGenerator } from "../generator/language/LanguageGenerator";
import { ScoperGenerator } from "../generator/scoper/ScoperGenerator";
import { EditorParser } from "../parser/editor/EditorParser";
import { LanguageParser } from "../parser/language/LanguageParser";
import { ScoperParser } from "../parser/scoper/ScoperParser";
import { ProjectItGenerateAction } from "./ProjectitGenerateAction";

export class ProjectItGenerateScoper extends ProjectItGenerateAction {
    private scopeFile: CommandLineStringParameter;
    // protected languageGenerator: LanguageGenerator = new LanguageGenerator();
    protected scoperGenerator: ScoperGenerator;

    public constructor() {
        super({
            actionName: "generate-scoper",
            summary: "Generates the TypeScript code for the scoper for your language",
            documentation: "Generates TypeScript code for the scoper of language defined in the .lang file. The scoper definition is found in the .scop file."
        });
    }

    generate(): void {
        const language = new LanguageParser().parse(this.languageFile); 
        // only read the .lang file, no need to generate
        // this.languageGenerator.outputfolder = this.outputFolder;
        // this.languageGenerator.generate(language);

        // scoperParser needs language because it has to perform checks!
        const scoper = new ScoperParser(language).parse(this.scopeFile.value);

        // scoperGenerator needs language because ??? TODO
        this.scoperGenerator = new ScoperGenerator(language);
        this.scoperGenerator.outputfolder = this.outputFolder;
        this.scoperGenerator.generate(scoper);
    }

    protected onDefineParameters(): void {
        this.scopeFile = this.defineStringParameter({
            argumentName: "SCOPE",
            defaultValue: "LanguageDefinition.scop",
            parameterLongName: "--scope",
            parameterShortName: "-s",
            description: "Scope Definition file"
        });
    }
}
