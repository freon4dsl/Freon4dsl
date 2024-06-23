import { CommandLineFlagParameter, CommandLineParser, CommandLineStringParameter } from "@rushstack/ts-command-line";
import { LionWebMM } from "./LionWebMM";

export class LionWeb extends CommandLineParser {
    private languageAction: LionWebMM;

    private verboseArg: CommandLineFlagParameter;
    protected metamodelfile: CommandLineStringParameter;

    public constructor() {
        super({
            toolFilename: "lionweb",
            toolDescription: "Freon toolset for playing with LionWeb."
        });
        this.languageAction = new LionWebMM();
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
const install: LionWeb = new LionWeb();
install.execute();
