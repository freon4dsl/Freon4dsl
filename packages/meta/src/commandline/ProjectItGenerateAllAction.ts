import { PiLanguage } from "../languagedef/metalanguage";
import { PiEditUnit } from "../editordef/metalanguage";
import { PiEditParser } from "../editordef/parser/PiEditParser";
import { FileWatcher } from "../utils/generation/FileWatcher";
import { ValidatorGenerator } from "../validatordef/generator/ValidatorGenerator";
import { LanguageParser } from "../languagedef/parser/LanguageParser";
import { ScoperParser } from "../scoperdef/parser/ScoperParser";
import { ProjectItGenerateAction } from "./ProjectitGenerateAction";
import { ValidatorParser } from "../validatordef/parser/ValidatorParser";
import { LanguageGenerator } from "../languagedef/generator/LanguageGenerator";
import { ScoperGenerator } from "../scoperdef/generator/ScoperGenerator";
import { EditorGenerator } from "../editordef/generator/EditorGenerator";
import { PiScopeDef } from "../scoperdef/metalanguage";
import { PiValidatorDef } from "../validatordef/metalanguage";
import { ReaderWriterGenerator } from "../parsergen/ReaderWriterGenerator";
import { LOG2USER } from "../utils/UserLogger";
import { DefaultEditorGenerator } from "../editordef/metalanguage/DefaultEditorGenerator";

// import { PiTyperGenerator } from "../typerdef/generator/PiTyperGenerator";
// import { PiTypeDefinition } from "../typerdef/metalanguage";
// import { PiTyperParser } from "../typerdef/parser/PiTyperParser";
import { FreonTyperGenerator } from "../typerdef/generator/FreonTyperGenerator";
import { PiTyperDef } from "../typerdef/metalanguage";
import { PiTyperMerger } from "../typerdef/parser";

export class ProjectItGenerateAllAction extends ProjectItGenerateAction {
    public watch: boolean = false;

    protected languageGenerator: LanguageGenerator = new LanguageGenerator();
    protected editorGenerator: EditorGenerator = new EditorGenerator();
    protected parserGenerator: ReaderWriterGenerator = new ReaderWriterGenerator();
    protected scoperGenerator: ScoperGenerator = new ScoperGenerator();
    protected validatorGenerator: ValidatorGenerator = new ValidatorGenerator();
    // protected typerGenerator: PiTyperGenerator = new PiTyperGenerator();
    protected typerGenerator: FreonTyperGenerator = new FreonTyperGenerator();
    protected language: PiLanguage;

    public constructor() {
        super({
            actionName: "all",
            summary: "Generates the TypeScript code for all parts of the work environment for your language",
            documentation:
                "Generates TypeScript code for the language implemention, the editor, the scoper, the typer, the reader, the writer, and the " +
                "validator for language as defined in files in DEFINITIONS_DIR."
        });
    }

    generate(): void {
        LOG2USER.info("Starting generation of all parts of your language as defined in " + this.defFolder.value);
        // LOG2USER.log("Output will be generated in: " + this.outputFolder);

        // this try-catch is here for debugging purposes, should be removed from release
        try {
            this.findDefinitionFiles();
            this.addWatchers();

            // generate the language
            try {
                this.generateLanguage();
                this.generateEditorAndParser();
                this.generateValidator();
                this.generateScoper();
                this.generateTyper();
            } catch (e) {
                LOG2USER.error("Stopping generation because of errors in the language definition: " + e.message + "\n");
            }
            if (this.watch) {
                LOG2USER.info("Watching language definition files ...");
            }
        // this try-catch is here for debugging purposes, should be removed from release
        } catch (e) {
            LOG2USER.error(e.stack);
        }
    }

    private addWatchers() {
        if (this.watch) {
            for (const file of this.languageFiles) {
                new FileWatcher(file, this.generateLanguage);
            }
            for (const file of this.editFiles) {
                new FileWatcher(file, this.generateEditorAndParser);
            }
            for (const file of this.validFiles) {
                new FileWatcher(file, this.generateValidator);
            }
            for (const file of this.typerFiles) {
                new FileWatcher(file, this.generateTyper);
            }
            for (const file of this.scopeFiles) {
                new FileWatcher(file, this.generateScoper);
            }
        }
    }

