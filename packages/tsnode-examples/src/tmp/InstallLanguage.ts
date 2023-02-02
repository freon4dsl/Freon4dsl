import { ProjectItGenerateAllAction } from "@freon4dsl/meta/dist/commandline/ProjectItGenerateAllAction";
import { ProjectItGenerateLanguage } from "@freon4dsl/meta/dist/commandline/ProjectItGenerateLanguage";


import { CommandLineFlagParameter, CommandLineParser } from "@rushstack/ts-command-line";
import { CopyLanguage } from "./CopyLanguage";

export class InstallLanguage extends CommandLineParser {
    private languageAction: CopyLanguage;

    private verboseArg: CommandLineFlagParameter;

    public constructor() {
        super({
            toolFilename: "InstallLanguage",
            toolDescription: "ProjectIt toolset for installing languages in playground."
        });
        this.languageAction = new CopyLanguage();
        this.addAction(this.languageAction);

    }

    protected onDefineParameters(): void {
        this.verboseArg = this.defineFlagParameter({
            parameterLongName: "--verbose",
            parameterShortName: "-v",
            description: "Show extra logging detail"
        });
    }

    protected onExecute(): Promise<void> {
        try {
            return super.onExecute();
        } catch (e) {
            console.error(e.message + "\n" + e.stack);
        }
        return null;
    }
}

// Run this as the main program.
const install: InstallLanguage = new InstallLanguage();
install.execute();
