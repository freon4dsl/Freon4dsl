import { EditorGenerator } from "../editordef/generator/EditorGenerator";
import { FreEditParser } from "../editordef/parser/FreEditParser";
import { FreonGeneratePartAction } from "./FreonGeneratePartAction";
// This import cannot be shortened. Importing "../utils" would result in circular dependencies.
import { MetaLogger } from "../utils/MetaLogger";
import { DefaultEditorGenerator } from "../editordef/metalanguage/DefaultEditorGenerator";

const LOGGER = new MetaLogger("FreonGenerateEditor"); // .mute();

export class FreonGenerateEditor extends FreonGeneratePartAction {
    protected editorGenerator: EditorGenerator = new EditorGenerator();

    public constructor() {
        super({
            actionName: "edit-it",
            summary: "Generates the typeScript code for the projectional editor for your language",
            documentation: "Generates TypeScript code for the projectional editor of language defined in the .ast files."
        });
    }

    generate(): void {
        LOGGER.log("Starting Freon editor generation ...");
        super.generate();

        if (this.language === null || this.language === undefined) {
            return;
        }
        this.editorGenerator.outputfolder = this.outputFolder;
        this.editorGenerator.language = this.language;

        let editor = new FreEditParser(this.language).parseMulti(this.editFiles);
        // This command is being used to generate, specifically and only, the editor,
        // and the reader/writer couple. Therefore, we do not generate a default editor when
        // no editor definition is found. Instead, we create an 'empty' one.
        // todo is this comment still correct?
        if (editor === null) {
            editor = DefaultEditorGenerator.createEmptyEditorDefinition(this.language);
        }
        // add default values for everything that is not present in the editor definition
        DefaultEditorGenerator.addDefaults(editor!);

        this.editorGenerator.generate(editor!);
    }
}
