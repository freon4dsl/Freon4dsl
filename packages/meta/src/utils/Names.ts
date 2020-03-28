import { PiLangConcept, PiLangEnumeration, PiLanguageUnit, PiLangUnion, PiLangConceptProperty } from "../languagedef/metalanguage/PiLanguage";
import { PiScopeDef } from "../scoperdef/metalanguage/PiScopeDefLang";
import { PiValidatorDef } from "../validatordef/metalanguage/ValidatorDefLang";

/**
 * Defines all names that are used in the generation, to ensure they are identical
 * at each usage.
 */
export class Names {
    //TODO add check on undefined and null of parameter in all functions
    public static context(language: PiLanguageUnit): string {
        return language?.name + "Context";
    }

    public static actions(language: PiLanguageUnit): string {
        return language?.name + "Actions";
    }

    public static defaultActions(language: PiLanguageUnit): string {
        return language?.name + "DefaultActions";
    }

    public static manualActions(language: PiLanguageUnit): string {
        return language?.name + "ManualActions";
    }

    public static projectionDefault(language: PiLanguageUnit): string {
        return language?.name + "ProjectionDefault";
    }

    public static selectionHelpers(language: PiLanguageUnit): string {
        return language?.name + "SelectionHelpers";
    }

    public static projection(language: PiLanguageUnit): string {
        return language?.name + "Projection";
    }

    public static editor(language: PiLanguageUnit): string {
        return language?.name + "Editor";
    }

    public static mainProjectionalEditor(language: PiLanguageUnit): string {
        return "MainProjectionalEditor";
    }

    public static concept(concept: PiLangConcept): string {
        return concept?.name;
    }

    public static enumeration(enumeration: PiLangEnumeration): string {
        return enumeration?.name;
    }
    // TODO change function name to 'union'
    public static type(union: PiLangUnion): string {
        return union?.name;
    }

    public static languageConceptType(language: PiLanguageUnit): string {
        return language?.name + "ConceptType";
    }

    public static allConcepts(language: PiLanguageUnit): string {
        return "All" + language?.name + "Concepts";
    }

    public static scoperInterface(): string {
        return "PiScoper";
    }

    public static typerInterface(): string {
        return "PiTyper";
    }
    
    public static validatorInterface(): string {
        return "PiValidator";
    }

    public static namespace(language: PiLanguageUnit, scopedef: PiScopeDef): string {
        return scopedef.scoperName + "Namespace";
    }

    // TODO validator gen needs this but it should be part of the environment
    public static typer(language: PiLanguageUnit): string {
        return language?.name + "Typer";
    }

    public static scoper(language: PiLanguageUnit, scopedef: PiScopeDef): string {
        return scopedef?.scoperName + "Scoper";
    }

    public static validator(language: PiLanguageUnit, validdef: PiValidatorDef): string {
        return validdef?.validatorName + "Validator"; 
    }

    public static checker(language: PiLanguageUnit, validdef: PiValidatorDef): string {
        return validdef?.validatorName + "Checker"; 
    }

    public static errorClassName(): string {
        return "PiError"; 
    }

    public static unparser(language: PiLanguageUnit): string {
        return language?.name + "Unparser"; 
    }

    public static walker(language: PiLanguageUnit): string {
        return language?.name + "Walker";
    }

    public static workerInterface(language: PiLanguageUnit): string {
        return language?.name + "Worker";
    }

}
