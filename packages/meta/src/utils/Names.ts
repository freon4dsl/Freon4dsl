import {
    PiClassifier, PiConcept, PiInterface,
    PiLanguage
} from "../languagedef/metalanguage/PiLanguage";

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
    public static PiStdlib = "PiStdlib";
    public static PiUnparser = "PiUnparser";
    public static PiError = "PiError"; 
    public static PiActions = "PiActions";
    public static PiEditor = "PiEditor";
    public static PiProjection = "PiProjection";
    public static PiModelInitialization = "PiModelInitialization";
    public static Box = "Box";
    public static PiElementReference = "PiElementReference";
    public static PiEnvironment = "PiEnvironment";
    public static CompositeProjection = "PiCompositeProjection";
    public static ProjectionalEditor = "ProjectionalEditor";
    public static mainProjectionalEditor = "MainProjectionalEditor";
    public static styles = "projectitStyles";
    public static nameForSelf = "self";

    // because the below Names are used to generate TypeScript classes
    // they all have to start with an uppercase character

    public static configuration(language: PiLanguage) {
        return "ProjectitConfiguration";
    }

    public static environment(language: PiLanguage) {
        return this.startWithUpperCase(language?.name) + "Environment";
    }

    public static context(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Context";
    }

    public static actions(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Actions";
    }

    public static defaultActions(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "DefaultActions";
    }

    public static customActions(language: PiLanguage): string {
        return "Custom" + this.actions(language);
    }

    public static projectionDefault(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "ProjectionDefault";
    }

    public static selectionHelpers(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "SelectionHelpers";
    }

    public static customProjection(language: PiLanguage): string {
        return "Custom" + this.startWithUpperCase(language?.name) + "Projection";
    }

    public static language(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Language";
    }

    public static initialization(language: PiLanguage) {
        return this.startWithUpperCase(language?.name) + "Initialization";
    }

    public static concept(concept: PiConcept): string {
        return this.startWithUpperCase(concept?.name);
    }

    public static classifier(concept: PiClassifier): string {
        return this.startWithUpperCase(concept?.name);
    }

    public static interface(interf: PiInterface): string {
        return this.startWithUpperCase(interf?.name);
    }

    public static metaType(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "ConceptType";
    }

    public static allConcepts(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "EveryConcept";
    }

    public static namespace(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Namespace";
    }

    public static scoper(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Scoper";
    }

    public static scoperUtils(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "ScoperUtils";
    }

    public static namesCollector(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "NamesCollector";
    }

    public static validator(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Validator";
    }

    public static checker(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Checker";
    }

    public static typer(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Typer";
    }

    public static stdlib(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Stdlib";
    }

    public static walker(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Walker";
    }

    public static workerInterface(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Worker";
    }

    public static startWithUpperCase(word: string): string {
        if (!!word) return word[0].toUpperCase() + word.substr(1);
        return '';
    }

    public static projectionFunction(c: PiConcept): string {
        return "get" + Names.concept(c) + "Box";
    }

    public static unparser(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Unparser";
    }

    public static pegjsInput(unit: PiConcept): string {
        return this.startWithUpperCase(unit?.name) + "UnitParser";
    }

    public static parser(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Parser";
    }

    public static parserCreator(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "CreatorPartOfParser";
    }
}
