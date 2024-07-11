import { FreEditor } from "../editor";
import { FreInterpreter } from "../interpreter";
import { FreValidator } from "../validator";
import { FreScoperComposite } from "../scoper";
import { FreCompositeTyper } from "../typer";
import { FreWriter } from "../writer";
import { FreReader } from "../reader";
import { FreModel } from "../ast";

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

    languageName: string;
    fileExtensions: Map<string, string>;
}
