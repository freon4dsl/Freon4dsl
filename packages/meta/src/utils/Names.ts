import {
    PiClassifier, PiConcept, PiInterface,
    PiLanguage
} from "../languagedef/metalanguage";

/**
 * Defines all names that are used in the generation, to ensure they are identical
 * at each usage.
 */
export class Names {
    // tslint:disable-next-line:variable-name
    public static PiNamedElement = "PiNamedElement";
    // tslint:disable-next-line:variable-name
    public static PiElement = "PiElement";
    // tslint:disable-next-line:variable-name
    public static PiExpression = "PiExpression";
    // tslint:disable-next-line:variable-name
    public static PiBinaryExpression = "PiBinaryExpression";
    // tslint:disable-next-line:variable-name
    public static PiScoper = "PiScoper";
    // tslint:disable-next-line:variable-name
    public static PiTyper = "PiTyper";
    // tslint:disable-next-line:variable-name
    public static PiValidator = "PiValidator";
    // tslint:disable-next-line:variable-name
    public static PiStdlib = "PiStdlib";
    // tslint:disable-next-line:variable-name
    public static PiUnparser = "PiUnparser";
    // tslint:disable-next-line:variable-name
    public static PiError = "PiError";
    // tslint:disable-next-line:variable-name
    public static PiErrorSeverity = "PiErrorSeverity";
    // tslint:disable-next-line:variable-name
    public static PiActions = "PiActions";
    // tslint:disable-next-line:variable-name
    public static PiEditor = "PiEditor";
    // tslint:disable-next-line:variable-name
    public static PiProjection = "PiProjection";
    // tslint:disable-next-line:variable-name
    public static PiModelInitialization = "PiModelInitialization";
    // tslint:disable-next-line:variable-name
    public static Box = "Box";
    // tslint:disable-next-line:variable-name
    public static PiElementReference = "PiElementReference";
    // tslint:disable-next-line:variable-name
    public static PiEnvironment = "PiEnvironment";
    // tslint:disable-next-line:variable-name
    public static CompositeProjection = "PiCompositeProjection";
    // tslint:disable-next-line:variable-name
    public static ProjectionalEditor = "ProjectionalEditor";
    public static mainProjectionalEditor = "MainProjectionalEditor";
    public static styles = "projectitStyles";
    public static nameForSelf = "self";

    // because the below Names are used to generate TypeScript classes
    // they all have to start with an uppercase character

    // TODO see if we can remove this parameter
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

    public static checkerInterface(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "CheckerInterface";
    }

    public static rulesChecker(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "ValidationRulesChecker";
    }

    public static nonOptionalsChecker(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "NonOptionalsChecker";
    }

    public static referenceChecker(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "ReferenceChecker";
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

    public static defaultWorker(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "DefaultWorker";
    }

    public static startWithUpperCase(word: string): string {
        if (!!word) {
            return word[0].toUpperCase() + word.substr(1);
        }
        return "";
    }

    public static projectionFunction(c: PiConcept): string {
        return "get" + Names.concept(c) + "Box";
    }

    public static unparser(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Unparser";
    }

    public static pegjs(unit: PiConcept): string {
        return this.startWithUpperCase(unit?.name) + "UnitParser";
    }

    public static parser(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Parser";
    }

    public static parserCreator(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "CreatorPartOfParser";
    }

}
