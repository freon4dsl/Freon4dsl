import { CommandLineStringParameter } from "@microsoft/ts-command-line";
import { EditorGenerator } from "../editordef/generator/EditorGenerator";
import { DefEditorParser } from "../editordef/parser/DefEditorParser";
import { ProjectItGeneratePartAction } from "./ProjectItGeneratePartAction";
import { PiLogger } from "../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("ProjectItGenerateEditor"); // .mute();

export class ProjectItGenerateEditor extends ProjectItGeneratePartAction {
    private editorFile: CommandLineStringParameter;
    protected editorGenerator: EditorGenerator = new EditorGenerator();

    public constructor() {
        super({
            actionName: "edit-it",
            summary: "Generates the typeScript code for the projectional editor for your language",
            documentation: "Generates TypeScript code for the projectional editor of language defined in the .lang file."
        });
    }

    generate(): void {
        LOGGER.log("Starting ProjectIt editor generation ...");
        try {
        super.generate();

        this.editorGenerator.outputfolder = this.outputFolder;
        this.editorGenerator.language = this.language;

        const editor = new DefEditorParser(this.language).parse(this.editorFile.value);
        if (editor == null) {
            LOGGER.error(this, "Editor definition could not be parsed, exiting.");
            process.exit(-1);
        }
        this.editorGenerator.generate(editor);
        } catch (e) {
            console.log(e.stack);
        }
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
