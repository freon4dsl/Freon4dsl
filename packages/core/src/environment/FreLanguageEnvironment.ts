import { FreProjectionHandler, FreEditor } from "../editor/index";
import { FreEnvironment } from "../environment/index";
import { FreModel } from "../ast/index";
import { FreInterpreter } from "../interpreter/index";
import { FreReader } from "../reader/index";
import { FreScoperComposite } from "../scoper/index";
import { FreStdlib } from "../stdlib/index";
import { FreCompositeTyper } from "../typer/index";
import { FreValidator } from "../validator/index";
import { FreWriter } from "../writer/index";

// todo explain the relationship between this class and the generated environment
export class FreLanguageEnvironment implements FreEnvironment {
    private static theInstance: FreEnvironment = null;

    static setInstance(env: FreEnvironment): void {
        FreLanguageEnvironment.theInstance = env;
    }

    static getInstance(): FreEnvironment {
        if (FreLanguageEnvironment.theInstance === null) {
            FreLanguageEnvironment.theInstance = new FreLanguageEnvironment();
        }
        return FreLanguageEnvironment.theInstance;
    }

    public scoper: FreScoperComposite = null;
    public typer: FreCompositeTyper = null;
    public projection: FreProjectionHandler = null;
    public editor: FreEditor;
    public fileExtensions: Map<string, string>;
    public languageName: string;
    public reader: FreReader;
    public stdlib: FreStdlib;
    public unitNames: string[];
    public validator: FreValidator;
    public writer: FreWriter;
    public interpreter: FreInterpreter;

    public newModel(modelName: string): FreModel {
        return undefined;
    }

}
