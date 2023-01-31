import {
    CommandLineAction,
    CommandLineFlagParameter,
    CommandLineStringParameter
} from "@rushstack/ts-command-line";
import { LanguageGenerator } from "../languagedef/generator/LanguageGenerator";
import { EditorGenerator } from "../editordef/generator/EditorGenerator";
import { ReaderWriterGenerator } from "../parsergen/ReaderWriterGenerator";
import { ScoperGenerator } from "../scoperdef/generator/ScoperGenerator";
import { ValidatorGenerator } from "../validatordef/generator/ValidatorGenerator";
import { FreonTyperGenerator } from "../typerdef/generator/FreonTyperGenerator";
import { MetaLogger } from "../utils/MetaLogger";
import { GenerationStatus, FileUtil } from "../utils";
import { LanguageParser } from "../languagedef/parser/LanguageParser";
import { FreLanguage } from "../languagedef/metalanguage";

const LOGGER = new MetaLogger("ProjectItCleanAction"); //.mute();

export class ProjectItCleanAction extends CommandLineAction {
    private outputFolderArg: CommandLineStringParameter;
    private defFolderArg: CommandLineStringParameter;
    protected forceFlag: CommandLineFlagParameter;

    protected outputFolder: string;
    private defFolder: string;
    private force: boolean;

    protected languageGenerator: LanguageGenerator = new LanguageGenerator();
    protected editorGenerator: EditorGenerator = new EditorGenerator();
    protected parserGenerator: ReaderWriterGenerator = new ReaderWriterGenerator();
    protected scoperGenerator: ScoperGenerator = new ScoperGenerator();
    protected validatorGenerator: ValidatorGenerator = new ValidatorGenerator();
    protected typerGenerator: FreonTyperGenerator = new FreonTyperGenerator();
    private language: FreLanguage;

    public constructor() {
        super({
            actionName: "clean-it",
            summary: "Removes the generated TypeScript code for all parts of the work environment for your language",
            documentation:
                "Removes the TypeScript code for the language implementation, the editor, the scoper, the typer, the reader, the writer, and the " +
                "validator. Any files that may contain customizations are left untouched."
        });
    }

    protected onExecute(): Promise<void> {
        const self = this;
        self.outputFolder = this.outputFolderArg.value;
        self.force = this.forceFlag.value;
        self.defFolder = this.defFolderArg.value;
        return new Promise(function(resolve, rejest) {
            self.doClean();
        });
    }

    protected onDefineParameters(): void {
        this.forceFlag = this.defineFlagParameter({
            parameterLongName: "--force",
            parameterShortName: "-f",
            description: "Remove every file generated by ProjectIt, including possibly customized files."
        });
        this.defFolderArg = this.defineStringParameter({
            argumentName: "DEFINITIONS_DIR",
            defaultValue: "defs",
            parameterLongName: "--definitions",
            parameterShortName: "-d",
            description: "Folder where your language definition files can be found - needed when the force flag is set"
        });
        this.outputFolderArg = this.defineStringParameter({
            argumentName: "OUTPUT_DIR",
            defaultValue: ".",
            parameterLongName: "--output",
            parameterShortName: "-o",
            description: "The directory where the generated files are located",
            required: false
        });
    }

    doClean(): void {
        LOGGER.info("Removing of all parts of your language");
        // LOGGER.log("Output will be cleaned from: " + this.outputFolder);

        // when the force flag is present we need to parse the definition ast files
        // because some generators must remove files with names based on the language
        if (this.force) {
            LOGGER.info("Force flag is present therefore we need to parse the definition ast files, because some generators must remove files with names based on the language.")
            this.findLanguage();
        }
        // clean the workspace
        try {
            this.cleanLanguage();
            this.cleanEditorAndParser();
            this.cleanValidator();
            this.cleanScoper();
            this.cleanTyper();
        } catch (e) {
            LOGGER.error("Stopping cleaning because of errors: " + e.message + "\n");
        }
    }

    private cleanTyper = () => {
        LOGGER.log("Cleaning typer");
        try {
            this.typerGenerator.outputfolder = this.outputFolder;
            this.typerGenerator.language = this.language;
            this.typerGenerator.clean(this.force);
        } catch (e) {
            // LOGGER.error("Stopping typer cleansing because of errors: " + e.message + "\n" + e.stack);
            LOGGER.error("Stopping typer cleansing because of errors: " + e.message);
        }
    };

    private cleanScoper = () => {
        LOGGER.log("Cleaning scoper");
        try {
            this.scoperGenerator.outputfolder = this.outputFolder;
            this.scoperGenerator.language = this.language;
            this.scoperGenerator.clean(this.force);
        } catch (e) {
            // LOGGER.error("Stopping scoper cleansing because of errors: " + e.message + "\n" + e.stack);
            LOGGER.error("Stopping scoper cleansing because of errors: " + e.message);
        }
    };

    private cleanValidator = () => {
        LOGGER.log("Cleaning validator");
        try {
            this.validatorGenerator.outputfolder = this.outputFolder;
            this.validatorGenerator.language = this.language;
            this.validatorGenerator.clean(this.force);
        } catch (e) {
            // LOGGER.error("Stopping validator cleansing because of errors: " + e.message + "\n" + e.stack);
            LOGGER.error("Stopping validator cleansing because of errors: " + e.message);
        }
    };

    private cleanEditorAndParser = () => {
        LOGGER.log("Cleaning editor, reader and writer");
        try {
            this.editorGenerator.outputfolder = this.outputFolder;
            this.editorGenerator.language = this.language;
            this.editorGenerator.clean(this.force);

            this.parserGenerator.outputfolder = this.outputFolder;
            this.parserGenerator.language = this.language;
            this.parserGenerator.clean(this.force);
        } catch (e) {
            // LOGGER.error("Stopping editor and parser cleansing because of errors: " + e.message + "\n" + e.stack);
            LOGGER.error("Stopping editor, reader and writer cleansing because of errors: " + e.message);
        }
    };

    private cleanLanguage = () => {
        // clean the language
        LOGGER.log("Cleaning language structure");
        this.languageGenerator.outputfolder = this.outputFolder;
        this.languageGenerator.clean(this.force);
    };

    protected findLanguage() {
        if (!this.defFolder) {
            throw new Error("No definitions folder, exiting.");
        }
        const generationStatus = new GenerationStatus();
        let languageFiles: string[] = [];
        const myFileSet: string[] = FileUtil.findFiles(this.defFolder, generationStatus);
        if (myFileSet.length > 0) {
            for (const filename of myFileSet) {
                if (/\.ast$/.test(filename)) {
                    languageFiles.push(filename);
                }
            }
            this.language = new LanguageParser().parseMulti(languageFiles);
        }
    }
}
