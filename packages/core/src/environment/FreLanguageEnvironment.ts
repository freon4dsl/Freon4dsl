import { FreProjectionHandler, FreEditor } from "../editor/index.js";
import type { FreEnvironment } from "./FreEnvironment.js";
import type { FreModel } from "../ast/index.js";
import type { FreInterpreter } from "../interpreter/index.js";
import type { FreReader } from "../reader/index.js";
import { FreCompositeScoper } from '../scoper/index.js';
import type { FreStdlib } from "../stdlib/index.js";
import { FreCompositeTyper } from "../typer/index.js";
import type { FreValidator } from "../validator/index.js";
import type { FreWriter } from "../writer/index.js";

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

    public scoper: FreCompositeScoper = null;
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
    public projectionHandler: FreProjectionHandler;

    // @ts-ignore
    // function needs to be implemented because it is part of the interface FreEnvironment
    public newModel(modelName: string): FreModel {
        return undefined;
    }
}
