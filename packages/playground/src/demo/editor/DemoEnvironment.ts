import { CompositeProjection, PiEnvironment } from "@projectit/core";
import { PiProjection, PiScoper, PiTyper, PiValidator } from "@projectit/core";
import { DemoScoper } from "../scoper/gen/DemoScoper";
import { DemoTyper } from "../typer/gen/DemoTyper";
import { DemoValidator } from "../validator/gen/DemoValidator";
import { DemoProjection } from "./DemoProjection";
import { DemoProjectionDefault } from "./gen";

export class DemoEnvironment implements PiEnvironment {

    private static environment: PiEnvironment;

    public static getInstance(): PiEnvironment {
        if (this.environment === undefined || this.environment === null) {
            this.environment = new DemoEnvironment();
        }
        return this.environment;
    }

    constructor() {
        const rootProjection = new CompositeProjection();
        const projectionManual = new DemoProjection();
        const projectionDefault = new DemoProjectionDefault();
        rootProjection.addProjection("manual", projectionManual);
        rootProjection.addProjection("default", projectionDefault);

        this.projection = rootProjection;
    }

    projection: PiProjection;
    scoper: PiScoper = new DemoScoper();
    typer: PiTyper = new DemoTyper();
    validator: PiValidator = new DemoValidator();
}
