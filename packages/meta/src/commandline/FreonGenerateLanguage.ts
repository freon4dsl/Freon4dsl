import { LanguageGenerator } from "../languagedef/generator/LanguageGenerator.js";
import { FreonGeneratePartAction } from "./FreonGeneratePartAction.js";
import { MetaLogger } from "../utils/no-dependencies/index.js";

const LOGGER = new MetaLogger("FreonGenerateLanguage"); // .mute();
export class FreonGenerateLanguage extends FreonGeneratePartAction {
    private languageGenerator: LanguageGenerator = new LanguageGenerator();

    public constructor() {
        super({
            actionName: "ast-it",
            summary: "Generates the TypeScript code for your language",
            documentation: "Generates TypeScript code for the language defined in the .ast files.",
        });
    }

    generate(): void {
        LOGGER.log("Starting Freon language generation ...");
        super.generate();
        this.languageGenerator.outputfolder = this.outputFolder;
        if (this.language !== null && this.language !== undefined) {
            this.languageGenerator.generate(this.language);
        }
    }
}
