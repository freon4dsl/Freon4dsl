import { CommandLineStringParameter } from "@microsoft/ts-command-line";
import { EditorGenerator } from "../editordef/generator/EditorGenerator";
import { EditorParser } from "../editordef/parser/EditorParser";
import { ProjectItGeneratePartAction } from "./ProjectItGeneratePartAction";
import { PiLogger } from "../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("ProjectItGenerateEditor"); // .mute();

export class ProjectItGenerateEditor extends ProjectItGeneratePartAction {
    private editorFile: CommandLineStringParameter;
    protected editorGenerator: EditorGenerator = new EditorGenerator();

    public constructor() {
        super({
            actionName: "generate-editor",
            summary: "Generates the typeScript code for the projectional editor for your language",
            documentation: "Generates TypeScript code for the projectional editor of language defined in the .lang file."
        });
    }

    generate(): void {
        if (this.verbose) {
            LOGGER.log("Starting ProjectIt editor generation ...");    
        }
        super.generate();

        this.editorGenerator.outputfolder = this.outputFolder;
        this.editorGenerator.language = this.language;

        const editor = new EditorParser().parse(this.editorFile.value, this.verbose);
        if (editor == null) {
            LOGGER.error(this, "Editor definition could not be parsed, exiting.");
            process.exit(-1);
        }
       this.editorGenerator.generate(editor, this.verbose);
        // TODO add check on succefullness of generation
    }

    protected onDefineParameters(): void {
        super.onDefineParameters();
        this.editorFile = this.defineStringParameter({
            argumentName: "EDITOR",
            defaultValue: "LanguageDefinition.edit",
            parameterLongName: "--editor",
            parameterShortName: "-e",
            description: "Editor Definition file"
        });
    }
}
