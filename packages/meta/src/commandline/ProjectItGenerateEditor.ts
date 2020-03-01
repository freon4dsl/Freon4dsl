import { CommandLineStringParameter } from "@microsoft/ts-command-line";
import { EditorGenerator } from "../generator/editor/EditorGenerator";
import { LanguageGenerator } from "../generator/language/LanguageGenerator";
import { EditorParser } from "../parser/editor/EditorParser";
import { LanguageParser } from "../parser/language/LanguageParser";
import { ProjectItGenerateAction } from "./ProjectitGenerateAction";

export class ProjectItGenerateEditor extends ProjectItGenerateAction {
    private editorFile: CommandLineStringParameter;
    protected languageGenerator: LanguageGenerator = new LanguageGenerator();
    protected editorGenerator: EditorGenerator = new EditorGenerator();

    public constructor() {
        super({
            actionName: "generate-editor",
            summary: "Generates the typeScript code for the projectional editor for your language",
            documentation: "Generates TypeScript code for the projectional editor of language defined in the .lang file."
        });
    }

    generate(): void {
        const language = new LanguageParser().parse(this.languageFile);
        this.languageGenerator.outputfolder = this.outputFolder;
        this.languageGenerator.generate(language);

        const editor = new EditorParser().parse(this.editorFile.value);
        this.editorGenerator.outputfolder = this.outputFolder;
        this.editorGenerator.language = language;
        this.editorGenerator.generate(editor);
    }

    protected onDefineParameters(): void {
        this.editorFile = this.defineStringParameter({
            argumentName: "EDITOR",
            defaultValue: "LanguageDefinition.edit",
            parameterLongName: "--editor",
            parameterShortName: "-e",
            description: "Editor Definition file"
        });
    }
}
