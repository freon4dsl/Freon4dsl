import {
    Names,
    FREON_CORE,
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
import { FreMetaLanguage } from "../../metalanguage";

export class EnvironmentTemplate {

    generateEnvironment(language: FreMetaLanguage, relativePath: string): string {
        return `
        import { ${Names.FreEditor}, ${Names.FreEnvironment}, ${Names.FreReader},
                    ${Names.FreTyper}, ${Names.FreValidator}, ${Names.FreStdlib},
                    ${Names.FreWriter}, ${Names.FreInterpreter}, ${Names.FreScoperComposite}, ${Names.LanguageEnvironment}, ${Names.FreProjectionHandler}
               } from "${FREON_CORE}";
        import { ${Names.actions(language)}, initializeEditorDef, initializeProjections } from "${relativePath}${EDITOR_GEN_FOLDER}";
        import { initializeScoperDef } from "${relativePath}${SCOPER_GEN_FOLDER}";
        import { initializeTypers } from "${relativePath}${TYPER_GEN_FOLDER}";
        import { ${Names.validator(language)} } from "${relativePath}${VALIDATOR_GEN_FOLDER}";
        import { ${Names.stdlib(language)}  } from "${relativePath}${STDLIB_GEN_FOLDER}/${Names.stdlib(language)}";
        import { ${Names.writer(language)}  } from "${relativePath}${WRITER_GEN_FOLDER}/${Names.writer(language)}";
        import { ${Names.reader(language)}  } from "${relativePath}${READER_GEN_FOLDER}";
        import { ${Names.interpreterName(language)}  } from "${relativePath}${INTERPRETER_FOLDER}/${Names.interpreterName(language)}";
        import { ${Names.classifier(language.modelConcept)}, ${Names.classifier(language.units[0])}, ${Names.initializeLanguage} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";

        /**
         * Class ${Names.environment(language)} provides the link between all parts of the language environment.
         * It holds the currently used editor, scoper, typer, etc, thus providing an entry point for
         * for instance, the editor to find the right scoper, or for the validator to find the typer
         * to use.
         * This class uses the singleton pattern to ensure that only one instance of the class is present.
         */
        export class ${Names.environment(language)} implements ${Names.FreEnvironment} {
            private static environment: ${Names.FreEnvironment}; // the only instance of this class

            /**
             * This method implements the singleton pattern
             */
            public static getInstance(): ${Names.FreEnvironment}  {
                if (this.environment === undefined || this.environment === null) {
                    this.environment = new ${Names.environment(language)}();
                    ${Names.LanguageEnvironment}.setInstance(this.environment);
                }
                return this.environment;
            }

            /**
             * A private constructor, as demanded by the singleton pattern.
             */
            private constructor() {
                const actions = new ${Names.actions(language)}();
                const myComposite = new FreProjectionHandler();
                this.editor = new ${Names.FreEditor}(myComposite, this, actions);
                initializeLanguage();
                initializeProjections(myComposite);
                initializeEditorDef();
                initializeScoperDef(this.scoper);
                initializeTypers(this.typer);
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
            editor: ${Names.FreEditor};
            scoper: ${Names.FreScoperComposite} = new ${Names.FreScoperComposite}("main");
            typer: ${Names.FreTyper} = new ${Names.FreTyper}("main");
            validator: ${Names.FreValidator} = new ${Names.validator(language)}();
            writer: ${Names.FreWriter} = new ${Names.writer(language)}();
            reader: ${Names.FreReader} = new ${Names.reader(language)}();
            interpreter: ${Names.FreInterpreter} = new ${Names.interpreterName(language)};
            languageName: string = "${language.name}";
            fileExtensions: Map<string, string> = new Map([
                ${language.modelConcept.unitTypes().map(unit => `["${Names.classifier(unit)}", "${unit.fileExtension}"]`)}
            ]);
        }`;
        // todo find out why we cannot use EDITOR_FOLDER to import "${Names.actions(language)}, initializeEditorDef, initializeProjections"
    }
}
