import fs from "fs";
import { InterpreterGenerator } from "../interpretergen/generator/InterpreterGenerator";
import { FreInterpreterDef } from "../interpretergen/metalanguage/FreInterpreterDef";
import { FreMetaLanguage } from "../languagedef/metalanguage";
import { FreEditUnit } from "../editordef/metalanguage";
import { FreEditParser } from "../editordef/parser/FreEditParser";
import { ValidatorGenerator } from "../validatordef/generator/ValidatorGenerator";
import { LanguageParser } from "../languagedef/parser/LanguageParser";
import { FreonGenerateAction } from "./FreonGenerateAction";
import { LanguageGenerator } from "../languagedef/generator/LanguageGenerator";
import { DefaultEditorGenerator } from "../editordef/metalanguage/DefaultEditorGenerator";
import { EditorGenerator } from "../editordef/generator/EditorGenerator";
import { ScoperParser } from "../scoperdef/parser/ScoperParser";
import { ScoperGenerator } from "../scoperdef/generator/ScoperGenerator";
import { ScopeDef } from "../scoperdef/metalanguage";
import { ValidatorParser } from "../validatordef/parser/ValidatorParser";
import { ValidatorDef } from "../validatordef/metalanguage";
import { ReaderWriterGenerator } from "../parsergen/ReaderWriterGenerator";
import { FreonTyperGenerator } from "../typerdef/generator/FreonTyperGenerator";
import { TyperDef } from "../typerdef/metalanguage";
import { FreTyperMerger } from "../typerdef/parser";
import { FileWatcher, LOG2USER } from "../utils";
import { DiagramGenerator } from "../diagramgen/DiagramGenerator";

export class FreonGenerateAllAction extends FreonGenerateAction {
    public watch: boolean = false;

    protected languageGenerator: LanguageGenerator = new LanguageGenerator();
    protected editorGenerator: EditorGenerator = new EditorGenerator();
    protected parserGenerator: ReaderWriterGenerator = new ReaderWriterGenerator();
    protected scoperGenerator: ScoperGenerator = new ScoperGenerator();
    protected validatorGenerator: ValidatorGenerator = new ValidatorGenerator();
    protected typerGenerator: FreonTyperGenerator = new FreonTyperGenerator();
    protected interpreterGenerator: InterpreterGenerator = new InterpreterGenerator();
    protected language: FreMetaLanguage;
    private diagramGenerator: DiagramGenerator = new DiagramGenerator();

    public constructor() {
        super({
            actionName: "all",
            summary: "Generates the TypeScript code for all parts of the work environment for your language, plus some diagrams that show the AST",
            documentation:
                "Generates TypeScript code for the language implemention, the editor, the scoper, the typer, the reader, the writer, and the " +
                "validator for language as defined in files in DEFINITIONS_DIR."
        });
    }

    generate(): void {
        LOG2USER.info("Starting generation of all parts of your language as defined in " + this.defFolder.value);
        // LOG2USER.log("Output will be generated in: " + this.outputFolder);

        // this try-catch is here for debugging purposes, should be removed from release
        try {
            this.findDefinitionFiles();
            this.addWatchers();

            // generate the language
            try {
                this.generateLanguage();
                this.generateEditorAndParser();
                this.generateValidator();
                this.generateScoper();
                this.generateTyper();
                this.generateInterpreter();
                this.generateDiagrams();
            } catch (e) {
                LOG2USER.error("Stopping generation because of errors in the language definition: " + e.message + "\n");
            }
            if (this.watch) {
                LOG2USER.info("Watching language definition files ...");
            }
        // this try-catch is here for debugging purposes, should be removed from release
        } catch (e) {
            LOG2USER.error(e.stack);
        }
    }

    private addWatchers() {
        if (this.watch) {
            for (const file of this.languageFiles) {
                // tslint:disable-next-line:no-unused-expression
                new FileWatcher(file, this.generateLanguage);
            }
            for (const file of this.editFiles) {
                // tslint:disable-next-line:no-unused-expression
                new FileWatcher(file, this.generateEditorAndParser);
            }
            for (const file of this.validFiles) {
                // tslint:disable-next-line:no-unused-expression
                new FileWatcher(file, this.generateValidator);
            }
            for (const file of this.typerFiles) {
                // tslint:disable-next-line:no-unused-expression
                new FileWatcher(file, this.generateTyper);
            }
            for (const file of this.scopeFiles) {
                // tslint:disable-next-line:no-unused-expression
                new FileWatcher(file, this.generateScoper);
            }
        }
    }

    private generateTyper = () => {
        LOG2USER.info("Generating typer");
        let typer: TyperDef;
        try {
            if (this.typerFiles.length > 0) {
                typer = new FreTyperMerger(this.language).parseMulti(this.typerFiles);
            }
            this.typerGenerator.language = this.language;
            this.typerGenerator.outputfolder = this.outputFolder;
            this.typerGenerator.generate(typer);
        } catch (e) {
            LOG2USER.error("Stopping typer generation because of errors: " + e.message + "\n" + e.stack);
            // LOG2USER.error("Stopping typer generation because of errors: " + e.message);
        }
    };

