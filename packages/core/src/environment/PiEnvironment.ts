import { PiCompositeProjection, PiEditor, PiProjection } from "../editor";
import { ProjectionalEditor } from "../editor/components";
import { PiValidator } from "../validator";
import { PiScoper } from "../scoper";
import { PiTyper } from "../typer";
import { PiStdlib } from "../stdlib";
import { PiUnparser } from "../unparser";

export interface PiEnvironment {
    scoper: PiScoper;
    typer: PiTyper;
    validator: PiValidator;
    editor: PiEditor;
    stdlib: PiStdlib;
    unparser: PiUnparser;

    projection: PiCompositeProjection;
    projectionalEditorComponent: ProjectionalEditor;
}
