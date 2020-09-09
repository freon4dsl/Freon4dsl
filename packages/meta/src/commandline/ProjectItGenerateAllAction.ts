import { CommandLineStringParameter } from "@microsoft/ts-command-line";
import { PiLanguage } from "../languagedef/metalanguage";
import { PiEditUnit } from "../editordef/metalanguage";
import { PiEditParser } from "../editordef/parser/PiEditParser";
import { PiTyperParser } from "../typerdef/parser/PiTyperParser";
import { PiTyperGenerator } from "../typerdef/generator/PiTyperGenerator";
import { FileWatcher } from "../utils/FileWatcher";
import { ValidatorGenerator } from "../validatordef/generator/ValidatorGenerator";
import { LanguageParser } from "../languagedef/parser/LanguageParser";
import { ScoperParser } from "../scoperdef/parser/ScoperParser";
import { ProjectItGenerateAction } from "./ProjectitGenerateAction";
import { ValidatorParser } from "../validatordef/parser/ValidatorParser";
import { LanguageGenerator } from "../languagedef/generator/LanguageGenerator";
import { ScoperGenerator } from "../scoperdef/generator/ScoperGenerator";
import { EditorGenerator } from "../editordef/generator/EditorGenerator";
import { PiLogger } from "../../../core/src/util/PiLogging";
import { GenerationStatus, Helpers } from "../utils/Helpers";
import { PiTypeDefinition } from "../typerdef/metalanguage";
import { PiScopeDef } from "../scoperdef/metalanguage";
import { PiValidatorDef } from "../validatordef/metalanguage";
import { ReaderWriterGenerator } from "../editordef/generator/ReaderWriterGenerator";

const LOGGER = new PiLogger("ProjectItGenerateAllAction"); //.mute();

export class ProjectItGenerateAllAction extends ProjectItGenerateAction {
    public watch: boolean = false;

    protected languageGenerator: LanguageGenerator = new LanguageGenerator();
    protected editorGenerator: EditorGenerator = new EditorGenerator();
    protected parserGenerator: ReaderWriterGenerator = new ReaderWriterGenerator();
    protected scoperGenerator: ScoperGenerator; // constructor needs language
    protected validatorGenerator: ValidatorGenerator; // constructor needs language
    protected typerGenerator: PiTyperGenerator; // constructor needs language
    protected language: PiLanguage;

    private defFolder: CommandLineStringParameter;
    private languageFiles: string[] = [];
    private editFiles: string[] = [];
    private validFiles: string[] = [];
    private scopeFiles: string[] = [];
    private typerFiles: string[] = [];

    public constructor() {
        super({
            actionName: "all",
            summary: "Generates the TypeScript code for all parts of the work environment for your language",
            documentation:
                "Generates TypeScript code for the language implemention, the editor, the scoper, the typer, and the " +
                "validator for language as defined in files in DEFINITIONS_DIR."
        });
    }

    generate(): void {
        LOGGER.info(this, "Starting generation of all parts of your language as defined in " + this.defFolder.value);
        // LOGGER.log("Output will be generated in: " + this.outputFolder);

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
                LOGGER.error(this, "Stopping generation because of errors in the language definition: " + e.message + "\n");
            }
            if (this.watch) {
                LOGGER.info(this, "Watching language definition files ...");
            }
        } catch (e) {
            // TODO this catch is here for debugging purposes, should be removed
            LOGGER.error(this, e.stack);
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
        LOGGER.info(this, "Generating typer");
        let typer: PiTypeDefinition;
        try {
            if (this.typerFiles.length > 0) {
                typer = new PiTyperParser(this.language).parseMulti(this.typerFiles);
            } else {
                LOGGER.log("Generating default typer");
            }
            this.typerGenerator = new PiTyperGenerator(this.language);
            this.typerGenerator.outputfolder = this.outputFolder;
            this.typerGenerator.generate(typer);
        } catch (e) {
            LOGGER.error(this, "Stopping typer generation because of errors: " + e.message + "\n" + e.stack);
        }
    };

    private generateScoper = () => {
        LOGGER.info(this, "Generating scoper");
        let scoper: PiScopeDef;
        try {
            if (this.scopeFiles.length > 0) {
                scoper = new ScoperParser(this.language).parseMulti(this.scopeFiles);
            } else {
                LOGGER.log("Generating default scoper");
            }
            this.scoperGenerator = new ScoperGenerator(this.language);
            this.scoperGenerator.outputfolder = this.outputFolder;
            this.scoperGenerator.generate(scoper);
        } catch (e) {
            LOGGER.error(this, "Stopping scoper generation because of errors: " + e.message + "\n" + e.stack);
        }
    };

    private generateValidator = () => {
        LOGGER.info(this, "Generating validator");
        let validator: PiValidatorDef;
        try {
            if (this.validFiles.length > 0) {
                validator = new ValidatorParser(this.language).parseMulti(this.validFiles);
            } else {
                LOGGER.log("Generating default validator");
            }
            this.validatorGenerator = new ValidatorGenerator(this.language);
            this.validatorGenerator.outputfolder = this.outputFolder;
            this.validatorGenerator.generate(validator);
        } catch (e) {
            LOGGER.error(this, "Stopping validator generation because of errors: " + e.message + "\n" + e.stack);
        }
    };

    private generateEditorAndParser = () => {
        LOGGER.info(this, "Generating editor");
        let editor: PiEditUnit = null;
        try {
            this.editorGenerator.outputfolder = this.outputFolder;
            this.editorGenerator.language = this.language;
            this.parserGenerator.outputfolder = this.outputFolder;
            this.parserGenerator.language = this.language;

            if (this.editFiles.length > 0) {
                editor = new PiEditParser(this.language).parseMulti(this.editFiles);
            } else {
                LOGGER.log("Generating default editor");
                editor = this.editorGenerator.createDefaultEditorDefinition();
            }

            this.editorGenerator.generate(editor);
            this.parserGenerator.generate(editor);
        } catch (e) {
            LOGGER.error(this, "Stopping editor and parser generation because of errors: " + e.message + "\n" + e.stack);
        }
        return editor;
    };

    private generateLanguage = () => {
        // generate the language
        LOGGER.info(this, "Generating language structure");
        this.language = new LanguageParser().parseMulti(this.languageFiles);
        this.languageGenerator.outputfolder = this.outputFolder;
        this.languageGenerator.generate(this.language);
    };

    private findDefinitionFiles() {
        if (!this.defFolder.value) {
            throw new Error("No definitions folder, exiting.");
        }
        const generationStatus = new GenerationStatus();
        const myFileSet: string[] = Helpers.findFiles(this.defFolder.value, generationStatus);
        if (myFileSet.length === 0) {
            throw new Error("No files found in '" + this.defFolder.value + "', exiting.");
        }
        for (const filename of myFileSet) {
            if (/\.lang$/.test(filename)) {
                this.languageFiles.push(filename);
            } else if (/\.edit$/.test(filename)) {
                this.editFiles.push(filename);
            } else if (/\.valid$/.test(filename)) {
                this.validFiles.push(filename);
            } else if (/\.scope$/.test(filename)) {
                this.scopeFiles.push(filename);
            } else if (/\.type$/.test(filename)) {
                this.typerFiles.push(filename);
            }
        }
    }

    protected onDefineParameters(): void {
        super.onDefineParameters();
        this.defFolder = this.defineStringParameter({
            argumentName: "DEFINITIONS_DIR",
            defaultValue: "defs",
            parameterLongName: "--definitions",
            parameterShortName: "-d",
            description: "Folder where your language definition files can be found"
        });
    }
}
