import {
    FreMetaClassifier, FreMetaConcept, FreMetaInstance, FreMetaInterface, FreMetaLanguage, FreMetaPrimitiveProperty, FreMetaProperty, FreMetaModelDescription, FreMetaUnitDescription
} from "../../languagedef/metalanguage";
import { FreEditClassifierProjection, FreEditProjectionGroup, FreEditTableProjection } from "../../editordef/metalanguage";

/**
 * Defines all names that are used in the generation, to ensure they are identical
 * at each usage.
 */
export class Names {
    // tslint:disable-next-line:variable-name
    public static FreNamedNode: string = "FreNamedNode";
    // tslint:disable-next-line:variable-name
    public static FreNode: string = "FreNode";
    // tslint:disable-next-line:variable-name
    public static FreExpressionNode: string = "FreExpressionNode";
    // tslint:disable-next-line:variable-name
    public static FreBinaryExpression: string = "FreBinaryExpression";
    // tslint:disable-next-line:variable-name
    public static FreScoper: string = "FreScoper";
    // tslint:disable-next-line:variable-name
    public static FreScoperBase: string = "FreScoperBase";
    // tslint:disable-next-line:variable-name
    public static FreScoperComposite: string = "FreScoperComposite";
    // tslint:disable-next-line:variable-name
    public static FrScoperPart: string = "FreScoper";
    // tslint:disable-next-line:variable-name
    public static FreTyperPart: string = "FreTyper"; // todo why not ..Part
    // tslint:disable-next-line:variable-name
    public static FreTyper: string = "FreCompositeTyper"; // todo no longer generated, is it still in use?
    // tslint:disable-next-line:variable-name
    public static FreValidator: string = "FreValidator";
    // tslint:disable-next-line:variable-name
    public static FreStdlib: string = "FreStdlib";
    // tslint:disable-next-line:variable-name
    public static FreWriter: string = "FreWriter";
    // tslint:disable-next-line:variable-name
    public static FreReader: string = "FreReader";
    // tslint:disable-next-line:variable-name
    public static FreError: string = "FreError";
    // tslint:disable-next-line:variable-name
    public static FreInterpreter: string = "FreInterpreter";
    // tslint:disable-next-line:variable-name
    public static FreErrorSeverity: string = "FreErrorSeverity";
    // tslint:disable-next-line:variable-name
    public static FreActions: string = "FreCombinedActions";
    // tslint:disable-next-line:variable-name
    public static FreEditor: string = "FreEditor";
    // tslint:disable-next-line:variable-name
    public static FreProjection: string = "FreProjection";
    // tslint:disable-next-line:variable-name
    public static FreCompositeProjection: string = "FreCompositeProjection";
    // tslint:disable-next-line:variable-name
    public static Box: string = "Box";
    // tslint:disable-next-line:variable-name
    public static FreNodeReference: string = "FreNodeReference";
    // tslint:disable-next-line:variable-name
    public static FreEnvironment: string = "FreEnvironment";
    // tslint:disable-next-line:variable-name
    public static FreParseLocation: string = "FreParseLocation";
    // tslint:disable-next-line:variable-name
    public static FreUtils: string = "FreUtils";
    // tslint:disable-next-line:variable-name
    public static FreModel: string = "FreModel";
    // tslint:disable-next-line:variable-name
    public static FreModelUnit: string = "FreModelUnit";
    // tslint:disable-next-line:variable-name
    public static FreLanguage: string = "FreLanguage";
    // tslint:disable-next-line:variable-name
    static FreType: string = "FreType";
    // tslint:disable-next-line:variable-name
    static FreTableDefinition: string = "FreTableDefinition";
    // tslint:disable-next-line:variable-name
    static FreCreateBinaryExpressionAction: string = "FreCreateBinaryExpressionAction";
    // tslint:disable-next-line:variable-name
    static FreCustomAction: string = "FreCustomAction";
    // tslint:disable-next-line:variable-name
    static FreTriggerType: string = "FreTriggerType";
    // tslint:disable-next-line:variable-name
    static LanguageEnvironment: string = "FreLanguageEnvironment";
    // tslint:disable-next-line:variable-name
    static FreLogger: string = "FreLogger";
    // tslint:disable-next-line:variable-name
    static FreNamespace: string = "FreNamespace";
    // tslint:disable-next-line:variable-name
    static FreProjectionHandler: string = "FreProjectionHandler";
    // tslint:disable-next-line:variable-name
    public static ProjectionalEditor: string = "ProjectionalEditor";
    // tslint:disable-next-line:variable-name
    public static mainProjectionalEditor: string = "MainProjectionalEditor";
    public static configuration: string = "FreonConfiguration";
    public static nameForSelf: string = "self";
    public static initializeLanguage: string = "initializeLanguage";
    public static defaultProjectionName: string = "default";
    // reserved role names for expressions, use with care.
    // Should remain identical to the definitions in @freon4dsl/core !!
    public static FRE_BINARY_EXPRESSION_LEFT: string = "FreBinaryExpression-left";
    public static FRE_BINARY_EXPRESSION_RIGHT: string = "FreBinaryExpression-right";
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

    public static environment(language: FreMetaLanguage) {
        return this.startWithUpperCase(language?.name) + "Environment";
    }

    public static context(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Context";
    }

    public static actions(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Actions";
    }

