import { CommandLineFlagParameter, CommandLineParser } from "@rushstack/ts-command-line";
import { CopyLanguage } from "./CopyLanguage";
import { SaveLanguage } from "./SaveLanguage";

export class InstallLanguage extends CommandLineParser {
    private languageAction: CopyLanguage;
    private saveAction: SaveLanguage;

    private verboseArg: CommandLineFlagParameter;

    public constructor() {
        super({
            toolFilename: "InstallLanguage",
            toolDescription: "Freon toolset for installing languages in playground."
        });
        this.languageAction = new CopyLanguage();
        this.saveAction = new SaveLanguage();
        this.addAction(this.languageAction);
        this.addAction(this.saveAction);
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
