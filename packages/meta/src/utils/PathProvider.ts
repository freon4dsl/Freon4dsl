import { PiLanguage, PiConcept } from "../languagedef/metalanguage/PiLanguage";
import { Names } from "./Names";

// files need to be generated into folders ...
export const LANGUAGE_FOLDER = "language";
export const LANGUAGE_GEN_FOLDER = "language/gen";
export const ENVIRONMENT_FOLDER = "environment";
export const ENVIRONMENT_GEN_FOLDER = "environment/gen";
export const LANGUAGE_UTILS_GEN_FOLDER = "utils/gen";
export const EDITOR_FOLDER = "editor";
export const EDITOR_GEN_FOLDER = "editor/gen";
export const SCOPER_FOLDER = "scoper";
export const SCOPER_GEN_FOLDER = "scoper/gen";
export const VALIDATOR_FOLDER = "validator";
export const VALIDATOR_GEN_FOLDER = "validator/gen";
export const TYPER_FOLDER = "typer";
export const TYPER_GEN_FOLDER = "typer/gen";
export const STDLIB_GEN_FOLDER = "stdlib/gen";
export const UNPARSER_GEN_FOLDER = "unparser/gen";
export const PARSER_GEN_FOLDER = "parser/gen";
// export const WEBAPP_FOLDER = "../webapp";
// export const APP_FOLDER = "../webapp/app";
// export const ASSETS_FOLDER = "../webapp/assets";
export const RESERVED_WORDS_ORIGIN = "../meta/src/validatordef/generator/templates"; // the folder in which the to-be-copied files can be found
export const STYLES_ORIGIN = "../meta/src/editordef/generator/templates/styles";     // the folder in which the to-be-copied files can be found
export const STYLES_FOLDER = EDITOR_FOLDER + "/styles";     // the folder to which the style files should be copied
// the predefined interfaces and classes can be found in ...
export const PROJECTITCORE = "@projectit/core";
export const scoperInterface = PROJECTITCORE;
export const typerInterface = PROJECTITCORE;
export const validatorInterface = PROJECTITCORE;
export const errorClass = PROJECTITCORE;
export const piNamedElement = PROJECTITCORE;
export const EDITORSTYLES = STYLES_FOLDER + "/styles";
export const CONFIGURATION_FOLDER = "projectit";
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
        return defFolder + "/" + languageName + ".lang";
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

    // the generated classes that implement the language can be found in ...
    public static concept(concept: PiConcept): string {
        return LANGUAGE_GEN_FOLDER + "/" + Names.concept(concept);
    }

    // public static enumeration(enumeration: PiLangEnumeration): string {
    //     return LANGUAGE_GEN_FOLDER + "/" + Names.enumeration(enumeration);
    // }
    //
    // public static union(union: PiLangUnion): string {
    //     return LANGUAGE_GEN_FOLDER + "/" + Names.union(union);
    // }

    public static languageConceptType(language: PiLanguage): string {
        return LANGUAGE_GEN_FOLDER + "/" + Names.metaType(language);
    }

    public static allConcepts(language: PiLanguage): string {
        return LANGUAGE_GEN_FOLDER + "/" + Names.allConcepts(language);
    }

    // the generated classes that implement the editor can be found in ...
    public static context(language: PiLanguage): string {
        return EDITOR_GEN_FOLDER + "/" + Names.context(language);
    }

    public static actions(language: PiLanguage): string {
        return EDITOR_GEN_FOLDER + "/" + Names.actions(language);
    }

    public static defaultActions(language: PiLanguage): string {
        return EDITOR_GEN_FOLDER + "/" + Names.defaultActions(language);
    }

    public static customActions(language: PiLanguage): string {
        return EDITOR_FOLDER + "/" + Names.customActions(language);
    }

    public static projectionDefault(language: PiLanguage): string {
        return EDITOR_GEN_FOLDER + "/" + Names.projectionDefault(language);
    }

    public static selectionHelpers(language: PiLanguage): string {
        return EDITOR_GEN_FOLDER + "/" + Names.selectionHelpers(language);
    }

    public static projection(language: PiLanguage): string {
        return EDITOR_GEN_FOLDER + "/" + Names.customProjection(language);
    }

    // TODO see if we can remove this parameter
    public static mainProjectionalEditor(language: PiLanguage): string {
        return EDITOR_GEN_FOLDER + "/" + Names.mainProjectionalEditor;
    }

    // the generated classes that implement the scoper can be found in ...
    public static namespace(language: PiLanguage): string {
        return SCOPER_GEN_FOLDER + "/" + Names.namespace(language);
    }

    public static scoper(language: PiLanguage): string {
        return SCOPER_GEN_FOLDER + "/" + Names.scoper(language);
    }

    // the generated classes that implement the typer can be found in ...
    public static typer(language: PiLanguage): string {
        return TYPER_GEN_FOLDER + "/" + Names.typer(language);
    }

    // the generated classes that implement the validator can be found in ...
    public static validator(language: PiLanguage): string {
        return VALIDATOR_GEN_FOLDER + "/" + Names.validator(language);
    }

    public static checker(language: PiLanguage): string {
        return VALIDATOR_GEN_FOLDER + "/" + Names.rulesChecker(language);
    }

    // the generated classes that implement the unparser can be found in ...
    public static unparser(language: PiLanguage): string {
        return LANGUAGE_UTILS_GEN_FOLDER + "/" + Names.unparser(language);
    }

    // the generated classes that implement the visitor pattern can be found in ...
    public static walker(language: PiLanguage): string {
        return LANGUAGE_UTILS_GEN_FOLDER + "/" + Names.walker(language);
    }

    public static workerInterface(language: PiLanguage): string {
        return LANGUAGE_UTILS_GEN_FOLDER + "/" + Names.workerInterface(language);
    }

    public static defaultWorker(language: PiLanguage): string {
        return LANGUAGE_UTILS_GEN_FOLDER + "/" + Names.defaultWorker(language);
    }
}
