import { FreMetaLanguage } from "../../languagedef/metalanguage/FreMetaLanguage.js";
import { Names } from "./Names.js";

// files need to be generated into folders ...
export const LANGUAGE_FOLDER = "language";
export const LANGUAGE_GEN_FOLDER = "language/gen";
export const DIAGRAM_FOLDER = "diagrams";
export const DIAGRAM_GEN_FOLDER = "diagrams/gen";
export const INTERPRETER_FOLDER = "interpreter";
export const INTERPRETER_GEN_FOLDER = "interpreter/gen";
export const LANGUAGE_UTILS_FOLDER = "utils";
export const LANGUAGE_UTILS_GEN_FOLDER = "utils/gen";
export const EDITOR_FOLDER = "editor";
export const EDITOR_GEN_FOLDER = "editor/gen";
export const SCOPER_FOLDER = "scoper";
export const SCOPER_GEN_FOLDER = "scoper/gen";
export const VALIDATOR_FOLDER = "validator";
export const VALIDATOR_GEN_FOLDER = "validator/gen";
export const TYPER_FOLDER = "typer";
export const TYPER_GEN_FOLDER = "typer/gen";
export const TYPER_CONCEPTS_FOLDER = "typer/gen/type-concepts";
export const STDLIB_FOLDER = "stdlib";
export const STDLIB_GEN_FOLDER = "stdlib/gen";
export const WRITER_FOLDER = "writer";
export const WRITER_GEN_FOLDER = "writer/gen";
export const READER_FOLDER = "reader";
export const READER_GEN_FOLDER = "reader/gen";
export const CONFIGURATION_FOLDER = "config";
export const COMMAND_LINE_FOLDER = "commandline";
export const CONFIGURATION_GEN_FOLDER = "config/gen";
export const RESERVED_WORDS_ORIGIN = "../meta/src/validatordef/generator/templates"; // the folder in which the to-be-copied files can be found
export const STYLES_ORIGIN = "../meta/src/editordef/generator/templates/styles"; // the folder in which the to-be-copied files can be found
export const STYLES_FOLDER = EDITOR_FOLDER + "/styles"; // the folder to which the style files should be copied
// the predefined interfaces and classes can be found in ...
export const FREON_CORE = "@freon4dsl/core";
export const scoperInterface = FREON_CORE;
export const typerInterface = FREON_CORE;
export const validatorInterface = FREON_CORE;
export const errorClass = FREON_CORE;
export const freNamedElement = FREON_CORE;
export const EDITORSTYLES = STYLES_FOLDER + "/styles";
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
        return EDITOR_GEN_FOLDER + "/" + Names.context(language);
    }

    public static actions(language: FreMetaLanguage): string {
        return EDITOR_GEN_FOLDER + "/" + Names.actions(language);
    }

    public static defaultActions(language: FreMetaLanguage): string {
        return EDITOR_GEN_FOLDER + "/" + Names.defaultActions(language);
    }

    public static customActions(language: FreMetaLanguage): string {
        return EDITOR_FOLDER + "/" + Names.customActions(language);
    }

    public static projection(language: FreMetaLanguage): string {
        return EDITOR_GEN_FOLDER + "/" + Names.customProjection(language);
    }

    public static mainProjectionalEditor(): string {
        return EDITOR_GEN_FOLDER + "/" + Names.mainProjectionalEditor;
    }

    // the generated classes that implement the scoper can be found in ...
    public static namespace(language: FreMetaLanguage): string {
        return SCOPER_GEN_FOLDER + "/" + Names.namespace(language);
    }

    public static scoper(language: FreMetaLanguage): string {
        return SCOPER_GEN_FOLDER + "/" + Names.scoper(language);
    }

    // the generated classes that implement the typer can be found in ...
    public static typer(language: FreMetaLanguage): string {
        return TYPER_GEN_FOLDER + "/" + Names.typer(language);
    }

    // the generated classes that implement the validator can be found in ...
    public static validator(language: FreMetaLanguage): string {
        return VALIDATOR_GEN_FOLDER + "/" + Names.validator(language);
    }

    public static checker(language: FreMetaLanguage): string {
        return VALIDATOR_GEN_FOLDER + "/" + Names.rulesChecker(language);
    }

    // the generated classes that implement the unparser can be found in ...
    public static unparser(language: FreMetaLanguage): string {
        return LANGUAGE_UTILS_GEN_FOLDER + "/" + Names.writer(language);
    }

    // the generated classes that implement the visitor pattern can be found in ...
    public static walker(language: FreMetaLanguage): string {
        return LANGUAGE_UTILS_GEN_FOLDER + "/" + Names.walker(language);
    }

    public static workerInterface(language: FreMetaLanguage): string {
        return LANGUAGE_UTILS_GEN_FOLDER + "/" + Names.workerInterface(language);
    }

    public static defaultWorker(language: FreMetaLanguage): string {
        return LANGUAGE_UTILS_GEN_FOLDER + "/" + Names.defaultWorker(language);
    }
}
