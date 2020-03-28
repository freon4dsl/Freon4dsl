import { PiLangConcept, PiLangEnumeration, PiLanguageUnit, PiLangUnion, PiLangConceptProperty } from "../languagedef/metalanguage/PiLanguage";
import { PiScopeDef } from "../scoperdef/metalanguage/PiScopeDefLang";
import { PiValidatorDef } from "../validatordef/metalanguage/ValidatorDefLang";

/**
 * Defines all names that are used in the generation, to ensure they are identical
 * at each usage.
 */
export class Names {
    //TODO add check on undefined and null of parameter in all functions
    public static context(language: PiLanguageUnit){
        return language?.name + "Context";
    }

    public static actions(language: PiLanguageUnit){
        return language?.name + "Actions";
    }

    public static defaultActions(language: PiLanguageUnit){
        return language?.name + "DefaultActions";
    }

    public static manualActions(language: PiLanguageUnit){
        return language?.name + "ManualActions";
    }

    public static projectionDefault(language: PiLanguageUnit){
        return language?.name + "ProjectionDefault";
    }

    public static selectionHelpers(language: PiLanguageUnit){
        return language?.name + "SelectionHelpers";
    }

    public static projection(language: PiLanguageUnit){
        return language?.name + "Projection";
    }

    public static editor(language: PiLanguageUnit){
        return language?.name + "Editor";
    }

    public static mainProjectionalEditor(language: PiLanguageUnit){
        return "MainProjectionalEditor";
    }

    public static concept(concept: PiLangConcept){
        return concept?.name;
    }

    public static enumeration(enumeration: PiLangEnumeration){
        return enumeration?.name;
    }
    // TODO change function name to 'union'
    public static type(union: PiLangUnion){
        return union?.name;
    }

    public static languageConceptType(language: PiLanguageUnit){
        return language?.name + "ConceptType";
    }

    public static allConcepts(language: PiLanguageUnit){
        return "All" + language?.name + "Concepts";
    }

    public static scoperInterface(){
        return "PiScoper";
    }

    public static typerInterface(){
        return "PiTyper";
    }
    
    public static validatorInterface(){
        return "PiValidator";
    }

    public static namespace(language: PiLanguageUnit, scopedef: PiScopeDef){
        return scopedef.scoperName + "Namespace";
    }

    public static environment(language: PiLanguageUnit){
        return language.name + "Environment";
    }


    // TODO validator gen needs this but it should be part of the environment
    public static typer(language: PiLanguageUnit){
        return language?.name + "Typer";
    }

    public static scoper(language: PiLanguageUnit, scopedef: PiScopeDef){
        return scopedef?.scoperName + "Scoper";
    }

    public static validator(language: PiLanguageUnit, validdef: PiValidatorDef){
        return validdef?.validatorName + "Validator"; 
    }

    public static checker(language: PiLanguageUnit, validdef: PiValidatorDef){
        return validdef?.validatorName + "Checker"; 
    }

    public static errorClassName(){
        return "PiError"; 
    }

    public static unparser(language: PiLanguageUnit){
        return language?.name + "Unparser"; 
    }

}
