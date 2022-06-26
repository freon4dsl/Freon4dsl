import { PiEditor } from "../editor";
import { PiValidator } from "../validator";
import { PiScoper } from "../scoper";
import { PiTyper } from "../typer";
import { PiStdlib } from "../stdlib";
import { PiWriter } from "../writer";
import { PiReader } from "../reader";
import { PiModel } from "../ast";

// tag::environment-interface[]
export interface PiEnvironment {
    /**
     * Creates a new model, an implementation of the language defined in the .ast file
     * @param name
     */
    newModel(modelName: string): PiModel;

    scoper: PiScoper;
    typer: PiTyper;
    validator: PiValidator;
    editor: PiEditor;
    stdlib: PiStdlib;
    writer: PiWriter;
    reader: PiReader;

    languageName: string;
    unitNames: string[];
    namedConcepts: string[];    // the type names of all concepts/interfaces that have a name property
    fileExtensions: Map<string, string>;
}
// end::environment-interface[]
