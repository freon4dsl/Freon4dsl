import { CommandLineParser, CommandLineFlagParameter } from "@rushstack/ts-command-line";
import { FreonGenerateInterpreter } from "./FreonGenerateInterpreter.js";
import { FreonGenerateLanguage } from "./FreonGenerateLanguage.js";
import { FreonGenerateAllAction } from "./FreonGenerateAllAction.js";
import { FreonGenerateEditor } from "./FreonGenerateEditor.js";
import { FreonGenerateScoper } from "./FreonGenerateScoper.js";
import { FreonGenerateValidator } from "./FreonGenerateValidator.js";
import { FreonGenerateTyper } from "./FreonGenerateTyper.js";
import { MetaLogger } from "../utils/index.js";
import { FreonGenerateParser } from "./FreonGenerateParser.js";
import { FreonGenerateDiagrams } from "./FreonGenerateDiagrams.js";
import { FreonCleanAction } from "./FreonCleanAction.js";

// require('source-map-support').install();
// import sm_support from 'source-map-support';
// sm_support.install();
import "source-map-support/register.js";

const LOGGER = new MetaLogger("Freon").mute();

// The main entry point for the Freon generator
export class Freon extends CommandLineParser {
    private readonly languageAction: FreonGenerateLanguage;
    private readonly allAction: FreonGenerateAllAction;
    private readonly editorAction: FreonGenerateEditor;
    private readonly parserAction: FreonGenerateParser;
    private readonly diagramAction: FreonGenerateDiagrams;
    private readonly scoperAction: FreonGenerateScoper;
    private readonly validatorAction: FreonGenerateValidator;
    private readonly typerAction: FreonGenerateTyper;
    private readonly interpreterAction: FreonGenerateInterpreter;
    private readonly cleanAction: FreonCleanAction;
    private verboseArg: CommandLineFlagParameter;
    private watchArg: CommandLineFlagParameter;

    public constructor() {
        super({
            toolFilename: "freon",
            toolDescription: "Freon toolset for generating languages, scopers, editors, etc.",
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

        this.verboseArg = this.defineFlagParameter({
            parameterLongName: "--verbose",
            parameterShortName: "-v",
            description: "Show extra logging detail",
        });
        this.watchArg = this.defineFlagParameter({
            parameterLongName: "--watch",
            parameterShortName: "-w",
            description: "Start generator in watch mode (only in combination with 'all')",
        });
    }

    // protected onDefineParameters(): void {
    //     this.verboseArg = this.defineFlagParameter({
    //         parameterLongName: "--verbose",
    //         parameterShortName: "-v",
    //         description: "Show extra logging detail"
    //     });
    //     this.watchArg = this.defineFlagParameter({
    //         parameterLongName: "--watch",
    //         parameterShortName: "-w",
    //         description: "Start generator in watch mode (only in combination with 'all')"
    //     });
    // }

    protected onExecute(): Promise<void> {
        if (!this.verboseArg.value) {
            MetaLogger.muteAllLogs();
        }
        if (this.verboseArg.value) {
            MetaLogger.unmuteAllLogs();
        }
        if (this.watchArg.value) {
            this.allAction.watch = true;
        }
        try {
            return super.onExecute();
        } catch (e: unknown) {
            if (e instanceof Error) {
                LOGGER.error(e.message + "\n" + e.stack);
            }
        }
        return Promise.resolve();
    }
}
//
// // Run this as the main program.
// const freon: Freon = new Freon();
// freon.executeAsync();
