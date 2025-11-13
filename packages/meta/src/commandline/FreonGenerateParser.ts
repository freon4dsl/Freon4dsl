import { FreEditParser } from "../editordef/parser/FreEditParser.js";
import { FreonGeneratePartAction } from "./FreonGeneratePartAction.js";
import { MetaLogger } from "../utils/no-dependencies/index.js";
import { ReaderWriterGenerator } from "../parsergen/ReaderWriterGenerator.js";
import { DefaultEditorGenerator, FreEditUnit } from '../editordef/metalanguage/index.js';
import { notNullOrUndefined } from '../utils/file-utils/index.js';
import { LOG2USER } from '../utils/basic-dependencies/index.js';

const LOGGER = new MetaLogger("FreonGenerateParser"); // .mute();

export class FreonGenerateParser extends FreonGeneratePartAction {
    protected parserGenerator: ReaderWriterGenerator = new ReaderWriterGenerator();

    public constructor() {
        super({
            actionName: "parse-it",
            summary: "Generates the typeScript code for the reader and writer of your language",
            documentation:
                "Generates TypeScript code for the reader and writer of the language defined in the .ast and .edit files.",
        });
    }

    generate(): void {
        LOGGER.log("Starting Freon reader and writer generation ...");
        super.generate();
        if (this.language === null || this.language === undefined) {
            return;
        }
        this.parserGenerator.outputfolder = this.outputFolder;
        this.parserGenerator.customsfolder = this.customsFolder;
        this.parserGenerator.language = this.language;

        try {
            let editor: FreEditUnit | undefined;
            if (this.editFiles.length > 0) {
                editor = new FreEditParser(this.language).parseMulti(this.editFiles);
            } else {
                editor = DefaultEditorGenerator.createEmptyEditorDefinition(this.language);
            }
            if (notNullOrUndefined(editor)) {
                // add default values for everything that is not present in the editor definition
                DefaultEditorGenerator.addDefaults(editor);
                this.parserGenerator.generate(editor);
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                LOG2USER.error(
                  "Stopping reader and writer generation because of errors: " + e.message + "\n" + e.stack,
                );
                // LOG2USER.error("Stopping editor, reader and writer generation because of errors: " + e.message);
            }
        }
    }
}
