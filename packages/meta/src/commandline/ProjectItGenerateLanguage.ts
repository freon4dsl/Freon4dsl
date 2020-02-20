import { LanguageGenerator } from "../generator/language/LanguageGenerator";
import { LanguageParser } from "../parser/language/LanguageParser";
import { ProjectItGenerateAction } from "./ProjectitGenerateAction";

export class ProjectItGenerateLanguage extends ProjectItGenerateAction {
    protected generator: LanguageGenerator = new LanguageGenerator();

    public constructor() {
        super({
            actionName: "generate-language",
            summary: "Generates the typeScript code for your language",
            documentation: "Generates TypeScript code for the language defined in the .lang file."
        });
    }

    generate(): void {
        const language = new LanguageParser().parse(this.languageFile);
        this.generator.outputfolder = this.outputFolder;
        this.generator.generate(language);
    }

    protected onDefineParameters(): void {
    }
}
