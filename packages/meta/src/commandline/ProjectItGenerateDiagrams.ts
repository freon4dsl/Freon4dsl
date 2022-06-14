import { ProjectItGeneratePartAction } from "./ProjectItGeneratePartAction";
import { MetaLogger } from "../utils/MetaLogger";
import { DiagramGenerator } from "../diagramgen/DiagramGenerator";


const LOGGER = new MetaLogger("ProjectItGenerateDiagrams"); // .mute();

export class ProjectItGenerateDiagrams extends ProjectItGeneratePartAction {
    protected diagramGenerator: DiagramGenerator = new DiagramGenerator();

    public constructor() {
        super({
            actionName: "diagram-it",
            summary: "Generates Mermaid diagrams of the AST of your language",
            documentation: "Generates Mermaid diagrams of the structure of the language defined in the .ast files."
        });
    }

    generate(): void {
        LOGGER.log("Starting ProjectIt diagram generation ...");
        super.generate();

        this.diagramGenerator.outputfolder = this.outputFolder;
        this.diagramGenerator.language = this.language;

        this.diagramGenerator.fileNames = this.languageFiles;
        this.diagramGenerator.generate();
    }
}
