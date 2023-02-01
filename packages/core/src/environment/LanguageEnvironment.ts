import { FreProjectionHandler, PiEditor } from "../editor/index";
import { PiEnvironment } from "../environment/index";
import { PiModel } from "../ast/index";
import { FreonInterpreter } from "../interpreter/index";
import { PiReader } from "../reader/index";
import { FreScoperComposite } from "../scoper/index";
import { PiStdlib } from "../stdlib/index";
import { FreCompositeTyper } from "../typer/index";
import { PiValidator } from "../validator/index";
import { PiWriter } from "../writer/index";

// todo explain the relationship between this class and the generated environment
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

    public scoper: FreScoperComposite = null;
    public typer: FreCompositeTyper = null;
    public projection: FreProjectionHandler = null;
    public editor: PiEditor;
    public fileExtensions: Map<string, string>;
    public languageName: string;
    public reader: PiReader;
    public stdlib: PiStdlib;
    public unitNames: string[];
    public validator: PiValidator;
    public writer: PiWriter;
    public interpreter: FreonInterpreter;

    public newModel(modelName: string): PiModel {
        return undefined;
    }

}
