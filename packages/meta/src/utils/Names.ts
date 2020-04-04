import { PiLangConcept, PiLangEnumeration, PiLanguageUnit, PiLangUnion } from "../languagedef/metalanguage/PiLanguage";

/**
 * Defines all names that are used in the generation, to ensure they are identical
 * at each usage.
 */
export class Names {
    public static PiNamedElement = "PiNamedElement";
    public static PiElement = "PiElement";
    public static PiExpression = "PiExpression";
    public static PiBinaryExpression = "PiBinaryExpression";
    public static PiScoper = "PiScoper";
    public static PiTyper = "PiTyper";
    public static PiValidator = "PiValidator";
    public static PiError = "PiError"; 
    public static PiContext = "PiContext";
    public static PiActions = "PiActions";
    public static PiEditor = "PiEditor";
    public static PiProjection = "PiProjection";
    public static Box = "Box";
    public static PiElementReference = "PiElementReference";
    public static PiEnvironment = "PiEnvironment";
    public static CompositeProjection = "CompositeProjection";
    public static ProjectionalEditor = "ProjectionalEditor";
    public static mainProjectionalEditor = "MainProjectionalEditor";
    public static styles = "projectitStyles";

    public static environment(language: PiLanguageUnit) {
        return language?.name + "Environment";
    }
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

    public static initialization(language: PiLanguageUnit) {
        return language.name + "Initialization";
    }

    public static concept(concept: PiLangConcept): string {
        return concept?.name;
    }

    public static enumeration(enumeration: PiLangEnumeration): string {
        return enumeration?.name;
    }
    
    public static union(union: PiLangUnion): string {
        return union?.name;
    }

    public static metaType(language: PiLanguageUnit): string {
        return language?.name + "ConceptType";
    }

    public static allConcepts(language: PiLanguageUnit): string {
        return "All" + language?.name + "Concepts";
    }

    public static namespace(language: PiLanguageUnit): string {
        return language?.name + "Namespace";
    }

    public static scoper(language: PiLanguageUnit): string {
        return language?.name + "Scoper";
    }

    public static validator(language: PiLanguageUnit): string {
        return language?.name + "Validator"; 
    }

    public static checker(language: PiLanguageUnit): string {
        return language?.name + "Checker"; 
    }

    public static typer(language: PiLanguageUnit): string {
        return language?.name + "Typer";
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
