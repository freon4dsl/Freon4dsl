import { CommandLineParser, CommandLineFlagParameter } from "@rushstack/ts-command-line";
import { ProjectItGenerateLanguage } from "./ProjectItGenerateLanguage";
import { ProjectItGenerateAllAction } from "./ProjectItGenerateAllAction";
import { ProjectItGenerateEditor } from "./ProjectItGenerateEditor";
import { ProjectItGenerateScoper } from "./ProjectItGenerateScoper";
import { ProjectItGenerateValidator } from "./ProjectItGenerateValidator";
import { ProjectItGenerateTyper } from "./ProjectItGenerateTyper";
import { MetaLogger } from "../utils/MetaLogger";

const LOGGER = new MetaLogger("ProjectItParser"); // .mute();

export class ProjectItParser extends CommandLineParser {
    private languageGenerator: ProjectItGenerateLanguage;
    private allGenerator: ProjectItGenerateAllAction;
    private editorGenerator: ProjectItGenerateEditor;
    private scoperGenerator: ProjectItGenerateScoper;
    private validatorGenerator: ProjectItGenerateValidator;
    private typerGenerator: ProjectItGenerateTyper;
    private verboseArg: CommandLineFlagParameter;
    private watchArg: CommandLineFlagParameter;

    public constructor() {
        super({
            toolFilename: "projectit",
            toolDescription: "ProjectIt toolset for generating languages, scopers, editors, etc."
        });

        this.allGenerator = new ProjectItGenerateAllAction();
        this.languageGenerator = new ProjectItGenerateLanguage();
        this.editorGenerator = new ProjectItGenerateEditor();
        this.scoperGenerator = new ProjectItGenerateScoper();
        this.validatorGenerator = new ProjectItGenerateValidator();
        this.typerGenerator = new ProjectItGenerateTyper();
        this.addAction(this.allGenerator);
        this.addAction(this.languageGenerator);
        this.addAction(this.editorGenerator);
        this.addAction(this.scoperGenerator);
        this.addAction(this.validatorGenerator);
        this.addAction(this.typerGenerator);

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
            this.allGenerator.watch = true;
        }
        try {
            return super.onExecute();
        } catch (e) {
            // TODO why do we use e.stack instead of e.message?
            LOGGER.error(this, e.stack);
        }
        return null;
    }
}

// Run this as the main program.
const projectit: ProjectItParser = new ProjectItParser();
projectit.execute();
