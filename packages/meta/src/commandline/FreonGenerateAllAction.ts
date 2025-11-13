import { InterpreterGenerator } from "../interpretergen/generator/InterpreterGenerator.js";
import { FreInterpreterDef } from "../interpretergen/metalanguage/FreInterpreterDef.js";
import { FreMetaLanguage } from "../languagedef/metalanguage/index.js";
import { FreEditUnit } from "../editordef/metalanguage/index.js";
import { FreEditParser } from "../editordef/parser/FreEditParser.js";
// import { LionWebGenerator } from "../lionwebgen/LionWebGenerator.js";
import { ValidatorGenerator } from "../validatordef/generator/ValidatorGenerator.js";
import { LanguageParser } from "../languagedef/parser/LanguageParser.js";
import { FreonGenerateAction } from "./FreonGenerateAction.js";
import { LanguageGenerator } from "../languagedef/generator/LanguageGenerator.js";
import { DefaultEditorGenerator } from "../editordef/metalanguage/DefaultEditorGenerator.js";
import { EditorGenerator } from "../editordef/generator/EditorGenerator.js";
import { ScoperParser } from "../scoperdef/parser/ScoperParser.js";
import { ScoperGenerator } from "../scoperdef/generator/ScoperGenerator.js";
import { ScopeDef } from "../scoperdef/metalanguage/index.js";
import { ValidatorParser } from "../validatordef/parser/ValidatorParser.js";
import { ValidatorDef } from "../validatordef/metalanguage/index.js";
import { ReaderWriterGenerator } from "../parsergen/ReaderWriterGenerator.js";
import { FreonTyperGenerator } from "../typerdef/generator/FreonTyperGenerator.js";
import { TyperDef } from "../typerdef/metalanguage/index.js";
import { FreTyperMerger } from "../typerdef/parser/index.js";
import { FileWatcher, notNullOrUndefined } from '../utils/file-utils/index.js';
import { Imports } from "../utils/on-lang/index.js";
import { LOG2USER } from "../utils/basic-dependencies/index.js";
import { DiagramGenerator } from "../diagramgen/DiagramGenerator.js";

export class FreonGenerateAllAction extends FreonGenerateAction {
    public watch: boolean = false;

    protected languageGenerator: LanguageGenerator = new LanguageGenerator();
    // protected lionWebGenerator: LionWebGenerator = new LionWebGenerator();
    protected editorGenerator: EditorGenerator = new EditorGenerator();
    protected parserGenerator: ReaderWriterGenerator = new ReaderWriterGenerator();
    protected scoperGenerator: ScoperGenerator = new ScoperGenerator();
    protected validatorGenerator: ValidatorGenerator = new ValidatorGenerator();
    protected typerGenerator: FreonTyperGenerator = new FreonTyperGenerator();
    protected interpreterGenerator: InterpreterGenerator = new InterpreterGenerator();
    protected diagramGenerator: DiagramGenerator = new DiagramGenerator();
    protected language?: FreMetaLanguage;

    public constructor() {
        super({
            actionName: "all",
            summary:
                "Generates the TypeScript code for all parts of the work environment for your language, plus some diagrams that show the AST.",
            documentation:
                "Generates the TypeScript code for all parts of the work environment for your language as defined in files in DEFINITIONS_DIR, plus some diagrams that show the AST",
        });
    }

    generate(): void {
        LOG2USER.info("Starting generation of all parts of your language as defined in " + this.defFolder.value);
        // LOG2USER.log("Output will be generated in: " + this.outputFolder);
        // LOG2USER.log("Custom files will be generated in: " + this.customsFolder);

        // this try-catch is here for debugging purposes, should be removed from release
        try {
            this.findDefinitionFiles();
            this.addWatchers();

            // generate the language
            try {
                this.generateLanguage();
                // this.generateLionWeb()
                this.generateEditorAndParser();
                this.generateValidator();
                this.generateScoper();
                this.generateTyper();
                this.generateInterpreter();
                this.generateDiagrams();
            } catch (e: unknown) {
                if (e instanceof Error) {
                    LOG2USER.error(
                        "Stopping generation because of errors in the language definition: " + e.message + "\n",
                    );
                }
            }
            if (this.watch) {
                LOG2USER.info("Watching language definition files ...");
            }
            // this try-catch is here for debugging purposes, should be removed from release
        } catch (e: unknown) {
            if (e instanceof Error) {
                LOG2USER.error(e.stack ? e.stack : "No stack trace provided.");
            }
        }
    }

