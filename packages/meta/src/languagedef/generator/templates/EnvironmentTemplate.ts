import {
    Names,
    PROJECTITCORE,
    TYPER_GEN_FOLDER,
    SCOPER_GEN_FOLDER,
    VALIDATOR_GEN_FOLDER,
    EDITOR_GEN_FOLDER,
    LANGUAGE_GEN_FOLDER,
    STDLIB_GEN_FOLDER,
    WRITER_GEN_FOLDER,
    READER_GEN_FOLDER,
    INTERPRETER_FOLDER
} from "../../../utils/";
import { PiLanguage } from "../../metalanguage";

export class EnvironmentTemplate {

    generateEnvironment(language: PiLanguage, relativePath: string): string {
        return `
        import { ${Names.PiEditor}, ${Names.CompositeProjection}, ${Names.PiEnvironment}, ${Names.PiReader}, 
                    ${Names.PiScoper}, ${Names.PiTyper}, ${Names.PiValidator}, ${Names.PiStdlib}, 
                    ${Names.PiWriter}, ${Names.FreonInterpreter}, LanguageEnvironment, NewCompositeProjection
               } from "${PROJECTITCORE}";
        import { ${Names.actions(language)}, initializeEditorDef, initializeProjections } from "${relativePath}${EDITOR_GEN_FOLDER}";
        import { ${Names.scoper(language)} } from "${relativePath}${SCOPER_GEN_FOLDER}/${Names.scoper(language)}";
        import { initializeScoperDef } from "${relativePath}${SCOPER_GEN_FOLDER}/${Names.scoperDef(language)}";
        import { ${Names.typer(language)}  } from "${relativePath}${TYPER_GEN_FOLDER}/${Names.typer(language)}";
        import { ${Names.validator(language)} } from "${relativePath}${VALIDATOR_GEN_FOLDER}/${Names.validator(language)}";
        import { ${Names.stdlib(language)}  } from "${relativePath}${STDLIB_GEN_FOLDER}/${Names.stdlib(language)}";
        import { ${Names.writer(language)}  } from "${relativePath}${WRITER_GEN_FOLDER}/${Names.writer(language)}";
        import { ${Names.reader(language)}  } from "${relativePath}${READER_GEN_FOLDER}/${Names.reader(language)}";
        import { ${Names.interpreterName(language)}  } from "${relativePath}${INTERPRETER_FOLDER}/${Names.interpreterName(language)}";
        import { ${Names.classifier(language.modelConcept)}, ${Names.classifier(language.units[0])}, ${Names.initializeLanguage} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";
        import { ${Names.boxProviderCache(language)} } from "${relativePath}${EDITOR_GEN_FOLDER}/${Names.boxProviderCache(language)}";

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
                    LanguageEnvironment.setInstance(this.environment);
                }
                return this.environment;
            }
             
            /**
             * A private constructor, as demanded by the singleton pattern.
             */  
            private constructor() {
                const actions = new ${Names.actions(language)}();
                const myComposite = new NewCompositeProjection();
                // todo adjust the next line for other projects: move to webapp, because every unit has different rootType?
                myComposite.rootProvider = 
                    ${Names.boxProviderCache(language)}.getInstance().getConstructor('${Names.classifier(language.modelConcept.unitTypes()[0])}')();
                this.editor = new PiEditor(myComposite, actions);
                this.editor.environment = this;
                initializeLanguage();
                initializeEditorDef();
                initializeScoperDef();
            }
            
            /**
             * Returns a new model with name 'modelName'.
             * 
             * @param modelName
             */
             newModel(modelName: string) : ${Names.classifier(language.modelConcept)} {        
                const model = new ${Names.classifier(language.modelConcept)}();
                model.name = modelName;
                return model;
             }  
                            
            // the parts of the language environment              
            editor: ${Names.PiEditor};
            scoper: ${Names.PiScoper} = new ${Names.scoper(language)}();
            typer: ${Names.PiTyper} = new ${Names.typer(language)}();
            stdlib: ${Names.PiStdlib} = ${Names.stdlib(language)}.getInstance();
            validator: ${Names.PiValidator} = new ${Names.validator(language)}();
            writer: ${Names.PiWriter} = new ${Names.writer(language)}();
            reader: ${Names.PiReader} = new ${Names.reader(language)}();
            interpreter: ${Names.FreonInterpreter} = new ${Names.interpreterName(language)};
            languageName: string = "${language.name}";
            // the type names of all units
            unitNames: string[] = [${language.modelConcept.unitTypes().map(unit => `"${Names.classifier(unit)}"`)}];  
            fileExtensions: Map<string, string> = new Map([
                ${language.modelConcept.unitTypes().map(unit => `["${Names.classifier(unit)}", "${unit.fileExtension}"]`)}
            ]);
        }`;
    }
}
