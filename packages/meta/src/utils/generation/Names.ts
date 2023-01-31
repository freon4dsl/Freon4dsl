import {
    PiClassifier, PiConcept, PiInstance, PiInterface, PiLanguage, PiPrimitiveProperty, PiProperty, PiModelDescription, PiUnitDescription
} from "../../languagedef/metalanguage";
import { PiEditClassifierProjection, PiEditProjectionGroup, PiEditTableProjection } from "../../editordef/metalanguage";

/**
 * Defines all names that are used in the generation, to ensure they are identical
 * at each usage.
 */
export class Names {
    // tslint:disable-next-line:variable-name
    public static PiNamedElement: string = "FreNamedNode";
    // tslint:disable-next-line:variable-name
    public static PiElement: string = "FreNode";
    // tslint:disable-next-line:variable-name
    public static PiExpression: string = "FreExpressionNode";
    // tslint:disable-next-line:variable-name
    public static PiBinaryExpression: string = "FreBinaryExpression";
    // tslint:disable-next-line:variable-name
    public static PiScoper: string = "FreScoper";
    // tslint:disable-next-line:variable-name
    public static FreScoperBase: string = "FreScoperBase";
    // tslint:disable-next-line:variable-name
    public static FreScoperComposite: string = "FreScoperComposite";
    // tslint:disable-next-line:variable-name
    public static FrScoperPart: string = "FreScoper";
    // tslint:disable-next-line:variable-name
    public static FreonTyperPart: string = "FreTyper";
    // tslint:disable-next-line:variable-name
    public static FreTyper: string = "FreCompositeTyper";
    // tslint:disable-next-line:variable-name
    public static PiValidator: string = "FreValidator";
    // tslint:disable-next-line:variable-name
    public static PiStdlib: string = "FreStdlib";
    // tslint:disable-next-line:variable-name
    public static PiWriter: string = "FreWriter";
    // tslint:disable-next-line:variable-name
    public static PiReader: string = "FreReader";
    // tslint:disable-next-line:variable-name
    public static PiError: string = "FreError";
    // tslint:disable-next-line:variable-name
    public static FreonInterpreter: string = "FreInterpreter";
    // tslint:disable-next-line:variable-name
    public static PiErrorSeverity: string = "FreErrorSeverity";
    // tslint:disable-next-line:variable-name
    public static PiActions: string = "FreCombinedActions";
    // tslint:disable-next-line:variable-name
    public static PiEditor: string = "FreEditor";
    // tslint:disable-next-line:variable-name
    public static PiProjection: string = "FreProjection";
    public static PiCompositeProjection: string = "FreCompositeProjection";
    // tslint:disable-next-line:variable-name
    public static PiModelInitialization: string = "FreModelInitialization";
    // tslint:disable-next-line:variable-name
    public static Box: string = "Box";
    // tslint:disable-next-line:variable-name
    public static PiElementReference: string = "FreNodeReference";
    // tslint:disable-next-line:variable-name
    public static PiEnvironment: string = "FreEnvironment";
    public static PiParseLocation: string = "FreParseLocation";
    public static PiUtils: string = "FreUtils";
    public static PiModel: string = "FreModel";
    public static PiModelUnit: string = "FreModelUnit";
    public static FreLanguage: string = "FreLanguage";
    // tslint:disable-next-line:variable-name
    public static ProjectionalEditor: string = "ProjectionalEditor";
    public static mainProjectionalEditor: string = "MainProjectionalEditor";
    public static styles: string = "projectitStyles";
    public static nameForSelf: string = "self";
    public static initializeLanguage: string = "initializeLanguage";
    public static defaultProjectionName: string = "default";
    // reserved role names for expressions, use with care.
    // Should remain identical to the definitions in @projectit/core !!
    public static PI_BINARY_EXPRESSION_LEFT: string = "FreBinaryExpression-left";
    public static PI_BINARY_EXPRESSION_RIGHT: string = "FreBinaryExpression-right";
    public static BEFORE_BINARY_OPERATOR: string = "binary-pre";
    public static AFTER_BINARY_OPERATOR: string = "binary-post";
    public static LEFT_MOST: string = "exp-left";
    public static RIGHT_MOST: string = "exp-right";
    public static BINARY_EXPRESSION: string = "binary-expression";
    public static EXPRESSION: string = "expression";
    public static EXPRESSION_SYMBOL: string = "symbol";

