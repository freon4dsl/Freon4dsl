import {
    Names,
    PathProvider,
    PROJECTITCORE,
    TYPER_GEN_FOLDER,
    SCOPER_GEN_FOLDER,
    VALIDATOR_GEN_FOLDER,
    EDITOR_FOLDER,
    EDITOR_GEN_FOLDER, ENVIRONMENT_GEN_FOLDER, LANGUAGE_GEN_FOLDER, STDLIB_GEN_FOLDER, UNPARSER_GEN_FOLDER
} from "../../../utils/";
import { PiLanguageUnit } from "../../metalanguage/PiLanguage";

export class EnvironmentTemplate {
    constructor() {
    }

    generateEnvironment(language: PiLanguageUnit, relativePath: string): string {
        return `
        import { ${Names.PiEditor}, ${Names.CompositeProjection}, ${Names.PiEnvironment}, ${Names.PiProjection}, ${Names.PiScoper}, 
                        ${Names.PiTyper}, ${Names.PiValidator}, ${Names.PiStdlib}, ${Names.PiUnparser} } from "${PROJECTITCORE}";
        import { ${Names.ProjectionalEditor} } from "@projectit/core";
        import * as React from "react";
        import { ${Names.actions(language)}, ${Names.context(language)}, ${Names.projectionDefault(language)} } from "${relativePath}${EDITOR_GEN_FOLDER}";
        import { ${Names.scoper(language)} } from "${relativePath}${SCOPER_GEN_FOLDER}/${Names.scoper(language)}";
        import { ${Names.typer(language)}  } from "${relativePath}${TYPER_GEN_FOLDER}/${Names.typer(language)}";
        import { ${Names.validator(language)} } from "${relativePath}${VALIDATOR_GEN_FOLDER}/${Names.validator(language)}";
        import { ${Names.projection(language)} } from "${relativePath}${EDITOR_FOLDER}/${Names.projection(language)}";
        import { ${Names.stdlib(language)}  } from "${relativePath}${STDLIB_GEN_FOLDER}/${Names.stdlib(language)}";
        import { ${Names.unparser(language)}  } from "${relativePath}${UNPARSER_GEN_FOLDER}/${Names.unparser(language)}";
        import { initializeLanguage } from  "${relativePath}${LANGUAGE_GEN_FOLDER}/${Names.language(language)}";
        
        export class ${Names.environment(language)} implements ${Names.PiEnvironment} {       
            private static environment: ${Names.PiEnvironment} ;
        
            public static getInstance(): ${Names.PiEnvironment}  {
                if (this.environment === undefined || this.environment === null) {
                    this.environment = new ${Names.environment(language)}();
                }
                return this.environment;
            }
               
            constructor() {
                const context = new ${Names.context(language)}();
                const actions = new ${Names.actions(language)}();
                const rootProjection = new ${Names.CompositeProjection}("root");
                const projectionManual = new ${Names.projection(language)}("manual");
                const projectionDefault = new ${Names.projectionDefault(language)}("default");
                rootProjection.addProjection(projectionManual);
                rootProjection.addProjection(projectionDefault);
                this.editor = new PiEditor(context, rootProjection, actions);
        
                initializeLanguage();
            }
            
            get projectionalEditorComponent() : ${Names.ProjectionalEditor} {
                if( this._projectionalEditorComponent === null ){
                    this._projectionalEditorComponent = \< ${Names.ProjectionalEditor} editor={this.editor} /\> as any as ${Names.ProjectionalEditor};
                }
                return this._projectionalEditorComponent;
            }    
                
            editor: ${Names.PiEditor};
            scoper: ${Names.PiScoper} = new ${Names.scoper(language)}();
            typer: ${Names.PiTyper} = new ${Names.typer(language)}();
            stdlib: ${Names.PiStdlib} = ${Names.stdlib(language)}.getInstance();
            validator: ${Names.PiValidator} = new ${Names.validator(language)}();
            unparser: ${Names.PiUnparser} = new ${Names.unparser(language)}();
            private _projectionalEditorComponent : ${Names.ProjectionalEditor} = null;
        }`;
    }
}
