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
import { ParserGenerator } from "../editordef/generator/ParserGenerator";

const LOGGER = new PiLogger("ProjectItGenerateAllAction"); //.mute();

export class ProjectItGenerateAllAction extends ProjectItGenerateAction {
    public watch: boolean = false;

    private defFolder: CommandLineStringParameter;
    protected languageGenerator: LanguageGenerator = new LanguageGenerator();
    protected editorGenerator: EditorGenerator = new EditorGenerator();
    protected parserGenerator: ParserGenerator = new ParserGenerator();
    protected scoperGenerator: ScoperGenerator; // constructor needs language
    protected validatorGenerator: ValidatorGenerator; // constructor needs language
    protected typerGenerator: PiTyperGenerator; // constructor needs language
    protected language: PiLanguage;

    public constructor() {
        super({
            actionName: "all",
            summary: "Generates the TypeScript code for all parts of the work environment for your language",
            documentation:
                "Generates TypeScript code for the language implemention, the editor, the scoper, the typer, and the " +
                "validator for language as defined in files in DEFINITIONS_DIR."
        });
    }

    private languageFile: string = "";
    private editFile: string = "";
    private validFile: string = "";
    private scopeFile: string = "";
    private typerFile: string = "";

    generate(): void {
        LOGGER.info(this, "Starting generation of all parts of your language as defined in " + this.defFolder.value);
        // LOGGER.log("Output will be generated in: " + this.outputFolder);

        try {
            this.findDefinitionFiles();

            // LOGGER.log("languageFile: " + this.languageFile);
            // LOGGER.log("editFile: " + this.editFile);
            // LOGGER.log("validFile: " + this.validFile);
            // LOGGER.log("scopeFile: " + this.scopeFile);
            // LOGGER.log("typerFile: " + this.typerFile);

            if (this.watch) {
                if (!!this.languageFile) new FileWatcher(this.languageFile, this.generateLanguage);
                if (!!this.editFile) new FileWatcher(this.editFile, this.generateEditorAndParser);
                if (!!this.typerFile) new FileWatcher(this.typerFile, this.generateTyper);
                if (!!this.scopeFile) new FileWatcher(this.scopeFile, this.generateScoper);
                if (!!this.validFile) new FileWatcher(this.validFile, this.generateValidator);
            }

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
            if (this.watch){
                LOGGER.info(this, "Watching language definition files ...");
            }
        } catch (e) {
            // TODO this catch is here for debugging purposes, should be removed
            LOGGER.error(this, e.stack);
        }
    }

    private generateTyper = () => {
        LOGGER.info(this, "Generating typer");
        let typer: PiTypeDefinition;
        try {
            if (this.typerFile.length > 0) {
                typer = new PiTyperParser(this.language).parse(this.typerFile);
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
            if (this.scopeFile.length > 0) {
                scoper = new ScoperParser(this.language).parse(this.scopeFile);
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
            if (this.validFile.length > 0) {
                validator = new ValidatorParser(this.language).parse(this.validFile);
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
            if (this.editFile.length > 0) {
                editor = new PiEditParser(this.language).parse(this.editFile);
            } else {
                LOGGER.log("Generating default editor");
                editor = this.editorGenerator.createDefaultEditorDefinition();
            }
            this.editorGenerator.outputfolder = this.outputFolder;
            this.editorGenerator.language = this.language;
            this.editorGenerator.generate(editor);
            this.parserGenerator.outputfolder = this.outputFolder;
            this.parserGenerator.language = this.language;
            this.parserGenerator.generate(editor);
        } catch (e) {
            LOGGER.error(this, "Stopping editor generation because of errors: " + e.message + "\n" + e.stack);
        }
        return editor;
    };

    private generateLanguage = () => {
        // generate the language
        LOGGER.info(this, "Generating language structure");
        this.language = new LanguageParser().parse(this.languageFile);
        this.languageGenerator.outputfolder = this.outputFolder;
        this.languageGenerator.generate(this.language);
    };

    private findDefinitionFiles() {
        if (!this.defFolder.value) {
            throw new Error("No definitions folder, exiting.");
        }
        let generationStatus = new GenerationStatus();
        let myFileSet: string[] = Helpers.findFiles(this.defFolder.value, generationStatus);
        if (myFileSet.length === 0) {
            throw new Error("No files found in '" + this.defFolder.value + "', exiting.");
        }
        for (let filename of myFileSet) {
            // TODO take into account multiple files with the same extension
            if (/\.lang$/.test(filename)) {
                this.languageFile = filename;
            } else if (/\.edit$/.test(filename)) {
                this.editFile = filename;
            } else if (/\.valid$/.test(filename)) {
                this.validFile = filename;
            } else if (/\.scope$/.test(filename)) {
                this.scopeFile = filename;
            } else if (/\.type$/.test(filename)) {
                this.typerFile = filename;
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
