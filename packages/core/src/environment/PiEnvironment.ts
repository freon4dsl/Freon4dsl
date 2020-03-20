import { PiProjection } from "../editor";
import { PiValidator } from "../validator";
import { PiScoper } from "../scoper";
import { PiTyper } from "../typer";

export interface PiEnvironment {
    scoper: PiScoper;
    typer: PiTyper;
    validator: PiValidator;

    projection: PiProjection;
}
