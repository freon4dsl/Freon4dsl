import { CommandLineAction, CommandLineStringParameter, ICommandLineActionOptions } from "@rushstack/ts-command-line";
import { GenerationStatus, Helpers } from "../utils";

/**
 * Generic generator action. The only option defined here is the -o flag for the output folder.
 * Subclasses need to call super.onDefineParameters()!
 */
// TODO subclasses do not call super.onDefineParameters(): is comment wrong or something else?
export abstract class ProjectItGenerateAction extends CommandLineAction {
    private outputFolderArg: CommandLineStringParameter;
    protected outputFolder: string;

    protected defFolder: CommandLineStringParameter;
    protected languageFiles: string[] = [];
    protected editFiles: string[] = [];
    protected validFiles: string[] = [];
    protected scopeFiles: string[] = [];
    protected typerFiles: string[] = [];

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

    public abstract generate(): void;

    protected onDefineParameters(): void {
        this.defFolder = this.defineStringParameter({
            argumentName: "DEFINITIONS_DIR",
            defaultValue: "defs",
            parameterLongName: "--definitions",
            parameterShortName: "-d",
            description: "Folder where your language definition files can be found"
        });
        this.outputFolderArg = this.defineStringParameter({
            argumentName: "OUTPUT_DIR",
            defaultValue: ".",
            parameterLongName: "--output",
            parameterShortName: "-o",
            description: "The directory where the files are generated",
            required: false
        });
    }

    protected findDefinitionFiles() {
        if (!this.defFolder.value) {
            throw new Error("No definitions folder, exiting.");
        }
        const generationStatus = new GenerationStatus();
        const myFileSet: string[] = Helpers.findFiles(this.defFolder.value, generationStatus);
        if (myFileSet.length === 0) {
            throw new Error("No files found in '" + this.defFolder.value + "', exiting.");
        }
        for (const filename of myFileSet) {
            if (/\.ast$/.test(filename)) {
                this.languageFiles.push(filename);
            } else if (/\.edit$/.test(filename)) {
                this.editFiles.push(filename);
            } else if (/\.valid$/.test(filename)) {
                this.validFiles.push(filename);
            } else if (/\.scope$/.test(filename)) {
                this.scopeFiles.push(filename);
            } else if (/\.type$/.test(filename)) {
                this.typerFiles.push(filename);
            }
        }
    }
}