    private generateTyper = () => {
        console.info("Generating typer");
        let typer: PiTyperDef;
        try {
            if (this.typerFiles.length > 0) {
                typer = new PiTyperMerger(this.language).parseMulti(this.typerFiles);
            }
            this.typerGenerator.language = this.language;
            this.typerGenerator.outputfolder = this.outputFolder;
            this.typerGenerator.generate(typer);
        } catch (e) {
            LOG2USER.error("Stopping typer generation because of errors: " + e.message + "\n" + e.stack);
            // LOG2USER.error("Stopping typer generation because of errors: " + e.message);
        }
        // let typer: PiTypeDefinition;
        // try {
        //     if (this.typerFiles.length > 0) {
        //         typer = new PiTyperParser(this.language).parseMulti(this.typerFiles);
        //     }
        //     this.typerGenerator.language = this.language;
        //     this.typerGenerator.outputfolder = this.outputFolder;
        //     this.typerGenerator.generate(typer);
        // } catch (e) {
        //     LOG2USER.error("Stopping typer generation because of errors: " + e.message + "\n" + e.stack);
        //     // LOG2USER.error("Stopping typer generation because of errors: " + e.message);
        // }
    };

    private generateScoper = () => {
        LOG2USER.info("Generating scoper");
        let scoper: PiScopeDef;
        try {
            if (this.scopeFiles.length > 0) {
                scoper = new ScoperParser(this.language).parseMulti(this.scopeFiles);
            }
            this.scoperGenerator.language = this.language;
            this.scoperGenerator.outputfolder = this.outputFolder;
            this.scoperGenerator.generate(scoper);
        } catch (e) {
            // LOG2USER.error("Stopping scoper generation because of errors: " + e.message + "\n" + e.stack);
            LOG2USER.error("Stopping scoper generation because of errors: " + e.message);
        }
    };

    private generateValidator = () => {
        LOG2USER.info("Generating validator");
        let validator: PiValidatorDef;
        try {
            if (this.validFiles.length > 0) {
                validator = new ValidatorParser(this.language).parseMulti(this.validFiles);
            }
            this.validatorGenerator.language = this.language;
            this.validatorGenerator.outputfolder = this.outputFolder;
            this.validatorGenerator.generate(validator);
        } catch (e) {
            LOG2USER.error("Stopping validator generation because of errors: " + e.message + "\n" + e.stack);
            // LOG2USER.error("Stopping validator generation because of errors: " + e.message);
        }
    };

    private generateEditorAndParser = () => {
        LOG2USER.info("Generating editor, reader and writer");
        let editor: PiEditUnit = null;
        try {
            this.editorGenerator.outputfolder = this.outputFolder;
            this.editorGenerator.language = this.language;
            this.parserGenerator.outputfolder = this.outputFolder;
            this.parserGenerator.language = this.language;

            if (this.editFiles.length > 0) {
                editor = new PiEditParser(this.language).parseMulti(this.editFiles);
            } else {
                editor = DefaultEditorGenerator.createEmptyEditorDefinition(this.language);
            }
            // add default values for everything that is not present in the default projection group
            DefaultEditorGenerator.addDefaults(editor);

            this.editorGenerator.generate(editor);
            this.parserGenerator.generate(editor);
        } catch (e) {
            LOG2USER.error("Stopping editor and parser generation because of errors: " + e.message + "\n" + e.stack);
            // LOG2USER.error("Stopping editor, reader and writer generation because of errors: " + e.message);
        }
        return editor;
    };

    private generateLanguage = () => {
        // generate the language
        LOG2USER.info("Generating language structure");
        this.language = new LanguageParser().parseMulti(this.languageFiles);
        this.languageGenerator.outputfolder = this.outputFolder;
        this.languageGenerator.generate(this.language);
    };

}
