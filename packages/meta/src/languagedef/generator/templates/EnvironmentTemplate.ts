import { Names, PathProvider, PROJECTITCORE, TYPER_GEN_FOLDER, SCOPER_GEN_FOLDER, VALIDATOR_GEN_FOLDER, EDITOR_FOLDER } from "../../../utils/";
import { PiLanguageUnit } from "../../metalanguage/PiLanguage";

export class EnvironmentTemplate {
    constructor() {
    }

    generateEnvironment(language: PiLanguageUnit, relativePath: string): string {
        return `
        import { ${Names.CompositeProjection}, ${Names.PiEnvironment}, ${Names.PiProjection}, ${Names.PiScoper}, ${Names.PiTyper}, ${Names.PiValidator} } from "${PROJECTITCORE}";
        import { ${Names.scoper(language)} } from "${relativePath}${SCOPER_GEN_FOLDER}/${Names.scoper(language)}";
        import { ${Names.typer(language)}  } from "${relativePath}${TYPER_GEN_FOLDER}/${Names.typer(language)}";
        import { ${Names.validator(language)} } from "${relativePath}${VALIDATOR_GEN_FOLDER}/${Names.validator(language)}";
        import { ${Names.projection(language)} } from "${relativePath}${EDITOR_FOLDER}/${Names.projection(language)}";
        
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
