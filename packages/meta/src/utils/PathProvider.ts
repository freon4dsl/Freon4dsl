import { PiLanguageUnit, PiLangConcept, PiLangEnumeration, PiLangUnion } from "../languagedef/metalanguage/PiLanguage";
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
export const WEBAPP_FOLDER = "../webapp"
export const APP_FOLDER = "../webapp/app"
export const ASSETS_FOLDER = "../webapp/assets"
export const STYLES_FOLDER = "../webapp/styles"
export const TOOLBARS_FOLDER = "../webapp/toolbars"
// the predefined interfaces and classes can be found in ...
export const PROJECTITCORE = "@projectit/core";
export const scoperInterface = PROJECTITCORE;
export const typerInterface = PROJECTITCORE;
export const validatorInterface = PROJECTITCORE;
export const errorClass = PROJECTITCORE;
export const piNamedElement = PROJECTITCORE;
export const EDITORSTYLES = STYLES_FOLDER + "/styles";

/**
 * Defines all paths to files and folders that are used in the generation, to ensure they are identical
 * at each usage.
 */
export class PathProvider {
    // the definitions files can be found in ...
    public static editFile(defFolder: string, languageFile: string) : string {
        let languageName : string = languageFile.slice(0, languageFile.length-5);
        return defFolder + "/" + languageName + ".edit";
    }
    
    public static langFile(defFolder: string, languageFile: string) : string {
        let languageName : string = languageFile.slice(0, languageFile.length-5);
        return defFolder + "/" + languageName + ".lang";
    }
    
    public static validFile(defFolder: string, languageFile: string) : string {
        let languageName : string = languageFile.slice(0, languageFile.length-5);
        return defFolder + "/" + languageName + ".valid";
    }
    
    public static scopeFile(defFolder: string, languageFile: string) : string {
        let languageName : string = languageFile.slice(0, languageFile.length-5);
        return defFolder + "/" + languageName + ".scop";
    }
    
    public static typeFile(defFolder: string, languageFile: string) : string {
        let languageName : string = languageFile.slice(0, languageFile.length-5);
        return defFolder + "/" + languageName + ".type";
    }

    // the generated classes that implement the language can be found in ...
    public static concept(concept: PiLangConcept): string {
        return LANGUAGE_GEN_FOLDER + "/" + Names.concept(concept);
    }

    public static enumeration(enumeration: PiLangEnumeration): string {
        return LANGUAGE_GEN_FOLDER + "/" + Names.enumeration(enumeration);
    }
    
    public static union(union: PiLangUnion): string {
        return LANGUAGE_GEN_FOLDER + "/" + Names.union(union);
    }

    public static languageConceptType(language: PiLanguageUnit): string {
        return LANGUAGE_GEN_FOLDER + "/" + Names.metaType(language);
    }

    public static allConcepts(language: PiLanguageUnit): string {
        return LANGUAGE_GEN_FOLDER + "/" + Names.allConcepts(language); 
    }

    // the generated classes that implement the editor can be found in ...
    public static context(language: PiLanguageUnit): string {
        return EDITOR_GEN_FOLDER + "/" + Names.context(language);  ;
    }

    public static actions(language: PiLanguageUnit): string {
        return EDITOR_GEN_FOLDER + "/" + Names.actions(language);
    }

    public static defaultActions(language: PiLanguageUnit): string {
        return EDITOR_GEN_FOLDER + "/" + Names.defaultActions(language);
    }

    public static manualActions(language: PiLanguageUnit): string {
        return EDITOR_GEN_FOLDER + "/" + Names.manualActions(language);
    }

    public static projectionDefault(language: PiLanguageUnit): string {
        return EDITOR_GEN_FOLDER + "/" + Names.projectionDefault(language);
    }

    public static selectionHelpers(language: PiLanguageUnit): string {
        return EDITOR_GEN_FOLDER + "/" + Names.selectionHelpers(language);
    }

    public static projection(language: PiLanguageUnit): string {
        return EDITOR_GEN_FOLDER + "/" + Names.projection(language);
    }

    public static editor(language: PiLanguageUnit): string {
        return EDITOR_GEN_FOLDER + "/" + Names.editor(language);
    }

    public static mainProjectionalEditor(language: PiLanguageUnit): string {
        return EDITOR_GEN_FOLDER + "/" + Names.mainProjectionalEditor;
    }

    // the generated classes that implement the scoper can be found in ...
    public static namespace(language: PiLanguageUnit): string {
        return SCOPER_GEN_FOLDER + "/" + Names.namespace(language);
    }

    public static scoper(language: PiLanguageUnit): string {
        return SCOPER_GEN_FOLDER + "/" + Names.scoper(language);
    }

    // the generated classes that implement the typer can be found in ...
    public static typer(language: PiLanguageUnit): string {
        return TYPER_GEN_FOLDER + "/" + Names.typer(language);
    }

    // the generated classes that implement the validator can be found in ...
    public static validator(language: PiLanguageUnit): string {
        return VALIDATOR_GEN_FOLDER + "/" + Names.validator(language);
    }

    public static checker(language: PiLanguageUnit): string {
        return VALIDATOR_GEN_FOLDER + "/" + Names.checker(language);
    }

    // the generated classes that implement the unparser can be found in ...
    public static unparser(language: PiLanguageUnit): string {
        return LANGUAGE_UTILS_GEN_FOLDER + "/" + Names.unparser(language);
    }

    // the generated classes that implement the visitor pattern can be found in ...
    public static walker(language: PiLanguageUnit): string {
        return LANGUAGE_UTILS_GEN_FOLDER + "/" + Names.walker(language);
    }

    public static workerInterface(language: PiLanguageUnit): string {
        return LANGUAGE_UTILS_GEN_FOLDER + "/" + Names.workerInterface(language);
    }

}
