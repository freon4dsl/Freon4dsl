import { CommandLineAction } from "@rushstack/ts-command-line";
import fs from "fs";
import { cp } from 'fs/promises';
import path from "node:path";

type Admin = {
    language: string;
    sourceFolder: string;
    targetFolder: string;
}

export class SaveLanguage extends CommandLineAction {

    constructor() {
        super({
            actionName: "save",
            summary: "Save a language in Playground to its origin",
            documentation:
                "Saves the language back to its origin, keep it in playground."
        });
    }

    protected onDefineParameters(): void {
    }

    private readonly DOT_LANGUAGE_FILE = ".language-install.json";

    async copy() {
        //
        const currentDirectory: string = path.basename(process.cwd());
        if (currentDirectory !== "playground") {
            console.error("InstallLanguage: should be called in 'playground only, is now called in '" + currentDirectory + "'");
            process.exit(1);
        }

        let languageAdmin: Admin = JSON.parse(fs.readFileSync(`./src/${this.DOT_LANGUAGE_FILE}`).toString());
        console.log(`COPY language ${languageAdmin.language} from ${languageAdmin.targetFolder} TO ${languageAdmin.sourceFolder}`);
        await cp(languageAdmin.targetFolder, languageAdmin.sourceFolder, {
            preserveTimestamps: true,
            recursive: true,
            force: true
        });
    }

    protected onExecute(): Promise<void> {
        const self = this;
        return new Promise(function (resolve, rejest) {
            self.copy();
        });
    }

}
