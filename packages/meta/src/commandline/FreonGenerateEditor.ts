import { EditorGenerator } from "../editordef/generator/EditorGenerator.js";
import { FreEditParser } from "../editordef/parser/FreEditParser.js";
import { FreonGeneratePartAction } from "./FreonGeneratePartAction.js";
import { MetaLogger } from "../utils/no-dependencies/index.js";
import { DefaultEditorGenerator } from "../editordef/metalanguage/DefaultEditorGenerator.js";
import { notNullOrUndefined } from '../utils/file-utils/index.js';
import { FreEditUnit } from '../editordef/metalanguage/index.js';
import { LOG2USER } from '../utils/basic-dependencies/index.js';

const LOGGER = new MetaLogger("FreonGenerateEditor"); // .mute();

export class FreonGenerateEditor extends FreonGeneratePartAction {
    protected editorGenerator: EditorGenerator = new EditorGenerator();

    public constructor() {
        super({
            actionName: "edit-it",
            summary: "Generates the typeScript code for the projectional editor for your language",
            documentation:
                "Generates TypeScript code for the projectional editor of language defined in the .ast files.",
        });
    }

    generate(): void {
        LOGGER.log("Starting Freon editor generation ...");
        super.generate();
        if (this.language === null || this.language === undefined) {
            return;
        }
        this.editorGenerator.outputfolder = this.outputFolder;
        this.editorGenerator.customsfolder = this.customsFolder;
        this.editorGenerator.language = this.language;

        try {
            let editor: FreEditUnit | undefined;
            if (this.editFiles.length > 0) {
                editor = new FreEditParser(this.language).parseMulti(this.editFiles);
            } else {
                editor = DefaultEditorGenerator.createEmptyEditorDefinition(this.language);
            }
            if (notNullOrUndefined(editor)) { // should never be the case, a default is generated
                // add default values for everything that is not present in the editor definition
                DefaultEditorGenerator.addDefaults(editor);
                this.editorGenerator.generate(editor);
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                LOG2USER.error(
                  "Stopping editor generation because of errors: " + e.message + "\n" + e.stack,
                );
                // LOG2USER.error("Stopping editor, reader and writer generation because of errors: " + e.message);
            }
        }
    }
}
