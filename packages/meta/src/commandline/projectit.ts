import { CommandLineAction, CommandLineParser, CommandLineFlagParameter, CommandLineStringParameter } from "@microsoft/ts-command-line";
import { ProjectItGenerateLanguage } from "./ProjectItGenerateLanguage";
import { ProjectItGenerateEditor } from "./ProjectItGenerateEditor";
import { ProjectItGenerateScoper } from "./ProjectItGenerateScoper";

export class ProjectItParser extends CommandLineParser {
    private verbose: CommandLineFlagParameter;
    private outputDir: CommandLineStringParameter;
    private languageFile: CommandLineStringParameter;

    private languageGenerator: ProjectItGenerateLanguage;
    private editorGenerator: ProjectItGenerateEditor;
    private scoperGenerator: ProjectItGenerateScoper;

    public constructor() {
        super({
            toolFilename: "projectit",
            toolDescription: "Projectit tools for generating languages, scopers, editors, etc."
        });

        this.languageGenerator = new ProjectItGenerateLanguage();
        this.editorGenerator = new ProjectItGenerateEditor();
        this.scoperGenerator = new ProjectItGenerateScoper();
        this.addAction(this.languageGenerator);
        this.addAction(this.editorGenerator);
        this.addAction(this.scoperGenerator);
    }

    protected onDefineParameters(): void { // abstract
        this.verbose = this.defineFlagParameter({
            parameterLongName: "--verbose",
            parameterShortName: "-v",
            description: "Show extra logging detail"
        });
        this.outputDir = this.defineStringParameter({
            argumentName: "OUTPUTDIR",
            defaultValue: ".",
            parameterLongName: "--output",
            parameterShortName: "-o",
            description: "The directory where the files are generated"
        });
        this.languageFile = this.defineStringParameter({
            argumentName: "LANGUAGE",
            defaultValue: "LanguageDefinition.lang",
            parameterLongName: "--language",
            parameterShortName: "-l",
            description: "Language Definition file",
            required: false
        });
    }

    protected onExecute(): Promise<void> {
        this.languageGenerator.setOutputFolder(this.outputDir.value);
        this.languageGenerator.setLanguageFile(this.languageFile.value);
        this.languageGenerator.verbose = this.verbose.value;
        this.editorGenerator.setOutputFolder(this.outputDir.value);
        this.editorGenerator.setLanguageFile(this.languageFile.value);
        this.scoperGenerator.setOutputFolder(this.outputDir.value);
        this.scoperGenerator.setLanguageFile(this.languageFile.value);

        return super.onExecute();
    }
}

// Run this as the main program.
const projectit: ProjectItParser = new ProjectItParser();
projectit.execute();