    private addWatchers() {
        if (this.watch) {
            for (const file of this.languageFiles) {
                // tslint:disable-next-line:no-unused-expression
                new FileWatcher(file, this.generateLanguage);
            }
            for (const file of this.editFiles) {
                // tslint:disable-next-line:no-unused-expression
                new FileWatcher(file, this.generateEditorAndParser);
            }
            for (const file of this.validFiles) {
                // tslint:disable-next-line:no-unused-expression
                new FileWatcher(file, this.generateValidator);
            }
            for (const file of this.typerFiles) {
                // tslint:disable-next-line:no-unused-expression
                new FileWatcher(file, this.generateTyper);
            }
            for (const file of this.scopeFiles) {
                // tslint:disable-next-line:no-unused-expression
                new FileWatcher(file, this.generateScoper);
            }
        }
    }

    // private generateLionWeb = () => {
    //     if (this.language === undefined || this.language === null) {
    //         return;
    //     }
    //     LOG2USER.info("Generating LionWeb");
    //     try {
    //         this.lionWebGenerator.language = this.language;
    //         this.lionWebGenerator.outputfolder = this.outputFolder;
    //         this.lionWebGenerator.customsfolder = this.customsFolder;
    //         this.lionWebGenerator.generate();
    //     } catch (e: unknown) {
    //         if (e instanceof Error) {
    //             LOG2USER.error("Stopping validator generation because of errors: " + e.message + "\n" + e.stack);
    //             // LOG2USER.error("Stopping validator generation because of errors: " + e.message);
    //         }
    //     }
    // };

    private generateTyper = () => {
        if (this.language === undefined || this.language === null) {
            return;
        }
        LOG2USER.info("Generating typer");
        let typer: TyperDef | undefined;
        try {
            if (this.typerFiles.length > 0) {
                typer = new FreTyperMerger(this.language).parseMulti(this.typerFiles);
            }
            this.typerGenerator.language = this.language;
            this.typerGenerator.outputfolder = this.outputFolder;
            this.typerGenerator.customsfolder = this.customsFolder;
            this.typerGenerator.generate(typer);
        } catch (e: unknown) {
            if (e instanceof Error) {
                LOG2USER.error("Stopping typer generation because of errors: " + e.message + "\n" + e.stack);
                // LOG2USER.error("Stopping typer generation because of errors: " + e.message);
            }
        }
    };

    private generateInterpreter = () => {
        if (this.language === undefined || this.language === null) {
            return;
        }
        LOG2USER.info("Generating interpreter");
        const interpreterDef: FreInterpreterDef = new FreInterpreterDef();
        // TODO For now simply evaluate all concepts and model units
        for (const concept of this.language.concepts) {
            interpreterDef.conceptsToEvaluate.push(concept);
        }
        for (const unit of this.language.units) {
            interpreterDef.conceptsToEvaluate.push(unit);
        }
        try {
            this.interpreterGenerator.language = this.language;
            this.interpreterGenerator.outputfolder = this.outputFolder;
            this.interpreterGenerator.customsfolder = this.customsFolder;
            this.interpreterGenerator.generate(interpreterDef);
        } catch (e: unknown) {
            if (e instanceof Error) {
                LOG2USER.error("Stopping interpreter generation because of errors: " + e.message + "\n" + e.stack);
                // LOG2USER.error("Stopping typer generation because of errors: " + e.message);
            }
        }
    };