    private generateInterpreter = () => {
        LOG2USER.info("Generating interpreter");
        const interpreterDef: FreInterpreterDef = new FreInterpreterDef();
        // TODO For now simply evaluate all concepts and model units
        for (const concept of this.language.concepts) {
            interpreterDef.conceptsToEvaluate.push(concept);
        }
        for (const unit of this.language.units) {
            interpreterDef.conceptsToEvaluate.push(unit);
        }
        try {
            this.interpreterGenerator.language = this.language;
            this.interpreterGenerator.outputfolder = this.outputFolder;
            this.interpreterGenerator.generate(interpreterDef);
        } catch (e) {
            LOG2USER.error("Stopping interpreter generation because of errors: " + e.message + "\n" + e.stack);
            // LOG2USER.error("Stopping typer generation because of errors: " + e.message);
        }
    };

    private generateScoper = () => {
        LOG2USER.info("Generating scoper");
        let scoper: ScopeDef;
        try {
            if (this.scopeFiles.length > 0) {
                scoper = new ScoperParser(this.language).parseMulti(this.scopeFiles);
            }
            this.scoperGenerator.language = this.language;
            this.scoperGenerator.outputfolder = this.outputFolder;
            this.scoperGenerator.generate(scoper);
        } catch (e) {
            LOG2USER.error("Stopping scoper generation because of errors: " + e.message + "\n" + e.stack);
            // LOG2USER.error("Stopping scoper generation because of errors: " + e.message);
        }
    };

    private generateValidator = () => {
        LOG2USER.info("Generating validator");
        let validator: ValidatorDef;
        try {
            if (this.validFiles.length > 0) {
                validator = new ValidatorParser(this.language).parseMulti(this.validFiles);
            }
            this.validatorGenerator.language = this.language;
            this.validatorGenerator.outputfolder = this.outputFolder;
            this.validatorGenerator.generate(validator);
        } catch (e) {
            LOG2USER.error("Stopping validator generation because of errors: " + e.message + "\n" + e.stack);
            // LOG2USER.error("Stopping validator generation because of errors: " + e.message);
        }
    };

    private generateEditorAndParser = () => {
        LOG2USER.info("Generating editor, reader and writer");
        let editor: FreEditUnit = null;
        try {
            this.editorGenerator.outputfolder = this.outputFolder;
            this.editorGenerator.language = this.language;
            this.parserGenerator.outputfolder = this.outputFolder;
            this.parserGenerator.language = this.language;

            if (this.editFiles.length > 0) {
                editor = new FreEditParser(this.language).parseMulti(this.editFiles);
            } else {
                editor = DefaultEditorGenerator.createEmptyEditorDefinition(this.language);
            }
            // add default values for everything that is not present in the default projection group
            DefaultEditorGenerator.addDefaults(editor);

            this.editorGenerator.generate(editor);
            this.parserGenerator.generate(editor);
        } catch (e) {
            LOG2USER.error("Stopping editor and parser generation because of errors: " + e.message + "\n" + e.stack);
            // LOG2USER.error("Stopping editor, reader and writer generation because of errors: " + e.message);
        }
        return editor;
    };

    private generateLanguage = () => {
        // generate the language
        LOG2USER.info("Generating language structure");
        this.language = new LanguageParser().parseMulti(this.languageFiles);
        if (this.idFile !== undefined && this.idFile !== null) {
            const idFileString = fs.readFileSync(this.idFile, "utf-8");
            const idJson = JSON.parse(idFileString);
            this.processIds(this.language, idJson);
        } else {
            LOG2USER.info("No id.json found")
        }
        this.languageGenerator.outputfolder = this.outputFolder;
        this.languageGenerator.generate(this.language);
    };

    private processIds(language: FreMetaLanguage, json: Object): void {
          const jsonLanguage = json["language"];
          const languageId = json["id"];
          if (typeof languageId === "string") {
              console.log("Language has id " + languageId);
              language.id = languageId;
          }
          const concepts = json["concepts"];
          if (!Array.isArray(concepts)) {
              throw new Error("id.json 'concepts' property should be an array");
          }
          for(const jsonConcept of concepts) {
              console.log("Concept " + jsonConcept["concept"] + " has id " + jsonConcept["id"]);
              const concept = language.findClassifier(jsonConcept["concept"]);
              concept.id = jsonConcept["id"];
              const properties = jsonConcept["properties"];
              if (!Array.isArray(properties)) {
                  throw new Error("id.json 'properties' property should be an array");
              }
              for(const jsonProperty of properties) {
                  const jsonPropertyName = jsonProperty["name"];
                  console.log("    Property " + jsonPropertyName + " has id " + jsonProperty["id"]);
                  const property = concept.allProperties().find(p => p.name === jsonPropertyName );
                  if (property === undefined || property === null) {
                      console.error("Property " + jsonPropertyName + " does not exist");
                  } else {
                      property.id = jsonProperty["id"];
                  }
              }
          }
    }

    private generateDiagrams = () => {
        // generate the language
        LOG2USER.info("Generating language diagrams");
        this.diagramGenerator.outputfolder = this.outputFolder;
        this.diagramGenerator.language = this.language;
        this.diagramGenerator.fileNames = this.languageFiles;
        this.diagramGenerator.generate();
    };

}
