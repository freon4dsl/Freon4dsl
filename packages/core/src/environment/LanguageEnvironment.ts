import { PiEditor, PiProjection } from "../editor/index";
import { PiEnvironment } from "../environment/index";
import { PiModel } from "../ast/index";
import { PiReader } from "../reader/index";
import { PiScoper } from "../scoper/index";
import { PiStdlib } from "../stdlib/index";
import { PiTyper } from "../typer/index";
import { PiValidator } from "../validator/index";
import { PiWriter } from "../writer/index";

export class LanguageEnvironment implements PiEnvironment {
    private static theInstance: PiEnvironment = null;

    static setInstance(env: PiEnvironment): void {
        LanguageEnvironment.theInstance = env;
    }

    static getInstance(): PiEnvironment {
        if (LanguageEnvironment.theInstance === null) {
            LanguageEnvironment.theInstance = new LanguageEnvironment();
        }
        return LanguageEnvironment.theInstance;
    }

    public scoper: PiScoper = null;
    public typer: PiTyper = null;
    public projection: PiProjection = null;
    public editor: PiEditor;
    public fileExtensions: Map<string, string>;
    public languageName: string;
    public reader: PiReader;
    public stdlib: PiStdlib;
    public unitNames: string[];
    public namedConcepts: string[];
    public validator: PiValidator;
    public writer: PiWriter;

    public newModel(modelName: string): PiModel {
        return undefined;
    }

}
