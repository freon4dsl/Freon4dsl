import { Names } from "../../../utils/Names";
import { PiLangEnumeration, PiLanguageUnit } from "../../metalanguage/PiLanguage";

export class EnvironmentTemplate {
    constructor() {
    }

    generateEnvironment(language: PiLanguageUnit): string {
        return `
        import { CompositeProjection, PiEnvironment } from "@projectit/core";
        import { PiProjection, PiScoper, PiTyper, PiValidator } from "@projectit/core";
        import { ${language.name}Scoper } from "../scoper/gen/${language.name}Scoper";
        import { ${language.name}Typer } from "../typer/${language.name}Typer";
        import { ${language.name}Validator } from "../validator/gen/${language.name}Validator";
        import { ${language.name}Projection } from "./${language.name}Projection";
        import { ${language.name}ProjectionDefault } from "./gen";
        
        export class ${Names.environment(language)} implements PiEnvironment {
        
            private static environment: PiEnvironment;
        
            public static getInstance(): PiEnvironment {
                if (this.environment === undefined || this.environment === null) {
                    this.environment = new ${Names.environment(language)}();
                }
                return this.environment;
            }
        
            constructor() {
                const rootProjection = new CompositeProjection();
                const projectionManual = new ${language.name}Projection();
                const projectionDefault = new ${Names.projection(language)}();
                rootProjection.addProjection("manual", projectionManual);
                rootProjection.addProjection("default", projectionDefault);
        
                this.projection = rootProjection;
            }
        
            projection: PiProjection;
            scoper: PiScoper = new ${language.name}Scoper();
            typer: PiTyper = new ${language.name}Typer();
            validator: PiValidator = new ${language.name}Validator();
        }`;
    }
}
