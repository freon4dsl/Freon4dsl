import {
    Names,
    PROJECTITCORE,
    TYPER_GEN_FOLDER,
    SCOPER_GEN_FOLDER,
    VALIDATOR_GEN_FOLDER,
    EDITOR_FOLDER,
    EDITOR_GEN_FOLDER, LANGUAGE_GEN_FOLDER, STDLIB_GEN_FOLDER, UNPARSER_GEN_FOLDER
} from "../../../utils/";
import { PiLanguageUnit } from "../../metalanguage/PiLanguage";

export class EnvironmentTemplate {
    constructor() {
    }

    generateEnvironment(language: PiLanguageUnit, relativePath: string): string {
        const placeHolderConceptName = Names.concept(language.expressionPlaceHolder);
        return `
        import { projectitConfiguration } from "../../projectit/ProjectitConfiguration";
        import { ${Names.PiEditor}, ${Names.CompositeProjection}, ${Names.PiEnvironment}, ${Names.PiProjection}, ${Names.PiScoper}, 
                        ${Names.PiTyper}, ${Names.PiValidator}, ${Names.PiStdlib}, ${Names.PiUnparser}, ${Names.PiModelInitialization} } from "${PROJECTITCORE}";
        import { ${Names.ProjectionalEditor} } from "@projectit/core";
        import * as React from "react";
        import { ${Names.actions(language)}, ${Names.projectionDefault(language)} } from "${relativePath}${EDITOR_GEN_FOLDER}";
        import { ${Names.scoper(language)} } from "${relativePath}${SCOPER_GEN_FOLDER}/${Names.scoper(language)}";
        import { ${Names.typer(language)}  } from "${relativePath}${TYPER_GEN_FOLDER}/${Names.typer(language)}";
        import { ${Names.validator(language)} } from "${relativePath}${VALIDATOR_GEN_FOLDER}/${Names.validator(language)}";
        import { ${Names.customProjection(language)} } from "${relativePath}${EDITOR_FOLDER}/${Names.customProjection(language)}";
        import { ${Names.stdlib(language)}  } from "${relativePath}${STDLIB_GEN_FOLDER}/${Names.stdlib(language)}";
        import { ${Names.unparser(language)}  } from "${relativePath}${UNPARSER_GEN_FOLDER}/${Names.unparser(language)}";
        import { ${Names.initialization(language)} } from "${relativePath}${EDITOR_FOLDER}/${Names.initialization(language)}";

        import { initializeLanguage } from  "${relativePath}${LANGUAGE_GEN_FOLDER}/${Names.language(language)}";
        ${(placeHolderConceptName === "" ? "" : `import { ${placeHolderConceptName} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";`)}
        
        /**
         * Class ${Names.environment(language)} provides the link between all parts of the language environment.
         * It holds the currently used editor, scoper, typer, etc, thus providing an entry point for
         * for instance, the editor to find the right scoper, or for the validator to find the typer
         * to use.
         * This class uses the singleton pattern to ensure that only one instance of the class is present.
         */
        export class ${Names.environment(language)} implements ${Names.PiEnvironment} {       
            private static environment: ${Names.PiEnvironment}; // the only instance of this class
        
            /**
             * This method implements the singleton pattern
             */
            public static getInstance(): ${Names.PiEnvironment}  {
                if (this.environment === undefined || this.environment === null) {
                    this.environment = new ${Names.environment(language)}();
                }
                return this.environment;
            }
             
            /**
             * A private constructor, as demanded by the singleton pattern.
             */  
            private constructor() {
                const actions = new ${Names.actions(language)}();
                const rootProjection = new ${Names.CompositeProjection}("root");
                const projectionManual = new ${Names.customProjection(language)}("manual");
                const projectionDefault = new ${Names.projectionDefault(language)}("default");
                rootProjection.addProjection(projectionManual);
                rootProjection.addProjection(projectionDefault);
                this.editor = new PiEditor(rootProjection, actions);
                this.editor.getPlaceHolderExpression = () => {
                    return new ${placeHolderConceptName}();
                }
                this.editor.rootElement = projectitConfiguration.customInitialization.initialize();
                initializeLanguage();
            }
            
            /**
             * Because the actual editor is an instance of a class from the ProjectIt core package,
             * this method provides an entry point to the content of the editor.
             * TODO improve comment
             */
            get projectionalEditorComponent() : ${Names.ProjectionalEditor} {
                if( this._projectionalEditorComponent === null ){
                    this._projectionalEditorComponent = \< ${Names.ProjectionalEditor} editor={this.editor} /\> as any as ${Names.ProjectionalEditor};
                }
                return this._projectionalEditorComponent;
            }    
            
            // the parts of the language environment              
            editor: ${Names.PiEditor};
            scoper: ${Names.PiScoper} = new ${Names.scoper(language)}();
            typer: ${Names.PiTyper} = new ${Names.typer(language)}();
            stdlib: ${Names.PiStdlib} = ${Names.stdlib(language)}.getInstance();
            validator: ${Names.PiValidator} = new ${Names.validator(language)}();
            unparser: ${Names.PiUnparser} = new ${Names.unparser(language)}();
            initializer: ${Names.PiModelInitialization} = new ${Names.initialization(language)}();
            languageName: string = "${language.name}";
            private _projectionalEditorComponent : ${Names.ProjectionalEditor} = null;
        }`;
    }
}
