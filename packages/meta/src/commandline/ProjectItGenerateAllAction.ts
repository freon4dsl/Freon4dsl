import { CommandLineStringParameter } from "@microsoft/ts-command-line";
import { ValidatorGenerator } from "../validatordef/generator/ValidatorGenerator";
import { LanguageParser } from "../languagedef/parser/LanguageParser";
import { ScoperParser } from "../scoperdef/parser/ScoperParser";
import { ProjectItGenerateAction } from "./ProjectitGenerateAction";
import { ValidatorParser } from "../validatordef/parser/ValidatorParser";
import { LanguageGenerator } from "../languagedef/generator/LanguageGenerator";
import { ScoperGenerator } from "../scoperdef/generator/ScoperGenerator";
import { EditorGenerator } from "../editordef/generator/EditorGenerator";
import { EditorParser } from "../editordef/parser/EditorParser";
import { PathProvider } from "../utils/PathProvider";
import { PiLogger } from "../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("ProjectItGenerateAllAction"); // .mute();

export class ProjectItGenerateAllAction extends ProjectItGenerateAction {
    private defFolder: CommandLineStringParameter;
    protected languageGenerator: LanguageGenerator = new LanguageGenerator();
    protected editorGenerator: EditorGenerator = new EditorGenerator();
    protected scoperGenerator: ScoperGenerator;         // constructor needs language
    protected validatorGenerator: ValidatorGenerator;   // constructor needs language

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
        // find the definition files
        if( !this.defFolder.value ) {
            LOGGER.error( this, "No definitions folder, exiting.");
            process.exit(-1);        
        }
        const languageFileShort : string = "LanguageDefinition.lang";
        const languageFile = PathProvider.langFile(this.defFolder.value, languageFileShort);       // TODO find any file with .lang extension      
        if (this.verbose) LOGGER.log("languageFile: " + languageFile);
        const editFile : string = PathProvider.editFile(this.defFolder.value, languageFileShort);  // TODO find any file with .edit extension
        if (this.verbose) LOGGER.log("editFile: " + editFile);
        const validFile : string = PathProvider.validFile(this.defFolder.value, languageFileShort); // TODO find any file with .valid extension
        if (this.verbose) LOGGER.log("validFile: " + validFile);
        const scopeFile : string = PathProvider.scopeFile(this.defFolder.value, languageFileShort); // TODO find any file with .scop extension
        if (this.verbose) LOGGER.log("scopeFile: " + scopeFile);

        // generate the language
        const language = new LanguageParser().parse(languageFile, this.verbose); 
        this.languageGenerator.outputfolder = this.outputFolder;
        this.languageGenerator.generate(language, this.verbose);

        const editor = new EditorParser().parse(editFile, this.verbose);
        this.editorGenerator.outputfolder = this.outputFolder;
        this.editorGenerator.language = language;
        this.editorGenerator.generate(editor, this.verbose);

        const validator = new ValidatorParser(language).parse(validFile, this.verbose);
        this.validatorGenerator = new ValidatorGenerator(language);
        this.validatorGenerator.outputfolder = this.outputFolder;
        this.validatorGenerator.generate(validator, this.verbose);

        const scoper = new ScoperParser(language).parse(scopeFile, this.verbose);
        this.scoperGenerator = new ScoperGenerator(language);
        this.scoperGenerator.outputfolder = this.outputFolder;
        this.scoperGenerator.generate(scoper, this.verbose);
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
