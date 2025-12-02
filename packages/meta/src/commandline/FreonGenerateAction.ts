import { CommandLineAction, CommandLineStringParameter, ICommandLineActionOptions } from "@rushstack/ts-command-line";
import { GenerationStatus, FileUtil } from "../utils/file-utils/index.js";
import { LOG2USER } from "../utils/basic-dependencies/index.js";

/**
 * Generic generator action. The only option defined here is the -o flag for the output folder.
 * Subclasses need to call super.onDefineParameters()!
 */
// TODO subclasses do not call super.onDefineParameters(): is comment wrong or something else?
export abstract class FreonGenerateAction extends CommandLineAction {
    private outputFolderArg: CommandLineStringParameter;
    private customsFolderArg: CommandLineStringParameter;
    protected outputFolder: string = "";
    protected customsFolder: string = "./src/custom/";

    protected defFolder: CommandLineStringParameter;
    protected languageFiles: string[] = [];
    protected editFiles: string[] = [];
    protected validFiles: string[] = [];
    protected scopeFiles: string[] = [];
    protected typerFiles: string[] = [];
    protected idFile: string = "";

    protected constructor(options: ICommandLineActionOptions) {
        super(options);
        this.defFolder = this.defineStringParameter({
            argumentName: "DEFINITIONS_DIR",
            defaultValue: "src/defs",
            parameterLongName: "--definitions",
            parameterShortName: "-d",
            description: "Folder where your language definition files can be found",
        });
        this.outputFolderArg = this.defineStringParameter({
            argumentName: "OUTPUT_DIR",
            defaultValue: "src/freon",
            parameterLongName: "--output",
            parameterShortName: "-o",
            description: "The directory where the files are generated",
            required: false,
        });
        this.customsFolderArg = this.defineStringParameter({
            argumentName: "CUSTOM_DIR",
            defaultValue: "../custom/",
            parameterLongName: "--custom",
            parameterShortName: "-c",
            description: "The directory where the custom code is located - relative to OUTPUT_DIR",
            required: false,
        });
    }

    protected onExecute(): Promise<void> {
        const self = this;
        self.outputFolder = this.outputFolderArg.value ? this.outputFolderArg.value : "";
        if (self.outputFolder.charAt(self.outputFolder.length - 1) !== "/") {
            self.outputFolder += "/";
        }
        self.customsFolder = this.customsFolderArg.value ? this.customsFolderArg.value : "";
        if (self.customsFolder.charAt(self.customsFolder.length - 1) !== "/") {
            self.customsFolder += "/";
        }
        // @ts-ignore
        // error TS6133: 'resolve' is declared but its value is never read.
        // error TS6133: 'reject' is declared but its value is never read.
        // The parameters are expected by the constructor of Promise.
        return new Promise(function (resolve, reject) {
            self.generate();
        });
    }

    public abstract generate(): void;

    protected findDefinitionFiles() {
        if (!this.defFolder.value) {
            throw new Error("No definitions folder, exiting.");
        }
        const generationStatus = new GenerationStatus();
        const myFileSet: string[] = FileUtil.findFiles(this.defFolder.value, generationStatus);
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
            } else if (filename.endsWith("id.json")) {
                this.idFile = filename;
            } else {
                LOG2USER.warning("WARNING: unrecognized file: " + filename);
            }
        }
    }
}
