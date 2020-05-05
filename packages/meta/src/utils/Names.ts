import {
    PiClassifier, PiConcept, PiInterface,
    PiLanguageUnit
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

    // because the below Names are used to generate TypeScript classes
    // they all have to start with an uppercase character

    public static environment(language: PiLanguageUnit) {
        return this.startWithUpperCase(language?.name) + "Environment";
    }
    public static context(language: PiLanguageUnit): string {
        return this.startWithUpperCase(language?.name) + "Context";
    }

    public static actions(language: PiLanguageUnit): string {
        return this.startWithUpperCase(language?.name) + "Actions";
    }

    public static defaultActions(language: PiLanguageUnit): string {
        return this.startWithUpperCase(language?.name) + "DefaultActions";
    }

    public static manualActions(language: PiLanguageUnit): string {
        return this.startWithUpperCase(language?.name) + "ManualActions";
    }

    public static projectionDefault(language: PiLanguageUnit): string {
        return this.startWithUpperCase(language?.name) + "ProjectionDefault";
    }

    public static selectionHelpers(language: PiLanguageUnit): string {
        return this.startWithUpperCase(language?.name) + "SelectionHelpers";
    }

    public static projection(language: PiLanguageUnit): string {
        return this.startWithUpperCase(language?.name) + "Projection";
    }

    public static language(language: PiLanguageUnit): string {
        return this.startWithUpperCase(language?.name) + "Language";
    }

    public static initialization(language: PiLanguageUnit) {
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

    public static metaType(language: PiLanguageUnit): string {
        return this.startWithUpperCase(language?.name) + "ConceptType";
    }

    public static allConcepts(language: PiLanguageUnit): string {
        return this.startWithUpperCase(language?.name) + "EveryConcept";
    }

    public static namespace(language: PiLanguageUnit): string {
        return this.startWithUpperCase(language?.name) + "Namespace";
    }

    public static scoper(language: PiLanguageUnit): string {
        return this.startWithUpperCase(language?.name) + "Scoper";
    }

    public static validator(language: PiLanguageUnit): string {
        return this.startWithUpperCase(language?.name) + "Validator";
    }

    public static checker(language: PiLanguageUnit): string {
        return this.startWithUpperCase(language?.name) + "Checker";
    }

    public static typer(language: PiLanguageUnit): string {
        return this.startWithUpperCase(language?.name) + "Typer";
    }

    public static stdlib(language: PiLanguageUnit): string {
        return this.startWithUpperCase(language?.name) + "Stdlib";
    }

    public static unparser(language: PiLanguageUnit): string {
        return this.startWithUpperCase(language?.name) + "Unparser";
    }

    public static walker(language: PiLanguageUnit): string {
        return this.startWithUpperCase(language?.name) + "Walker";
    }

    public static workerInterface(language: PiLanguageUnit): string {
        return this.startWithUpperCase(language?.name) + "Worker";
    }

    private static startWithUpperCase(word: string): string {
        if (!!word) return word[0].toUpperCase() + word.substr(1);
        return '';
    }


}
