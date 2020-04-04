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
import { PiTypeDefinition } from "../typerdef/metalanguage";
import { PiScopeDef } from "../scoperdef/metalanguage";
import { PiValidatorDef } from "../validatordef/metalanguage";
import { PiDefEditorLanguage } from "../editordef/metalanguage";

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
            actionName: "all",
            summary: "Generates the TypeScript code for all parts of the work environment for your language",
            documentation: "Generates TypeScript code for the language implemention, the editor, the scoper, the typer, and the " +
            "validator for language as defined in files in DEFINITIONS_DIR." 
        });
    }

    generate(): void {
        LOGGER.info(this, "Starting generation of all parts of your language as defined in "+ this.defFolder.value);
        LOGGER.log("Output will be generated in: " + this.outputFolder);

        let languageFile : string = "";
        let editFile : string = "";
        let validFile : string = "";
        let scopeFile  : string = ""; 
        let typerFile  : string = ""; 
        // find the definition files
        ({ languageFile, editFile, validFile, scopeFile, typerFile } = this.findDefinitionFiles(languageFile, editFile, validFile, scopeFile, typerFile));

        LOGGER.log("languageFile: " + languageFile);
        LOGGER.log("editFile: " + editFile);
        LOGGER.log("validFile: " + validFile);
        LOGGER.log("scopeFile: " + scopeFile);
        LOGGER.log("typerFile: " + typerFile);

        // generate the language
        LOGGER.info(this, "Generating language structure");
        const language = new LanguageParser().parse(languageFile);
        this.languageGenerator.outputfolder = this.outputFolder;
        this.languageGenerator.generate(language);

        LOGGER.info(this, "Generating editor");
        let editor : PiDefEditorLanguage;
        if (editFile.length >0) {
            editor = new PiDefEditorParser().parse(editFile);
        } else {
            LOGGER.log("Generating default editor");
        }
        this.editorGenerator.outputfolder = this.outputFolder;
        this.editorGenerator.language = language;
        this.editorGenerator.generate(editor);

        LOGGER.info(this, "Generating validator");
        let validator : PiValidatorDef;
        if(validFile.length > 0) {
            validator = new ValidatorParser(language).parse(validFile);
        } else {
            LOGGER.log("Generating default validator");
        }
        this.validatorGenerator = new ValidatorGenerator(language);
        this.validatorGenerator.outputfolder = this.outputFolder;
        this.validatorGenerator.generate(validator);

        LOGGER.info(this, "Generating scoper");
        let scoper : PiScopeDef;
        if (scopeFile.length > 0) {
            scoper = new ScoperParser(language).parse(scopeFile);
        } else {
            LOGGER.log("Generating default scoper");
        }
        this.scoperGenerator = new ScoperGenerator(language);
        this.scoperGenerator.outputfolder = this.outputFolder;
        this.scoperGenerator.generate(scoper);

        LOGGER.info(this, "Generating typer");
        let typer : PiTypeDefinition;
        if (typerFile.length > 0) {
            typer = new PiTyperParser(language).parse(typerFile);
        } else {
            LOGGER.log("Generating default typer");
        }
        this.typerGenerator = new PiTyperGenerator(language);
        this.typerGenerator.outputfolder = this.outputFolder;
        this.typerGenerator.generate(typer);
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
