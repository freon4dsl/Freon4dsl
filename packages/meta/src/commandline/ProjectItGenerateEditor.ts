import { CommandLineStringParameter } from "@microsoft/ts-command-line";
import { EditorGenerator } from "../generator/editor/EditorGenerator";
import { EditorParser } from "../parser/editor/EditorParser";
import { ProjectItGenerateAction } from "./ProjectitGenerateAction";

export class ProjectItGenerateEditor extends ProjectItGenerateAction {
    private editorFile: CommandLineStringParameter;
    protected generator: EditorGenerator = new EditorGenerator();

    public constructor() {
        super({
            actionName: "generate-editor",
            summary: "Generates the typeScript code for the projectional editor for your language",
            documentation: "Generates TypeScript code for the projectional editor of language defined in the .lang file."
        });
    }

    generate(): void {
        const language = new EditorParser().parse(this.languageFile);
        this.generator.outputfolder = this.outputFolder;
        this.generator.generate(language);
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
