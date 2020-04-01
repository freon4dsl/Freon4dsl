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
    public static languageGenFolder = "language/gen/";
    public static environmentGenFolder = "environment/gen/";

    public static concept(concept: PiLangConcept): string {
        return this.languageGenFolder + Names.concept(concept);
    }

    public static enumeration(enumeration: PiLangEnumeration): string {
        return this.languageGenFolder + Names.enumeration(enumeration);
    }
    
    public static union(union: PiLangUnion): string {
        return this.languageGenFolder + Names.union(union);
    }

    public static languageConceptType(language: PiLanguageUnit): string {
        return this.languageGenFolder + Names.metaType(language);
    }

    public static allConcepts(language: PiLanguageUnit): string {
        return this.languageGenFolder + Names.allConcepts(language);
    }

    // the generated classes that implement the editor can be found in ...
    public static editorGenFolder = "editor/gen/";
    public static editorFolder = "editor/";
    public static editorstyles = "styles/styles";
    public static context(language: PiLanguageUnit): string {
        return this.editorGenFolder + Names.context(language);  ;
    }

    public static actions(language: PiLanguageUnit): string {
        return this.editorGenFolder + Names.actions(language);
    }

    public static defaultActions(language: PiLanguageUnit): string {
        return this.editorGenFolder + Names.defaultActions(language);
    }

    public static manualActions(language: PiLanguageUnit): string {
        return this.editorGenFolder + Names.manualActions(language);
    }

    public static projectionDefault(language: PiLanguageUnit): string {
        return this.editorGenFolder + Names.projectionDefault(language);
    }

    public static selectionHelpers(language: PiLanguageUnit): string {
        return this.editorGenFolder + Names.selectionHelpers(language);
    }

    public static projection(language: PiLanguageUnit): string {
        return this.editorGenFolder + Names.projection(language);
    }

    public static editor(language: PiLanguageUnit): string {
        return this.editorGenFolder + Names.editor(language);
    }

    public static mainProjectionalEditor(language: PiLanguageUnit): string {
        return this.editorGenFolder + Names.mainProjectionalEditor(language);
    }

    // the generated classes that implement the scoper can be found in ...
    public static scoperGenFolder = "scoper/gen/";
    public static namespace(language: PiLanguageUnit): string {
        return this.scoperGenFolder + Names.namespace(language);
    }

    public static scoper(language: PiLanguageUnit): string {
        return this.scoperGenFolder + Names.scoper(language);
    }

    // the generated classes that implement the typer can be found in ...
    public static typerGenFolder = "typer/gen/";
    public static typer(language: PiLanguageUnit): string {
        return this.typerGenFolder + Names.typer(language);
    }

    // the generated classes that implement the validator can be found in ...
    public static validatorGenFolder = "validator/gen/";
    public static validator(language: PiLanguageUnit): string {
        return this.validatorGenFolder + Names.validator(language);
    }

    public static checker(language: PiLanguageUnit): string {
        return this.validatorGenFolder + Names.checker(language);
    }

    // the generated classes that implement the unparser can be found in ...
    public static utilsGenFolder = "utils/gen/";
    public static unparser(language: PiLanguageUnit): string {
        return this.utilsGenFolder + Names.unparser(language);
    }

    // the generated classes that implement the visitor pattern can be found in ...
    public static walker(language: PiLanguageUnit): string {
        return this.utilsGenFolder + Names.walker(language);
    }

    public static workerInterface(language: PiLanguageUnit): string {
        return this.utilsGenFolder + Names.workerInterface(language);
    }

}
