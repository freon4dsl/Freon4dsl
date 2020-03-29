import { PiLanguageUnit, PiLangConcept, PiLangEnumeration, PiLangUnion } from "../languagedef/metalanguage/PiLanguage";
import { Names } from "./Names";
import { PiScopeDef } from "../scoperdef/metalanguage/PiScopeDefLang";
import { PiValidatorDef } from "../validatordef/metalanguage/ValidatorDefLang";

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

    // the predefined interfaces and classes can be found in ...
    // TODO change into properties
    public static corePath = "@projectit/core";
    
    public static scoperInterface(): string {
        return "@projectit/core"
    }

    public static typerInterface(): string {
        return "@projectit/core"
    }
    
    public static validatorInterface(): string {
        return "@projectit/core"
    }

    public static errorClass(): string {
        return "@projectit/core"
    }

    public static piNamedElement() {
        return "@projectit/core"
    }

    // the generated classes that implement the language can be found in ...
    public static languageFolder = "language";
    public static environment = "environment";

    public static concept(concept: PiLangConcept): string {
        return "language/" + Names.concept(concept);
    }

    public static enumeration(enumeration: PiLangEnumeration): string {
        return "language/" + Names.enumeration(enumeration);
    }
    
    public static union(union: PiLangUnion): string {
        return "language/" + Names.union(union);
    }

    public static languageConceptType(language: PiLanguageUnit): string {
        return "language/" + Names.metaType(language);
    }

    public static allConcepts(language: PiLanguageUnit): string {
        return "language/" + Names.allConcepts(language);
    }

    // the generated classes that implement the editor can be found in ...
    public static editorstyles = "styles/styles";
    public static context(language: PiLanguageUnit): string {
        return "editor/gen/" + Names.context(language);  ;
    }

    public static actions(language: PiLanguageUnit): string {
        return "editor/gen/" + Names.actions(language);
    }

    public static defaultActions(language: PiLanguageUnit): string {
        return "editor/gen/" + Names.defaultActions(language);
    }

    public static manualActions(language: PiLanguageUnit): string {
        return "editor/gen/" + Names.manualActions(language);
    }

    public static projectionDefault(language: PiLanguageUnit): string {
        return "editor/gen/" + Names.projectionDefault(language);
    }

    public static selectionHelpers(language: PiLanguageUnit): string {
        return "editor/gen/" + Names.selectionHelpers(language);
    }

    public static projection(language: PiLanguageUnit): string {
        return "editor/gen/" + Names.projection(language);
    }

    public static editor(language: PiLanguageUnit): string {
        return "editor/gen/" + Names.editor(language);
    }

    public static mainProjectionalEditor(language: PiLanguageUnit): string {
        return "editor/gen/" + Names.mainProjectionalEditor(language);
    }

    // the generated classes that implement the scoper can be found in ...
    public static namespace(language: PiLanguageUnit): string {
        return "scoper/gen/" + Names.namespace(language);
    }

    public static scoper(language: PiLanguageUnit): string {
        return "scoper/gen/" + Names.scoper(language);
    }

    // the generated classes that implement the typer can be found in ...
    public static typer(language: PiLanguageUnit): string {
        return "typer/gen/" + Names.typer(language);
    }

    // the generated classes that implement the validator can be found in ...
    public static validator(language: PiLanguageUnit): string {
        return "validator/gen/" + Names.validator(language);
    }

    public static checker(language: PiLanguageUnit): string {
        return "validator/gen/" + Names.checker(language);
    }

    // the generated classes that implement the unparser can be found in ...
    public static unparser(language: PiLanguageUnit): string {
        // TODO should be changed into 
        // return "unparser/gen/" + Names.unparser(language);
        return "unparser/" + Names.unparser(language);
    }

    // the generated classes that implement the visitor pattern can be found in ...
    public static walker(language: PiLanguageUnit): string {
        return "utils/gen/" + Names.walker(language);
    }

    public static workerInterface(language: PiLanguageUnit): string {
        return "utils/gen/" + Names.workerInterface(language);
    }

}
