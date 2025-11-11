import type { FreEditor, FreProjectionHandler } from "../editor/index.js"
import type { FreInterpreter } from "../interpreter/index.js";
import type { FreValidator } from "../validator/index.js";
import type { FreCompositeScoper } from "../scoper/index.js";
import type { FreCompositeTyper } from "../typer/index.js";
import type { FreWriter } from "../writer/index.js";
import type { FreReader } from "../reader/index.js";
import type { FreModel } from "../ast/index.js";
import type { FreStdlib } from '../stdlib';

export type FreEnvironment = {
    /**
     * Creates a new model, an implementation of the language defined in the .ast file
     * @param modelName
     */
    newModel(modelName: string): FreModel;

    scoper: FreCompositeScoper;
    typer: FreCompositeTyper;
    validator: FreValidator;
    editor: FreEditor;
    writer: FreWriter;
    reader: FreReader;
    interpreter: FreInterpreter;
    stdlib: FreStdlib;
    projectionHandler: FreProjectionHandler;

    languageName: string;
    fileExtensions: Map<string, string>;
}
