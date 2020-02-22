import {
    CommandLineAction,
    ICommandLineActionOptions
} from "@microsoft/ts-command-line";

/**
 * Generic generator action.
 */
export abstract class ProjectItGenerateAction extends CommandLineAction {
    public verbose: boolean;
    public languageFile: string;
    public outputFolder: string;

    public constructor(options: ICommandLineActionOptions) {
        super(options);
    }

    protected onExecute(): Promise<void> {
        const self = this;
        return new Promise(function(resolve, rejest) {
            self.generate();
        });
    }

    public abstract generate(): void ;

    public setOutputFolder(folder: string): void {
        this.outputFolder = folder;
    }

    public setLanguageFile(file: string): void {
        this.languageFile = file;
    }
}
