import { PiEditor, PiModelInitialization } from "../editor";
import { ProjectionalEditor } from "../editor/components";
import { PiValidator } from "../validator";
import { PiScoper } from "../scoper";
import { PiTyper } from "../typer";
import { PiStdlib } from "../stdlib";
import { PiWriter } from "../writer";
import { PiReader } from "../reader";

// tag::environment-interface[]
export interface PiEnvironment {
    scoper: PiScoper;
    typer: PiTyper;
    validator: PiValidator;
    editor: PiEditor;
    stdlib: PiStdlib;
    writer: PiWriter;
    reader: PiReader;

    projectionalEditorComponent: ProjectionalEditor;
    initializer: PiModelInitialization;
    languageName: string;
    unitNames: string[];
}
// end::environment-interface[]
