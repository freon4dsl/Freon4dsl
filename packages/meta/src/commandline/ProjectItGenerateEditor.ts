import { CommandLineStringParameter } from "@microsoft/ts-command-line";
import { EditorGenerator } from "../editordef/generator/EditorGenerator";
import { PiEditParser } from "../editordef/parser/PiEditParser";
import { ProjectItGeneratePartAction } from "./ProjectItGeneratePartAction";
import { PiLogger } from "../../../core/src/util/PiLogging";
import { ParserGenerator } from "../editordef/generator/ParserGenerator";

const LOGGER = new PiLogger("ProjectItGenerateEditor"); // .mute();

export class ProjectItGenerateEditor extends ProjectItGeneratePartAction {
    private editorFile: CommandLineStringParameter;
    protected editorGenerator: EditorGenerator = new EditorGenerator();
    protected parserGenerator: ParserGenerator = new ParserGenerator();

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

            const editor = new PiEditParser(this.language).parse(this.editorFile.value);
            if (editor == null) {
                // TODO should we generate a default editor???
                throw new Error("Editor definition could not be parsed, exiting.");
            }
            this.editorGenerator.generate(editor);
            this.parserGenerator.outputfolder = this.outputFolder;
            this.parserGenerator.language = this.language;
            this.parserGenerator.generate(editor);
        } catch (e) {
            LOGGER.error(this, e.stack);
        }
        // TODO add check on success of generation
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
