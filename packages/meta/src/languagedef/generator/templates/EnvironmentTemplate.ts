import { Names, PathProvider } from "../../../utils/";
import { PiLanguageUnit } from "../../metalanguage/PiLanguage";

export class EnvironmentTemplate {
    constructor() {
    }

    generateEnvironment(language: PiLanguageUnit, relativePath: string): string {
        return `
        import { ${Names.CompositeProjection}, ${Names.PiEnvironment}, ${Names.PiProjection}, ${Names.PiScoper}, ${Names.PiTyper}, ${Names.PiValidator} } from "${PathProvider.corePath}";
        import { ${Names.scoper(language)} } from "${relativePath}${PathProvider.scoperGenFolder}${Names.scoper(language)}";
        import { ${Names.typer(language)}  } from "${relativePath}${PathProvider.typerGenFolder}${Names.typer(language)}";
        import { ${Names.validator(language)} } from "${relativePath}${PathProvider.validatorGenFolder}${Names.validator(language)}";
        import { ${Names.projection(language)} } from "${relativePath}${PathProvider.editorFolder}${Names.projection(language)}";
        
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
