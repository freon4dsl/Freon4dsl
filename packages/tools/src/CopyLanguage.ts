import { CommandLineAction, CommandLineStringParameter } from "@rushstack/ts-command-line";
import fs from "fs";
import { cp } from "fs/promises";
import path from "node:path";
import { WebAppConfigTemplate } from "./WepAppConfigTemplate";

type Admin = {
    language: string;
    sourceFolder: string;
    targetFolder: string;
};

export class CopyLanguage extends CommandLineAction {
    protected languageFolderArg: CommandLineStringParameter = null;
    protected targetFolderArg: CommandLineStringParameter = null;
    protected languageNameArg: CommandLineStringParameter = null;
    targetFolder: string;
    sourceFolder: string;
    languageName: string;

    constructor() {
        super({
            actionName: "install",
            summary: "Installs a language in Playground",
            documentation:
                "Saves the previous language back to its origin and copies the sample language to playground. ",
        });
    }

    protected onDefineParameters(): void {
        this.languageFolderArg = this.defineStringParameter({
            argumentName: "LANGUAGE_DIR",
            parameterLongName: "--language-dir",
            parameterShortName: "-d",
            description: "Directory where your language definition files can be found",
            required: true,
        });
        this.targetFolderArg = this.defineStringParameter({
            argumentName: "TARGET_DIR",
            defaultValue: "./src",
            parameterLongName: "--target",
            parameterShortName: "-t",
            description: "The directory to which the language files will be copied",
            required: false,
        });
        this.languageNameArg = this.defineStringParameter({
            argumentName: "LANGUAGE_NAME",
            defaultValue: "LanguageNameUnknown",
            parameterLongName: "--language-name",
            parameterShortName: "-l",
            description: "The name of the language, if omitted default to directory name of language dir",
            required: false,
        });
    }

    private readonly DOT_LANGUAGE_FILE = ".language-install.json";

    async copy() {
        //
        const currentDirectory: string = path.basename(process.cwd());
        if (currentDirectory !== "playground") {
            console.error(
                "InstallLanguage: should be called in 'playground only, is now called in '" + currentDirectory + "'",
            );
            process.exit(1);
        }

        // Check correctness of source and gtar get folders folder
        if (!fs.existsSync(this.targetFolder)) {
            console.error("CopyLanguage: cannot find target folder '" + this.targetFolder + "'");
            process.exit(1);
        }
        if (!fs.lstatSync(this.targetFolder).isDirectory()) {
            console.error("CopyLanguage: target folder '" + this.targetFolder + "' is not a folder");
            process.exit(1);
        }
        if (!fs.existsSync(this.sourceFolder)) {
            console.error("CopyLanguage: cannot find source folder '" + this.sourceFolder + "'");
            process.exit(1);
        }
        if (!fs.lstatSync(this.targetFolder).isDirectory()) {
            console.error("CopyLanguage: source folder '" + this.sourceFolder + "' is not a folder");
            process.exit(1);
        }

        // Check whether there is a language folder already in the target folder
        const files = fs.readdirSync(this.targetFolder);
        const foldersFound: string[] = [];
        let languageAdmin: Admin = null;
        for (const file of files) {
            const filePath = this.targetFolder + "/" + file;
            // ignore these
            if (file === "webapp" || file === "util") {
                continue;
            }
            if (file === this.DOT_LANGUAGE_FILE) {
                languageAdmin = JSON.parse(fs.readFileSync(filePath).toString());
            }
            if (fs.lstatSync(filePath).isDirectory()) {
                foldersFound.push(filePath);
            }
        }

        // Check whether any of the existing folders is target is the language folder
        for (const folder of foldersFound) {
            if (!!languageAdmin && languageAdmin.targetFolder === folder) {
                if (this.findLanguageName(folder) === this.languageName) {
                    console.error(`Language ${this.languageName} is already installed`);
                    process.exit(1);
                }
                console.log(`COPY current language ${folder} TO ${languageAdmin.sourceFolder}`);
                await cp(folder, languageAdmin.sourceFolder, {
                    preserveTimestamps: true,
                    recursive: true,
                    force: true,
                });
                console.log(`RM current language ${folder}`);
                await fs.rmSync(folder, { recursive: true });
            }
        }

        // const currentLanguageDir = fs.readFileSync(this.outputFolder + "./language-dir", {encoding: "utf8"}).toString();
        await cp(this.sourceFolder, this.targetFolder + "/" + this.languageName, {
            preserveTimestamps: true,
            errorOnExist: true,
            recursive: true,
            force: false,
        });
        let x: Admin = {
            language: this.languageName,
            sourceFolder: this.sourceFolder,
            targetFolder: this.targetFolder + "/" + this.languageName,
        };
        fs.writeFileSync(this.targetFolder + "/" + this.DOT_LANGUAGE_FILE, JSON.stringify(x), { encoding: "utf8" });

        const configTemplate: WebAppConfigTemplate = new WebAppConfigTemplate();
        const config = configTemplate.generate(this.languageName);
        fs.writeFileSync(this.targetFolder + "/webapp/config/WebappConfiguration.ts", config, { encoding: "utf8" });
    }

    protected findLanguageName(folderPath: string): string {
        return path.basename(folderPath);
    }

    protected isLanguageFolder(folderName: string): boolean {
        return fs.lstatSync(folderName).isDirectory() && fs.readdirSync(folderName).includes(this.DOT_LANGUAGE_FILE);
    }

    protected onExecute(): Promise<void> {
        const self = this;
        self.targetFolder = this.targetFolderArg.value;
        self.sourceFolder = this.languageFolderArg.value;
        self.languageName =
            this.languageNameArg.value === "LanguageNameUnknown"
                ? this.findLanguageName(this.sourceFolder)
                : this.languageNameArg.value;
        return new Promise(function (resolve, rejest) {
            self.copy();
        });
    }
}
