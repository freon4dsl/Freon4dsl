import { EditorGenerator } from "../editordef/generator/EditorGenerator";
import { PiEditParser } from "../editordef/parser/PiEditParser";
import { ProjectItGeneratePartAction } from "./ProjectItGeneratePartAction";
import { MetaLogger } from "../utils/MetaLogger";
import { DefaultEditorGenerator } from "../editordef/metalanguage/DefaultEditorGenerator";
import { PiEditUnit } from "../editordef/metalanguage";

const LOGGER = new MetaLogger("ProjectItGenerateEditor"); // .mute();

export class ProjectItGenerateEditor extends ProjectItGeneratePartAction {
    protected editorGenerator: EditorGenerator = new EditorGenerator();

    public constructor() {
        super({
            actionName: "edit-it",
            summary: "Generates the typeScript code for the projectional editor for your language",
            documentation: "Generates TypeScript code for the projectional editor of language defined in the .ast files."
        });
    }

    generate(): void {
        LOGGER.log("Starting ProjectIt editor generation ...");
        super.generate();

        this.editorGenerator.outputfolder = this.outputFolder;
        this.editorGenerator.language = this.language;

        let editor = new PiEditParser(this.language).parseMulti(this.editFiles);
        // This command is being used to generate, specifically and only, the editor,
        // and the reader/writer couple. Therefore we do not generate a default editor when
        // no editor definition is found.
        if (editor === null) {
            editor = DefaultEditorGenerator.createEmptyEditorDefinition(this.language);
        }
        // add default values for everything that is not present in the editor definition
        DefaultEditorGenerator.addDefaults(editor);

        this.editorGenerator.generate(editor);
    }
}
