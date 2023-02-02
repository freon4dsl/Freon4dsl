import { LanguageGenerator } from "../languagedef/generator/LanguageGenerator";
import { FreonGeneratePartAction } from "./FreonGeneratePartAction";
import { MetaLogger } from "../utils/MetaLogger";

const LOGGER = new MetaLogger("FreonGenerateLanguage"); // .mute();
export class FreonGenerateLanguage extends FreonGeneratePartAction {
    private languageGenerator: LanguageGenerator = new LanguageGenerator();

    public constructor() {
        super({
            actionName: "ast-it",
            summary: "Generates the TypeScript code for your language",
            documentation: "Generates TypeScript code for the language defined in the .ast files."
        });
    }

    generate(): void {
        LOGGER.log("Starting Freon language generation ...");
        super.generate();
        this.languageGenerator.outputfolder = this.outputFolder;
        this.languageGenerator.generate(this.language);
    }
}
