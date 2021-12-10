import { CommandLineParser, CommandLineFlagParameter } from "@rushstack/ts-command-line";
import { ProjectItGenerateLanguage } from "./ProjectItGenerateLanguage";
import { ProjectItGenerateAllAction } from "./ProjectItGenerateAllAction";
import { ProjectItGenerateEditor } from "./ProjectItGenerateEditor";
import { ProjectItGenerateScoper } from "./ProjectItGenerateScoper";
import { ProjectItGenerateValidator } from "./ProjectItGenerateValidator";
import { ProjectItGenerateTyper } from "./ProjectItGenerateTyper";
import { MetaLogger } from "../utils/MetaLogger";
import { ProjectItGenerateParser } from "./ProjectItGenerateParser";
import { ProjectItCleanAction } from "./ProjectitCleanAction";

const LOGGER = new MetaLogger("ProjectItParser"); // .mute();

// The main entry ppoint for the ProjectIt generator
export class ProjectItParser extends CommandLineParser {
    private languageAction: ProjectItGenerateLanguage;
    private allAction: ProjectItGenerateAllAction;
    private editorAction: ProjectItGenerateEditor;
    private parserAction: ProjectItGenerateParser;
    private scoperAction: ProjectItGenerateScoper;
    private validatorAction: ProjectItGenerateValidator;
    private typerAction: ProjectItGenerateTyper;
    private cleanAction: ProjectItCleanAction;
    private verboseArg: CommandLineFlagParameter;
    private watchArg: CommandLineFlagParameter;

    public constructor() {
        super({
            toolFilename: "projectit",
            toolDescription: "ProjectIt toolset for generating languages, scopers, editors, etc."
        });

        this.allAction = new ProjectItGenerateAllAction();
        this.languageAction = new ProjectItGenerateLanguage();
        this.editorAction = new ProjectItGenerateEditor();
        this.parserAction = new ProjectItGenerateParser();
        this.scoperAction = new ProjectItGenerateScoper();
        this.validatorAction = new ProjectItGenerateValidator();
        this.typerAction = new ProjectItGenerateTyper();
        this.cleanAction = new ProjectItCleanAction();
        this.addAction(this.allAction);
        this.addAction(this.languageAction);
        this.addAction(this.editorAction);
        this.addAction(this.parserAction);
        this.addAction(this.scoperAction);
        this.addAction(this.validatorAction);
        this.addAction(this.typerAction);
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
            LOGGER.error(this, e.message + "\n" + e.stack);
        }
        return null;
    }
}

// Run this as the main program.
const projectit: ProjectItParser = new ProjectItParser();
projectit.execute();
