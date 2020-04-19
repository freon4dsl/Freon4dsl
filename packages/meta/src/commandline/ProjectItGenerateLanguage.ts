import { LanguageGenerator } from "../languagedef/generator/LanguageGenerator";
import { ProjectItGeneratePartAction } from "./ProjectItGeneratePartAction";
import { PiLogger } from "../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("ProjectItGenerateLanguage"); // .mute();
export class ProjectItGenerateLanguage extends ProjectItGeneratePartAction {
    private languageGenerator: LanguageGenerator = new LanguageGenerator();

    public constructor() {
        super({
            actionName: "meta-it",
            summary: "Generates the TypeScript code for your language",
            documentation: "Generates TypeScript code for the language defined in the .lang file."
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
