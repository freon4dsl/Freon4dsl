import { PiLangConcept, PiLangEnumeration, PiLanguageUnit, PiLangUnion } from "../languagedef/metalanguage/PiLanguage";
import { PiScopeDef } from "../scoperdef/metalanguage/PiScopeDefLang";
import { PiValidatorDef } from "../validatordef/metalanguage/PiValidatorDefLang";

/**
 * Defines all names that are used in the generation, to ensure they are identical
 * at each usage.
 */
export class Names {
    public static context(language: PiLanguageUnit){
        return language.name + "Context";
    }

    public static actions(language: PiLanguageUnit){
        return language.name + "Actions";
    }

    public static defaultActions(language: PiLanguageUnit){
        return language.name + "DefaultActions";
    }

    public static manualActions(language: PiLanguageUnit){
        return language.name + "ManualActions";
    }

    public static projectionDefault(language: PiLanguageUnit){
        return language.name + "ProjectionDefault";
    }

    public static enumProjections(language: PiLanguageUnit){
        return language.name + "EnumerationProjections";
    }

    public static projection(language: PiLanguageUnit){
        return language.name + "Projection";
    }

    public static editor(language: PiLanguageUnit){
        return language.name + "Editor";
    }

    public static mainProjectionalEditor(language: PiLanguageUnit){
        return "MainProjectionalEditor";
    }

    public static concept(concept: PiLangConcept){
        return concept.name;
    }

    public static enumeration(enumeration: PiLangEnumeration){
        return enumeration.name;
    }

    public static type(type: PiLangUnion){
        return type.name;
    }

    public static languageConceptType(language: PiLanguageUnit){
        return language.name + "ConceptType";
    }

    public static allConcepts(language: PiLanguageUnit){
        return "All" + language.name + "Concepts";
    }

    public static scoperInterface(language: PiLanguageUnit){
        return "I" + language.name + "Scoper";
    }

    public static typerInterface(language: PiLanguageUnit){
        return "I" + language.name + "Typer";
    }
    
    public static validatorInterface(language: PiLanguageUnit){
        return "I" + language.name + "Validator";
    }

    public static namespace(language: PiLanguageUnit, scopedef: PiScopeDef){
        return scopedef.scoperName + "Namespace";
    }

    public static scoper(language: PiLanguageUnit, scopedef: PiScopeDef){
        return scopedef.scoperName + "Scoper";
    }

    public static validator(language: PiLanguageUnit, validdef: PiValidatorDef){
        return "DemoValidator"; // TODO
    }

    public static errorClassName(language: PiLanguageUnit, ){
        return "ViError"; // TODO
    }

}
