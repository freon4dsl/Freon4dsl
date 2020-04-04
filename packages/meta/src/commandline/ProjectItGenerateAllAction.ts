import { CommandLineStringParameter } from "@microsoft/ts-command-line";
import { DefEditorParser } from "../editordef/parser/DefEditorParser";
import { PiTyperParser } from "../typerdef/parser/PiTyperParser";
import { PiTyperGenerator } from "../typerdef/generator/PiTyperGenerator";
import { ValidatorGenerator } from "../validatordef/generator/ValidatorGenerator";
import { LanguageParser } from "../languagedef/parser/LanguageParser";
import { ScoperParser } from "../scoperdef/parser/ScoperParser";
import { ProjectItGenerateAction } from "./ProjectitGenerateAction";
import { ValidatorParser } from "../validatordef/parser/ValidatorParser";
import { LanguageGenerator } from "../languagedef/generator/LanguageGenerator";
import { ScoperGenerator } from "../scoperdef/generator/ScoperGenerator";
import { EditorGenerator } from "../editordef/generator/EditorGenerator";
import { PathProvider } from "../utils/PathProvider";
import { PiLogger } from "../../../core/src/util/PiLogging";
import { Helpers } from "../utils/Helpers";

const LOGGER = new PiLogger("ProjectItGenerateAllAction"); // .mute();

export class ProjectItGenerateAllAction extends ProjectItGenerateAction {
    private defFolder: CommandLineStringParameter;
    protected languageGenerator: LanguageGenerator = new LanguageGenerator();
    protected editorGenerator: EditorGenerator = new EditorGenerator();
    protected scoperGenerator: ScoperGenerator;         // constructor needs language
    protected validatorGenerator: ValidatorGenerator;   // constructor needs language
    protected typerGenerator: PiTyperGenerator;   // constructor needs language

    public constructor() {
        super({
            actionName: "generate-all",
            summary: "Generates the TypeScript code for all parts of the work environment for your language",
            documentation: "Generates TypeScript code for the language implemention, the editor, the scoper, the typer, and the " +
            "validator for language as defined in files in DEFINITIONS_DIR." 
        });
    }

    generate(): void {
        if (this.verbose) {
            LOGGER.log("Starting generating all parts of your language as defined in "+ this.defFolder.value);
            LOGGER.log("Output will be generated in: " + this.outputFolder);
        }
        let languageFile : string = "";
        let editFile : string = "";
        let validFile : string = "";
        let scopeFile  : string = ""; 
        let typerFile  : string = ""; 
        // find the definition files
        ({ languageFile, editFile, validFile, scopeFile, typerFile } = this.findDefinitionFiles(languageFile, editFile, validFile, scopeFile, typerFile));

        if (this.verbose) LOGGER.log("languageFile: " + languageFile);
        if (this.verbose) LOGGER.log("editFile: " + editFile);
        if (this.verbose) LOGGER.log("validFile: " + validFile);
        if (this.verbose) LOGGER.log("scopeFile: " + scopeFile);
        if (this.verbose) LOGGER.log("typerFile: " + typerFile);

        // generate the language
        const language = new LanguageParser().parse(languageFile, this.verbose); 
        this.languageGenerator.outputfolder = this.outputFolder;
        this.languageGenerator.generate(language, this.verbose);

        if (editFile.length >0) {
            const editor = new DefEditorParser(language).parse(editFile, this.verbose);
            this.editorGenerator.outputfolder = this.outputFolder;
            this.editorGenerator.language = language;
            this.editorGenerator.generate(editor, this.verbose);
        } else {
            this.editorGenerator.outputfolder = this.outputFolder;
            this.editorGenerator.language = language;
            this.editorGenerator.generate(null, this.verbose);
        }

        if(validFile.length > 0) {
            const validator = new ValidatorParser(language).parse(validFile, this.verbose);
            this.validatorGenerator = new ValidatorGenerator(language);
            this.validatorGenerator.outputfolder = this.outputFolder;
            this.validatorGenerator.generate(validator, this.verbose);
        }

        if (scopeFile.length > 0) {
            const scoper = new ScoperParser(language).parse(scopeFile, this.verbose);
            this.scoperGenerator = new ScoperGenerator(language);
            this.scoperGenerator.outputfolder = this.outputFolder;
            this.scoperGenerator.generate(scoper, this.verbose);
        } else {
            LOGGER.log("Generating default scoper");
        }
        if (typerFile.length > 0) {
            const typer = new PiTyperParser(language).parse(typerFile, this.verbose);
            this.typerGenerator = new PiTyperGenerator(language);
            this.typerGenerator.outputfolder = this.outputFolder;
            this.typerGenerator.generate(typer, this.verbose);
        }
    }

    private findDefinitionFiles(languageFile: string, editFile: string, validFile: string, scopeFile: string, typerFile: string) {
        if (!this.defFolder.value) {
            LOGGER.error(this, "No definitions folder, exiting.");
            process.exit(-1);
        }
        let myFileSet: string[] = Helpers.findFiles(this.defFolder.value);
        if (myFileSet.length === 0) {
            LOGGER.error(this, "No files found in '" + this.defFolder.value + "', exiting.");
            process.exit(-1);
        }
        for (let filename of myFileSet) {
            // TODO take into account multiple files with the same extension
            if (/\.lang$/.test(filename)) {
                languageFile = filename;
            }
            else if (/\.edit$/.test(filename)) {
                editFile = filename;
            }
            else if (/\.valid$/.test(filename)) {
                validFile = filename;
            }
            else if (/\.scop$/.test(filename)) {
                scopeFile = filename;
            }
            else if (/\.type$/.test(filename)) {
                typerFile = filename;
            }
        }
        return { languageFile, editFile, validFile, scopeFile, typerFile };
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
