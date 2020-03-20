import { CommandLineParser, CommandLineFlagParameter } from "@microsoft/ts-command-line";
import { ProjectItGenerateLanguage } from "./ProjectItGenerateLanguage";
import { ProjectItGenerateAllAction } from "./ProjectItGenerateAllAction";
import { ProjectItGenerateEditor } from "./ProjectItGenerateEditor";
import { ProjectItGenerateScoper } from "./ProjectItGenerateScoper";
import { ProjectItGenerateValidator } from "./ProjectItGenerateValidator";

export class ProjectItParser extends CommandLineParser {
    private languageGenerator: ProjectItGenerateLanguage;
    private allGenerator: ProjectItGenerateAllAction;
    private editorGenerator: ProjectItGenerateEditor;
    private scoperGenerator: ProjectItGenerateScoper;
    private validatorGenerator: ProjectItGenerateValidator;
    private verboseArg: CommandLineFlagParameter;

    public constructor() {
        super({
            toolFilename: "projectit",
            toolDescription: "ProjectIt toolset for generating languages, scopers, editors, etc."
        });
        // console.log("PROJECT_IT COMMANDLINE PARSER");

        this.languageGenerator = new ProjectItGenerateLanguage();
        this.allGenerator = new ProjectItGenerateAllAction();
        this.editorGenerator = new ProjectItGenerateEditor();
        this.scoperGenerator = new ProjectItGenerateScoper();
        this.validatorGenerator = new ProjectItGenerateValidator();
        this.addAction(this.languageGenerator);
        this.addAction(this.allGenerator);
        this.addAction(this.editorGenerator);
        this.addAction(this.scoperGenerator);
        this.addAction(this.validatorGenerator);
    }

    protected onDefineParameters(): void { 
        this.verboseArg = this.defineFlagParameter({
            parameterLongName: "--verbose",
            parameterShortName: "-v",
            description: "Show extra logging detail"
        });
    }

    protected onExecute(): Promise<void> {
        this.languageGenerator.verbose = this.verboseArg.value;
        this.allGenerator.verbose = this.verboseArg.value;
        this.editorGenerator.verbose = this.verboseArg.value;
        this.scoperGenerator.verbose = this.verboseArg.value;
        this.validatorGenerator.verbose = this.verboseArg.value;

        return super.onExecute();
    }
}

// Run this as the main program.
const projectit: ProjectItParser = new ProjectItParser();
projectit.execute();
