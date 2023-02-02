import { FreEditor } from "../editor";
import { FreInterpreter } from "../interpreter/index";
import { FreValidator } from "../validator";
import { FreScoperComposite } from "../scoper";
import { FreCompositeTyper } from "../typer";
import { FreStdlib } from "../stdlib";
import { FreWriter } from "../writer";
import { FreReader } from "../reader";
import { FreModel } from "../ast";

export interface FreEnvironment {
    /**
     * Creates a new model, an implementation of the language defined in the .ast file
     * @param name
     */
    newModel(modelName: string): FreModel;

    scoper: FreScoperComposite;
    typer: FreCompositeTyper;
    validator: FreValidator;
    editor: FreEditor;
    stdlib: FreStdlib;
    writer: FreWriter;
    reader: FreReader;
    interpreter: FreInterpreter;

    languageName: string;
    fileExtensions: Map<string, string>;
}