    public static defaultActions(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "DefaultActions";
    }

    public static customActions(language: FreMetaLanguage): string {
        return "Custom" + this.actions(language);
    }

    public static customScoper(language: FreMetaLanguage): string {
        return "Custom" + this.scoper(language);
    }

    public static customTyper(language: FreMetaLanguage): string {
        return "Custom" + this.typerPart(language);
    }

    public static customValidator(language: FreMetaLanguage): string {
        return "Custom" + this.validator(language);
    }

    public static customStdlib(language: FreMetaLanguage): string {
        return "Custom" + this.stdlib(language);
    }

    public static projection(group: FreEditProjectionGroup): string {
        return group.name;
    }

    public static customProjection(language: FreMetaLanguage): string {
        return "Custom" + this.startWithUpperCase(language?.name) + "Projection";
    }

    public static language(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Language";
    }

    public static initialization(language: FreMetaLanguage) {
        return this.startWithUpperCase(language?.name) + "Initialization";
    }

    public static concept(concept: FreMetaConcept): string {
        return this.startWithUpperCase(concept?.name);
    }

    public static classifier(concept: FreMetaClassifier): string {
        return this.startWithUpperCase(concept?.name);
    }

    public static primitivePropertyField(property: FreMetaPrimitiveProperty): string {
        // return "$$" + property.name;
        return property.name;
    }

    public static primitivePropertyGetter(property: FreMetaPrimitiveProperty): string {
        return property.name;
    }

    public static primitivePropertySetter(property: FreMetaPrimitiveProperty): string {
        return property.name;
    }

    public static interface(interf: FreMetaInterface): string {
        return this.startWithUpperCase(interf?.name);
    }

    public static metaType(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "MetaType";
    }

    public static allConcepts(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "EveryConcept";
    }

    public static modelunit(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "ModelUnitType";
    }

    public static namespace(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Namespace";
    }

    public static scoper(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Scoper";
    }

    public static scoperDef(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "ScoperDef";
    }

    public static typerDef(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "TyperDef";
    }

    public static scoperUtils(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "ScoperUtils";
    }

    public static namesCollector(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "NamesCollector";
    }

    public static validator(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Validator";
    }

    public static checkerInterface(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "CheckerInterface";
    }

    public static rulesChecker(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "ValidationRulesChecker";
    }

    public static nonOptionalsChecker(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "NonOptionalsChecker";
    }

    public static referenceChecker(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "ReferenceChecker";
    }

    public static typerPart(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "TyperPart";
    }

    public static typer(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Typer";
    }

    public static stdlib(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Stdlib";
    }

    public static walker(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Walker";
    }

    public static workerInterface(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Worker";
    }

    public static defaultWorker(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "DefaultWorker";
    }

    public static startWithUpperCase(word: string): string {
        if (!!word) {
            return word[0].toUpperCase() + word.substring(1);
        }
        return "";
    }

    public static projectionMethod(proj: FreEditClassifierProjection): string {
        return "get" + this.startWithUpperCase(proj.name);
    }

    public static tableProjectionMethod(proj: FreEditClassifierProjection): string {
        return "get" + this.startWithUpperCase(proj.name);
    }

    public static tabelDefinitionFunctionNew(projectionName: string): string {
        return "getRowFor" + this.startWithUpperCase(projectionName);
    }

    public static tableHeadersMethod(proj: FreEditTableProjection): string {
        return "getHeadersFor" + this.startWithUpperCase(proj.name);
    }

    public static writer(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "ModelUnitWriter";
    }

    public static parser(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Parser";
    }

    public static grammar(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Grammar";
    }

    public static grammarStr(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "GrammarStr";
    }

    public static syntaxAnalyser(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "SyntaxAnalyser";
    }

    public static unitAnalyser(language: FreMetaLanguage, unit: FreMetaUnitDescription | FreMetaModelDescription): string {
        if (!!unit) {
            return this.startWithUpperCase(unit?.name) + "SyntaxAnalyserPart";
        } else {
            return this.startWithUpperCase(language?.name) + "CommonSyntaxAnalyserPart";
        }
    }

    public static semanticAnalyser(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "SemanticAnalyser";
    }

    public static semanticWalker(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "SemanticAnalysisWalker";
    }

    public static reader(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "ModelUnitReader";
    }

    public static binaryProjectionFunction(): string {
        return "_getBinaryExpressionBox";
    }

    public static instance(instance: FreMetaInstance): string {
        return instance.name;
    }

    public static refName(property: FreMetaProperty): string {
        return "$" + property.name;
    }

    public static interpreterClassname(language: FreMetaLanguage): string {
        return Names.startWithUpperCase(language.name) + "Interpreter";
    }

    public static interpreterBaseClassname(language: FreMetaLanguage): string {
        return Names.interpreterClassname(language) + "Base";
    }

    public static interpreterInterfacename(language: FreMetaLanguage): string {
        return "I" + Names.interpreterClassname(language);
    }

    public static interpreterInitname(language: FreMetaLanguage): string {
        return Names.interpreterClassname(language) + "Init";
    }

    public static interpreterName(language: FreMetaLanguage): string {
        return "Main" + Names.interpreterClassname(language);
    }

    public static boxProvider(concept: FreMetaClassifier): string {
        return Names.startWithUpperCase(concept.name) + "BoxProvider";
    }

}
