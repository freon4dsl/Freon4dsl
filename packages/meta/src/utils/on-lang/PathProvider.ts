import { FreMetaLanguage } from "../../languagedef/metalanguage/index.js";
import { Names } from "./Names.js";

// files need to be generated into folders ...
export const LANGUAGE_FOLDER = "language";
export const DIAGRAM_FOLDER = "diagrams";
export const INTERPRETER_FOLDER = "interpreter";
export const LANGUAGE_UTILS_FOLDER = "utils";
export const EDITOR_FOLDER = "editor";
export const SCOPER_FOLDER = "scoper";
export const VALIDATOR_FOLDER = "validator";
export const TYPER_FOLDER = "typer";
export const TYPER_CONCEPTS_FOLDER = "typer/type-concepts";
export const STDLIB_FOLDER = "stdlib";
export const CONFIGURATION_FOLDER = "config";
export const COMMAND_LINE_FOLDER = "commandline";
export const WRITER_FOLDER = "writer";
export const READER_FOLDER = "reader";

// the predefined interfaces and classes can be found in ...
export const FREON_CORE = "@freon4dsl/core";

/**
 * Defines all paths to files and folders that are used in the generation, to ensure they are identical
 * at each usage.
 */
export class PathProvider {
    // the definitions files can be found in ...
    public static editFile(defFolder: string, languageFile: string): string {
        const languageName: string = languageFile.slice(0, languageFile.length - 5);
        return defFolder + "/" + languageName + ".edit";
    }

    public static langFile(defFolder: string, languageFile: string): string {
        const languageName: string = languageFile.slice(0, languageFile.length - 5);
        return defFolder + "/" + languageName + ".ast";
    }

    public static validFile(defFolder: string, languageFile: string): string {
        const languageName: string = languageFile.slice(0, languageFile.length - 5);
        return defFolder + "/" + languageName + ".valid";
    }

    public static scopeFile(defFolder: string, languageFile: string): string {
        const languageName: string = languageFile.slice(0, languageFile.length - 5);
        return defFolder + "/" + languageName + ".scope";
    }

    public static typeFile(defFolder: string, languageFile: string): string {
        const languageName: string = languageFile.slice(0, languageFile.length - 5);
        return defFolder + "/" + languageName + ".type";
    }

    // the generated classes that implement the editor can be found in ...
    public static context(language: FreMetaLanguage): string {
        return EDITOR_FOLDER + "/" + Names.context(language);
    }

    public static actions(language: FreMetaLanguage): string {
        return EDITOR_FOLDER + "/" + Names.actions(language);
    }

    public static defaultActions(language: FreMetaLanguage): string {
        return EDITOR_FOLDER + "/" + Names.defaultActions(language);
    }

    public static customActions(language: FreMetaLanguage): string {
        return EDITOR_FOLDER + "/" + Names.customActions(language);
    }

    public static projection(language: FreMetaLanguage): string {
        return EDITOR_FOLDER + "/" + Names.customProjection(language);
    }

    public static mainProjectionalEditor(): string {
        return EDITOR_FOLDER + "/" + Names.mainProjectionalEditor;
    }

    // the generated classes that implement the scoper can be found in ...
    public static namespace(language: FreMetaLanguage): string {
        return SCOPER_FOLDER + "/" + Names.namespace(language);
    }

    public static scoper(language: FreMetaLanguage): string {
        return SCOPER_FOLDER + "/" + Names.scoper(language);
    }

    // the generated classes that implement the typer can be found in ...
    public static typer(language: FreMetaLanguage): string {
        return TYPER_FOLDER + "/" + Names.typer(language);
    }

    // the generated classes that implement the validator can be found in ...
    public static validator(language: FreMetaLanguage): string {
        return VALIDATOR_FOLDER + "/" + Names.validator(language);
    }

    public static checker(language: FreMetaLanguage): string {
        return VALIDATOR_FOLDER + "/" + Names.rulesChecker(language);
    }

    // the generated classes that implement the unparser can be found in ...
    public static unparser(language: FreMetaLanguage): string {
        return LANGUAGE_UTILS_FOLDER + "/" + Names.writer(language);
    }

    // the generated classes that implement the visitor pattern can be found in ...
    public static walker(language: FreMetaLanguage): string {
        return LANGUAGE_UTILS_FOLDER + "/" + Names.walker(language);
    }

    public static workerInterface(language: FreMetaLanguage): string {
        return LANGUAGE_UTILS_FOLDER + "/" + Names.workerInterface(language);
    }

    public static defaultWorker(language: FreMetaLanguage): string {
        return LANGUAGE_UTILS_FOLDER + "/" + Names.defaultWorker(language);
    }
}
