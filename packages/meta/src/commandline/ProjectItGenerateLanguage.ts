import { LanguageGenerator } from "../languagedef/generator/LanguageGenerator";
import { ProjectItGeneratePartAction } from "./ProjectItGeneratePartAction";
import { MetaLogger } from "../utils/MetaLogger";

const LOGGER = new MetaLogger("ProjectItGenerateLanguage"); // .mute();
export class ProjectItGenerateLanguage extends ProjectItGeneratePartAction {
    private languageGenerator: LanguageGenerator = new LanguageGenerator();

    public constructor() {
        super({
            actionName: "ast-it",
            summary: "Generates the TypeScript code for your language",
            documentation: "Generates TypeScript code for the language defined in the .ast file."
        });
    }

    generate(): void {
        LOGGER.log("Starting ProjectIt language generation ...");
        super.generate();
        this.languageGenerator.outputfolder = this.outputFolder;
        this.languageGenerator.generate(this.language);
    }

    protected onDefineParameters(): void {
        super.onDefineParameters();
    }
}
