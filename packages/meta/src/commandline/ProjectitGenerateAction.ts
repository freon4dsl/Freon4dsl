import {
    CommandLineAction,
    ICommandLineActionOptions,
    CommandLineStringParameter
} from "@microsoft/ts-command-line";

/**
 * Generic generator action. The only option defined here is the -o flag for the output folder.
 * Subclasses need to call super.onDefineParameters()!
 */
export abstract class ProjectItGenerateAction extends CommandLineAction {
    private outputFolderArg: CommandLineStringParameter;
    protected outputFolder: string;

    public constructor(options: ICommandLineActionOptions) {
        super(options);
    }

    protected onExecute(): Promise<void> {
        const self = this;
        self.outputFolder = this.outputFolderArg.value;
        return new Promise(function(resolve, rejest) {
            self.generate();
        });
    }

    public abstract generate(): void ;

    protected onDefineParameters(): void {
        this.outputFolderArg = this.defineStringParameter({
            argumentName: "OUTPUTDIR",
            defaultValue: ".",
            parameterLongName: "--output",
            parameterShortName: "-o",
            description: "The directory where the files are generated"
        });
    }
}
