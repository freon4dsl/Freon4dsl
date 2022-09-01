import { CommandLineAction, CommandLineStringParameter } from "@rushstack/ts-command-line";
import { cp } from 'fs/promises';

export class CopyLanguage extends CommandLineAction {
    protected languageFolderArg: CommandLineStringParameter = null;
    protected outputFolderArg: CommandLineStringParameter = null;
    outputFolder: string;
    languageFolder: string;

    constructor() {
        super({
            actionName: "install",
            summary: "Installs a language in Playground",
            documentation:
                "Saves the previous language back to its origin and copies the sample language to playground. "
        });
    }

    protected onDefineParameters(): void {
        this.languageFolderArg = this.defineStringParameter({
            argumentName: "LANGUAGE_DIR",
            defaultValue: "defs",
            parameterLongName: "--languageDir",
            parameterShortName: "-l",
            description: "Folder where your language definition files can be found",
            required: true
        });
        this.outputFolderArg = this.defineStringParameter({
            argumentName: "OUTPUT_DIR",
            defaultValue: "./playground/src",
            parameterLongName: "--output",
            parameterShortName: "-o",
            description: "The directory to which the language files will be copied",
            required: false
        });
    }

    copy() {
        cp(this.languageFolder, this.outputFolder, {preserveTimestamps: true, errorOnExist: true, recursive: true});
    }
    protected onExecute(): Promise<void> {
        const self = this;
        self.outputFolder = this.outputFolderArg.value;
        self.languageFolder = this.languageFolderArg.value
        return new Promise(function(resolve, rejest) {
            console.log("executing FromSample");
            self.copy();
            console.log("done");
        });
    }

}
