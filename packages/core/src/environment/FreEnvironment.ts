import { FreEditor, FreProjectionHandler } from "../editor/index.js"
import { FreInterpreter } from "../interpreter/index.js";
import { FreValidator } from "../validator/index.js";
import { FreScoperComposite } from "../scoper/index.js";
import { FreCompositeTyper } from "../typer/index.js";
import { FreWriter } from "../writer/index.js";
import { FreReader } from "../reader/index.js";
import { FreModel } from "../ast/index.js";

export interface FreEnvironment {
    /**
     * Creates a new model, an implementation of the language defined in the .ast file
     * @param modelName
     */
    newModel(modelName: string): FreModel;

    scoper: FreScoperComposite;
    typer: FreCompositeTyper;
    validator: FreValidator;
    editor: FreEditor;
    writer: FreWriter;
    reader: FreReader;
    interpreter: FreInterpreter;
    projectionHandler: FreProjectionHandler;

    languageName: string;
    fileExtensions: Map<string, string>;
}
