import {
    Names,
    TYPER_FOLDER,
    SCOPER_FOLDER,
    VALIDATOR_FOLDER,
    STDLIB_FOLDER,
    WRITER_FOLDER,
    READER_FOLDER,
    Imports
} from "../../../utils/on-lang/index.js"
import { FreMetaLanguage } from "../../metalanguage/index.js";

export class EnvironmentTemplate {
    generateEnvironment(language: FreMetaLanguage, customsFolder: string, relativePath: string): string {
        const imports = new Imports(relativePath)
        imports.core = new Set<string>([
            Names.FreEditor, Names.FreEnvironment, Names.FreReader,
            Names.FreCompositeTyper, Names.FreValidator, Names.FreStdlib,
            Names.FreWriter, Names.FreInterpreter, Names.FreCompositeScoper, Names.FreLanguageEnvironment, Names.FreProjectionHandler
        ])
        imports.editor = new Set<string>([
            Names.actions(language), "initializeEditorDef", "initializeProjections"
        ])
        imports.language = new Set<string>([
            Names.classifier(language.modelConcept), Names.classifier(language.units[0]), Names.initializeLanguage
        ])
        return `
        // TEMPLATE EnvironmentTemplate.generateEnvironment(...)
        ${imports.makeImports(language)}
        import { initializeScoperDef } from "${relativePath}/${SCOPER_FOLDER}/index.js";
        import { initializeTypers } from "${relativePath}/${TYPER_FOLDER}/index.js";
        import { ${Names.validator(language)} } from "${relativePath}/${VALIDATOR_FOLDER}/index.js";
        import { ${Names.stdlib(language)}  } from "${relativePath}/${STDLIB_FOLDER}/${Names.stdlib(language)}.js";
        import { ${Names.writer(language)}  } from "${relativePath}/${WRITER_FOLDER}/${Names.writer(language)}.js";
        import { ${Names.reader(language)}  } from "${relativePath}/${READER_FOLDER}/${Names.reader(language)}.js";
        import { ${Names.interpreterName(language)}  } from "${relativePath}/${customsFolder}${Names.interpreterName(language)}.js";

        /**
         * Class ${Names.environment(language)} provides the link between all parts of the language environment.
         * It holds the currently used editor, scoper, typer, etc, thus providing an entry point for,
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
                    ${Names.FreLanguageEnvironment}.setInstance(this.environment);
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
                this.projectionHandler = myComposite;
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
            scoper: ${Names.FreCompositeScoper} = new ${Names.FreCompositeScoper}();
            typer: ${Names.FreCompositeTyper} = new ${Names.FreCompositeTyper}("main");
            validator: ${Names.FreValidator} = new ${Names.validator(language)}();
            writer: ${Names.FreWriter} = new ${Names.writer(language)}();
            reader: ${Names.FreReader} = new ${Names.reader(language)}();
            interpreter: ${Names.FreInterpreter} = new ${Names.interpreterName(language)};
            stdlib: ${Names.FreStdlib} = ${Names.stdlib(language)}.getInstance();
            projectionHandler: FreProjectionHandler;
            languageName: string = "${language.name}";
            fileExtensions: Map<string, string> = new Map([
                ${language.modelConcept.unitTypes().map((unit) => `["${Names.classifier(unit)}", "${unit.fileExtension}"]`)}
            ]);
        }`;
        // todo find out why we cannot use EDITOR_FOLDER to import "${Names.actions(language)}, initializeEditorDef, initializeProjections"
    }
}
