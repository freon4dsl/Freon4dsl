import { CommandLineParser, CommandLineFlagParameter } from "@rushstack/ts-command-line";
import { FreonGenerateInterpreter } from "./FreonGenerateInterpreter";
import { FreonGenerateLanguage } from "./FreonGenerateLanguage";
import { FreonGenerateAllAction } from "./FreonGenerateAllAction";
import { FreonGenerateEditor } from "./FreonGenerateEditor";
import { FreonGenerateScoper } from "./FreonGenerateScoper";
import { FreonGenerateValidator } from "./FreonGenerateValidator";
import { FreonGenerateTyper } from "./FreonGenerateTyper";
import { MetaLogger } from "../utils/MetaLogger";
import { FreonGenerateParser } from "./FreonGenerateParser";
import { FreonGenerateDiagrams } from "./FreonGenerateDiagrams";
import { FreonCleanAction } from "./FreonCleanAction";

const LOGGER = new MetaLogger("Freon"); // .mute();

// The main entry point for the Freon generator
export class Freon extends CommandLineParser {
    private languageAction: FreonGenerateLanguage;
    private allAction: FreonGenerateAllAction;
    private editorAction: FreonGenerateEditor;
    private parserAction: FreonGenerateParser;
    private diagramAction: FreonGenerateDiagrams;
    private scoperAction: FreonGenerateScoper;
    private validatorAction: FreonGenerateValidator;
    private typerAction: FreonGenerateTyper;
    private interpreterAction: FreonGenerateInterpreter;
    private cleanAction: FreonCleanAction;
    private verboseArg: CommandLineFlagParameter;
    private watchArg: CommandLineFlagParameter;

    public constructor() {
        super({
            toolFilename: "projectit",
            toolDescription: "Freon toolset for generating languages, scopers, editors, etc."
        });

        this.allAction = new FreonGenerateAllAction();
        this.languageAction = new FreonGenerateLanguage();
        this.editorAction = new FreonGenerateEditor();
        this.parserAction = new FreonGenerateParser();
        this.diagramAction = new FreonGenerateDiagrams();
        this.scoperAction = new FreonGenerateScoper();
        this.validatorAction = new FreonGenerateValidator();
        this.typerAction = new FreonGenerateTyper();
        this.interpreterAction = new FreonGenerateInterpreter();
        this.cleanAction = new FreonCleanAction();
        this.addAction(this.allAction);
        this.addAction(this.languageAction);
        this.addAction(this.editorAction);
        this.addAction(this.parserAction);
        this.addAction(this.diagramAction);
        this.addAction(this.scoperAction);
        this.addAction(this.validatorAction);
        this.addAction(this.typerAction);
        this.addAction(this.interpreterAction);
        this.addAction(this.cleanAction);
    }

    protected onDefineParameters(): void {
        this.verboseArg = this.defineFlagParameter({
            parameterLongName: "--verbose",
            parameterShortName: "-v",
            description: "Show extra logging detail"
        });
        this.watchArg = this.defineFlagParameter({
            parameterLongName: "--watch",
            parameterShortName: "-w",
            description: "Start generator in watch mode (only in combination with 'all')"
        });
    }

    protected onExecute(): Promise<void> {
        if (!this.verboseArg.value) {
            MetaLogger.muteAllLogs();
        }
        if (this.verboseArg.value) {
            MetaLogger.unmuteAllLogs();
        }
        if (!!this.watchArg.value) {
            this.allAction.watch = true;
        }
        try {
            return super.onExecute();
        } catch (e) {
            LOGGER.error(e.message + "\n" + e.stack);
        }
        return null;
    }
}

// Run this as the main program.
const projectit: Freon = new Freon();
projectit.execute();
