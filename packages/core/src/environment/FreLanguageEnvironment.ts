import { FreProjectionHandler, FreEditor } from "../editor";
import { FreEnvironment } from "./FreEnvironment";
import { FreModel } from "../ast";
import { FreInterpreter } from "../interpreter";
import { FreReader } from "../reader";
import { FreScoperComposite } from "../scoper";
import { FreStdlib } from "../stdlib";
import { FreCompositeTyper } from "../typer";
import { FreValidator } from "../validator";
import { FreWriter } from "../writer";

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

    // @ts-ignore
    // function needs to be implemented because it is part of the interface FreEnvironment
    public newModel(modelName: string): FreModel {
        return undefined;
    }
}