    // because the below names are used to generate TypeScript classes
    // they all have to start with an uppercase character
    public static referenceSeparator: string = "/"; // TODO use value from editDef
    public static listUtil: string = "ListUtil";
    public static brackets: string = "Brackets";
    static FreModel: string = "FreModel";
    static FreModelUnit: string = "FreModelUnit";
    static FreUtils: string = "FreUtils";
    static FreParseLocation: string = "FreParseLocation";
    static FreType: string = "FreType";
    static PiType: string = "FreType";
    static FreTableDefinition: string = "FreTableDefinition";
    static FreCreateBinaryExpressionAction: string = "FreCreateBinaryExpressionAction";
    static FreCustomAction: string = "FreCustomAction";
    static FreTriggerType: string = "FreTriggerType";
    static LanguageEnvironment: string = "FreLanguageEnvironment";
    static PiLogger: string = "FreLogger";
    static FreNamespace: string = "FreNamespace";
    static FreProjectionHandler: string = "FreProjectionHandler";

    public static configuration() {
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

    public static customScoper(language: PiLanguage): string {
        return "Custom" + this.scoper(language);
    }

    public static customTyper(language: PiLanguage): string {
        return "Custom" + this.typerPart(language);
    }

    public static customValidator(language: PiLanguage): string {
        return "Custom" + this.validator(language);
    }

    public static customStdlib(language: PiLanguage): string {
        return "Custom" + this.stdlib(language);
    }

    // public static projectionDefault(language: PiLanguage): string {
    //     return this.startWithUpperCase(language?.name) + "ProjectionDefault";
    // }

    public static projection(group: PiEditProjectionGroup): string {
        return this.startWithUpperCase(group.name);
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

    public static primitivePropertyField(property: PiPrimitiveProperty): string {
        // return "$$" + property.name;
        return property.name;
    }

    public static primitivePropertyGetter(property: PiPrimitiveProperty): string {
        return property.name;
    }

    public static primitivePropertySetter(property: PiPrimitiveProperty): string {
        return property.name;
    }

    public static interface(interf: PiInterface): string {
        return this.startWithUpperCase(interf?.name);
    }

    public static metaType(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "MetaType";
    }

    public static allConcepts(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "EveryConcept";
    }

    public static modelunit(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "ModelUnitType";
    }

    public static namespace(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Namespace";
    }

    public static scoper(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Scoper";
    }

    public static scoperDef(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "ScoperDef";
    }

    public static typerDef(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "TyperDef";
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

    public static typerPart(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "TyperPart";
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
            return word[0].toUpperCase() + word.substring(1);
        }
        return "";
    }

    public static projectionMethod(proj: PiEditClassifierProjection): string {
        return "get" + this.startWithUpperCase(proj.name);
    }

    public static tableProjectionMethod(proj: PiEditClassifierProjection): string {
        return "get" + this.startWithUpperCase(proj.name);
    }

    public static tabelDefinitionFunctionNew(projectionName: string): string {
        return "getRowFor" + this.startWithUpperCase(projectionName);
    }

    public static tableHeadersMethod(proj: PiEditTableProjection): string {
        return "getHeadersFor" + this.startWithUpperCase(proj.name);
    }

    public static writer(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "ModelUnitWriter";
    }

    public static parser(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Parser";
    }

    public static grammar(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Grammar";
    }

    public static grammarStr(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "GrammarStr";
    }

    public static syntaxAnalyser(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "SyntaxAnalyser";
    }

    public static unitAnalyser(language: PiLanguage, unit: PiUnitDescription | PiModelDescription): string {
        if (!!unit) {
            return this.startWithUpperCase(unit?.name) + "SyntaxAnalyserPart";
        } else {
            return this.startWithUpperCase(language?.name) + "CommonSyntaxAnalyserPart";
        }
    }

    public static semanticAnalyser(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "SemanticAnalyser";
    }

    public static semanticWalker(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "SemanticAnalysisWalker";
    }

    public static reader(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "ModelUnitReader";
    }

    public static binaryProjectionFunction(): string {
        return "_getBinaryExpressionBox";
    }

    public static instance(instance: PiInstance): string {
        return instance.name;
    }

    public static refName(property: PiProperty): string {
        return "$" + property.name;
    }

    public static interpreterClassname(language: PiLanguage): string {
        return Names.startWithUpperCase(language.name) + "Interpreter";
    }

    public static interpreterBaseClassname(language: PiLanguage): string {
        return Names.interpreterClassname(language) + "Base";
    }

    public static interpreterInterfacename(language: PiLanguage): string {
        return "I" + Names.interpreterClassname(language);
    }

    public static interpreterInitname(language: PiLanguage): string {
        return Names.interpreterClassname(language) + "Init";
    }

    public static interpreterName(language: PiLanguage): string {
        return "Main" + Names.interpreterClassname(language);
    }

    public static boxProvider(concept: PiClassifier): string {
        return Names.startWithUpperCase(concept.name) + "BoxProvider";
    }

}
