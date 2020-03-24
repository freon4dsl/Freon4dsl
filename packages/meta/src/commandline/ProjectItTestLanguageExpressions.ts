import { CommandLineStringParameter } from "@microsoft/ts-command-line";
import { ProjectItGeneratePartAction } from "./ProjectItGeneratePartAction";
import { PiLogger } from "../../../core/src/util/PiLogging";
import { LanguageExpressionParser } from "../languagedef/parser/LanguageExpressionParser";

const LOGGER = new PiLogger("ProjectItTestLanguageExpressions"); // .mute();
export class ProjectItTestLanguageExpressions extends ProjectItGeneratePartAction {
    private testFile: CommandLineStringParameter;
    // protected typerGenerator: PiTyperGenerator;

    public constructor() {
        super({
            actionName: "test-expressions",
            summary: "Test parsing and checking of expressions over your language",
            documentation: ""
        });
    }

    generate(): void {
        LOGGER.log("Starting test of language expressions ...");    
        super.generate();
        // this.typerGenerator = new PiTyperGenerator(this.language);
        // this.typerGenerator.outputfolder = this.outputFolder;

        const readTest = new LanguageExpressionParser(this.language).parse(this.testFile.value, true);
        if (readTest == null) {
            LOGGER.error(this, "Expressions could not be parsed, exiting.");
            process.exit(-1);
        }
        // this.typerGenerator.generate(typer, this.verbose);
    }

    protected onDefineParameters(): void {
        super.onDefineParameters();
        this.testFile = this.defineStringParameter({
            argumentName: "TEST",
            defaultValue: "LanguageExpressions.pitest",
            parameterLongName: "--test",
            parameterShortName: "-X",
            description: "Testing Language Expressions"
        });
    }
}
