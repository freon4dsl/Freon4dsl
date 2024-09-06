import { FreEditParser } from "../editordef/parser/FreEditParser.js";
import { FreonGeneratePartAction } from "./FreonGeneratePartAction.js";
import { MetaLogger } from "../utils/MetaLogger.js";
import { ReaderWriterGenerator } from "../parsergen4peggy/ReaderWriterGenerator.js";
import {DefaultEditorGenerator, FreEditUnit} from "../editordef/metalanguage/index.js";

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
        this.parserGenerator.language = this.language;

        let editor: FreEditUnit | undefined;
        if (this.editFiles.length > 0) {
            editor = new FreEditParser(this.language).parseMulti(this.editFiles);
        } else {
            editor = DefaultEditorGenerator.createEmptyEditorDefinition(this.language);
        }
        if (!!editor) {
            // add default values for everything that is not present in the default projection group
            DefaultEditorGenerator.addDefaults(editor);
            this.parserGenerator.generate(editor);
        } else {
            throw new Error("Editor definition could not be parsed, exiting.");
        }
    }
}
