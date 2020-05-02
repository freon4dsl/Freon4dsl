import { PiEditor, PiProjection } from "../editor";
import { ProjectionalEditor } from "../editor/components";
import { PiValidator } from "../validator";
import { PiScoper } from "../scoper";
import { PiTyper } from "../typer";
import { PiStdlib } from "../stdlib";

export interface PiEnvironment {
    scoper: PiScoper;
    typer: PiTyper;
    validator: PiValidator;
    editor: PiEditor;
    stdlib: PiStdlib;

    projection: PiProjection;
    projectionalEditorComponent: ProjectionalEditor;
}
