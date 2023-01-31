import { FreEditParser } from "../editordef/parser/FreEditParser";
import { ProjectItGeneratePartAction } from "./ProjectItGeneratePartAction";
import { MetaLogger } from "../utils/MetaLogger";
import { ReaderWriterGenerator } from "../parsergen/ReaderWriterGenerator";

const LOGGER = new MetaLogger("ProjectItGenerateParser"); // .mute();

export class ProjectItGenerateParser extends ProjectItGeneratePartAction {
    protected parserGenerator: ReaderWriterGenerator = new ReaderWriterGenerator();

    public constructor() {
        super({
            actionName: "parse-it",
            summary: "Generates the typeScript code for the reader and writer of your language",
            documentation: "Generates TypeScript code for the reader and writer of the language defined in the .ast and .edit files."
        });
    }

    generate(): void {
        LOGGER.log("Starting ProjectIt reader and writer generation ...");
        super.generate();

        this.parserGenerator.outputfolder = this.outputFolder;
        this.parserGenerator.language = this.language;

        const editor = new FreEditParser(this.language).parseMulti(this.editFiles);
        // This command is being used to generate, specifically and only,
        // the reader/writer couple. Therefore we do not generate a default editor when
        // no editor definition is found.
        if (editor === null) {
            throw new Error("Editor definition could not be parsed, exiting.");
        }
        this.parserGenerator.generate(editor);
    }
}
