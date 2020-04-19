import { PiEditor, PiProjection } from "../editor";
import { ProjectionalEditor } from "../editor/components";
import { PiValidator } from "../validator";
import { PiScoper } from "../scoper";
import { PiTyper } from "../typer";

export interface PiEnvironment {
    scoper: PiScoper;
    typer: PiTyper;
    validator: PiValidator;
    editor: PiEditor;

    projection: PiProjection;
    projectionalEditorComponent: ProjectionalEditor;
}