    private generateScoper = () => {
        if (this.language === undefined || this.language === null) {
            return;
        }
        LOG2USER.info("Generating scoper");
        let scoper: ScopeDef | undefined;
        try {
            if (this.scopeFiles.length > 0) {
                scoper = new ScoperParser(this.language).parseMulti(this.scopeFiles);
            }
            this.scoperGenerator.language = this.language;
            this.scoperGenerator.outputfolder = this.outputFolder;
            this.scoperGenerator.customsfolder = this.customsFolder;
            this.scoperGenerator.generate(scoper);
        } catch (e: unknown) {
            if (e instanceof Error) {
                LOG2USER.error("Stopping scoper generation because of errors: " + e.message + "\n" + e.stack);
                // LOG2USER.error("Stopping scoper generation because of errors: " + e.message);
            }
        }
    };

    private generateValidator = () => {
        if (this.language === undefined || this.language === null) {
            return;
        }
        LOG2USER.info("Generating validator");
        let validator: ValidatorDef | undefined;
        try {
            if (this.validFiles.length > 0) {
                validator = new ValidatorParser(this.language).parseMulti(this.validFiles);
            }
            this.validatorGenerator.language = this.language;
            this.validatorGenerator.outputfolder = this.outputFolder;
            this.validatorGenerator.customsfolder = this.customsFolder;
            this.validatorGenerator.generate(validator);
        } catch (e: unknown) {
            if (e instanceof Error) {
                LOG2USER.error("Stopping validator generation because of errors: " + e.message + "\n" + e.stack);
                // LOG2USER.error("Stopping validator generation because of errors: " + e.message);
            }
        }
    };

    private generateEditorAndParser = (): FreEditUnit | undefined => {
        if (this.language === undefined || this.language === null) {
            return undefined;
        }
        LOG2USER.info("Generating editor, reader and writer");
        let editor: FreEditUnit | undefined;
        try {
            this.editorGenerator.outputfolder = this.outputFolder;
            this.editorGenerator.customsfolder = this.customsFolder;
            this.editorGenerator.language = this.language;
            this.parserGenerator.outputfolder = this.outputFolder;
            this.parserGenerator.customsfolder = this.customsFolder;
            this.parserGenerator.language = this.language;

            if (this.editFiles.length > 0) {
                editor = new FreEditParser(this.language).parseMulti(this.editFiles);
            } else {
                editor = DefaultEditorGenerator.createEmptyEditorDefinition(this.language);
            }
            if (notNullOrUndefined(editor)) {
                // add default values for everything that is not present in the default projection group
                DefaultEditorGenerator.addDefaults(editor);

                this.editorGenerator.generate(editor);
                this.parserGenerator.generate(editor);
            }
            return editor;
        } catch (e: unknown) {
            if (e instanceof Error) {
                LOG2USER.error(
                    "Stopping editor and parser generation because of errors: " + e.message + "\n" + e.stack,
                );
                // LOG2USER.error("Stopping editor, reader and writer generation because of errors: " + e.message);
            }
        }
        return undefined;
    };

    private generateLanguage = () => {
        // generate the language
        LOG2USER.info("Generating language structure");
        this.language = new LanguageParser(this.idFile).parseMulti(this.languageFiles);
        if (this.language === null || this.language === undefined) {
            throw new Error("Language could not be parsed, exiting.");
        }
        Imports.initialize(this.language)
        this.languageGenerator.outputfolder = this.outputFolder;
        this.languageGenerator.customsfolder = this.customsFolder;
        this.languageGenerator.generate(this.language!);
    };

    private generateDiagrams = () => {
        if (this.language !== undefined && this.language !== null) {
            // generate the diagrams
            LOG2USER.info("Generating language diagrams");
            this.diagramGenerator.outputfolder = this.outputFolder;
            this.diagramGenerator.language = this.language;
            this.diagramGenerator.fileNames = this.languageFiles;
            this.diagramGenerator.generate();
        }
    };
}
