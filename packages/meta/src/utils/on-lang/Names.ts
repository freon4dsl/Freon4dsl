import {
    FreMetaClassifier,
    FreMetaConcept,
    FreMetaInstance,
    FreMetaInterface,
    FreMetaLanguage,
    FreMetaPrimitiveProperty,
    FreMetaProperty,
    FreMetaModelDescription,
    FreMetaUnitDescription,
} from "../../languagedef/metalanguage/index.js";

/**
 * Defines all names that are used in the generation, to ensure they are identical
 * at each usage.
 */
export class Names {
    static FreNamedNode: string = "FreNamedNode";
    static FreNode: string = "FreNode";
    static FreOwnerDescriptor: string = "FreOwnerDescriptor";
    static FreExpressionNode: string = "FreExpressionNode";
    static FreBinaryExpression: string = "FreBinaryExpression";
    static FreScoper: string = "FreScoper";
    static FreScoperBase: string = "FreScoperBase";
    static FreCompositeScoper: string = "FreCompositeScoper";
    static FreScoperPart: string = "FreScoper";
    static FreCompositeTyper: string = "FreCompositeTyper"; 
    static FreValidator: string = "FreValidator";
    static FreStdlib: string = "FreStdlib";
    static FreWriter: string = "FreWriter";
    static FreReader: string = "FreReader";
    static FreError: string = "FreError";
    static FreInterpreter: string = "FreInterpreter";
    static FreErrorSeverity: string = "FreErrorSeverity";
    static FreActions: string = "FreCombinedActions";
    static ActionsUtil: string = "ActionsUtil";
    static FreCreateBinaryExpressionAction: string = "FreCreateBinaryExpressionAction";
    static FreCustomAction: string = "FreCustomAction";
    static FreEditor: string = "FreEditor";
    static FreProjection: string = "FreProjection";
    static Box: string = "Box";
    static FreNodeReference: string = "FreNodeReference";
    static FreEnvironment: string = "FreEnvironment";
    static FreParseLocation: string = "FreParseLocation";
    static FreUtils: string = "FreUtils";
    static FreModel: string = "FreModel";
    static FreModelUnit: string = "FreModelUnit";
    static FreLanguage: string = "FreLanguage";
    static FreType: string = "FreType";
    static FreTyper: string = "FreTyper";
    static AstType: string = "AstType"
    static FreCommonSuperTypeUtil: string = "FreCommonSuperTypeUtil"
    static FreTableDefinition: string = "FreTableDefinition";
    static FreTriggerType: string = "FreTriggerType";
    static FreLanguageEnvironment: string = "FreLanguageEnvironment";
    static LanguageEnvironment: string = "LanguageEnvironment";
    static FreLogger: string = "FreLogger";
    static FreNamespace: string = "FreNamespace";
    static FreNamespaceInfo: string = "FreNamespaceInfo";
    static FreProjectionHandler: string = "FreProjectionHandler";
    static ProjectionalEditor: string = "ProjectionalEditor";
    static mainProjectionalEditor: string = "MainProjectionalEditor";
    static configuration: string = "FreonConfiguration";
    static nameForSelf: string = "self";
    static initializeLanguage: string = "initializeLanguage";
    static defaultProjectionName: string = "default";
    // reserved role names for expressions, use with care.
    // Should remain identical to the definitions in @freon4dsl/core !!
    static FRE_BINARY_EXPRESSION_LEFT: string = "FreBinaryExpression-left";
    static FRE_BINARY_EXPRESSION_RIGHT: string = "FreBinaryExpression-right";
    static BEFORE_BINARY_OPERATOR: string = "binary-pre";
    static AFTER_BINARY_OPERATOR: string = "binary-post";
    static LEFT_MOST: string = "exp-left";
    static RIGHT_MOST: string = "exp-right";
    static BINARY_EXPRESSION: string = "binary-expression";
    static EXPRESSION: string = "expression";
    static EXPRESSION_SYMBOL: string = "symbol";

    // because the below names are used to generate TypeScript classes
    // they all have to start with an uppercase character
    static referenceSeparator: string = "/"; // TODO use value from editDef
    static listUtil: string = "ListUtil";
    static brackets: string = "Brackets";
    static isNullOrUndefined: string = 'isNullOrUndefined';

    static environment(language: FreMetaLanguage) {
        return this.startWithUpperCase(language?.name) + "Environment";
    }

    static context(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Context";
    }

    static actions(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Actions";
    }

    static defaultActions(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "DefaultActions";
    }

    static customActions(language: FreMetaLanguage): string {
        return "Custom" + this.actions(language);
    }

    static customScoper(language: FreMetaLanguage): string {
        return "Custom" + this.scoper(language);
    }

    static customTyper(language: FreMetaLanguage): string {
        return "Custom" + this.typerPart(language);
    }

    static customValidator(language: FreMetaLanguage): string {
        return "Custom" + this.validator(language);
    }

    static customStdlib(language: FreMetaLanguage): string {
        return "Custom" + this.stdlib(language);
    }

    static customProjection(language: FreMetaLanguage): string {
        return "Custom" + this.startWithUpperCase(language?.name) + "Projection";
    }

    static language(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Language";
    }

    static initialization(language: FreMetaLanguage) {
        return this.startWithUpperCase(language?.name) + "Initialization";
    }

    static concept(concept: FreMetaConcept | undefined): string {
        if (!!concept) {
            return this.startWithUpperCase(concept?.name);
        } else {
            return "<unknown concept>";
        }
    }

    static classifier(classifier: FreMetaClassifier | undefined): string {
        if (classifier !== null && classifier !== undefined) {
            return this.startWithUpperCase(classifier?.name);
        } else {
            return '<unknown classifier>';
        }
    }

    static primitivePropertyField(property: FreMetaPrimitiveProperty): string {
        // return "$$" + property.name;
        return property.name;
    }

    static primitivePropertyGetter(property: FreMetaPrimitiveProperty): string {
        return property.name;
    }

    static primitivePropertySetter(property: FreMetaPrimitiveProperty): string {
        return property.name;
    }

    static interface(interf: FreMetaInterface): string {
        return this.startWithUpperCase(interf?.name);
    }

    static metaType(): string {
        return "string"; //this.startWithUpperCase(language?.name) + "MetaType";
    }

    static allConcepts(): string {
        return "FreNode"; // this.startWithUpperCase(language?.name) + "EveryConcept";
    }

    static modelunit(): string {
        return "FreModelUnit"; // this.startWithUpperCase(language?.name) + "ModelUnitType";
    }

    static namespace(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Namespace";
    }

    static scoper(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Scoper";
    }

    static scoperDef(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "ScoperDef";
    }

    static typerDef(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "TyperDef";
    }

    static scoperUtils(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "ScoperUtils";
    }

    static namesCollector(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "NamesCollector";
    }

    static validator(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Validator";
    }

    static checkerInterface(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "CheckerInterface";
    }

    static rulesChecker(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "ValidationRulesChecker";
    }

    static nonOptionalsChecker(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "NonOptionalsChecker";
    }

    static referenceChecker(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "ReferenceChecker";
    }

    static namespaceChecker(language: FreMetaLanguage) {
        return this.startWithUpperCase(language?.name) + "NamespaceChecker";
    }

    static typerPart(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "TyperPart";
    }

    static typer(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Typer";
    }

    static stdlib(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Stdlib";
    }

    static walker(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Walker";
    }

    static workerInterface(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Worker";
    }

    static defaultWorker(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "DefaultWorker";
    }

    static startWithUpperCase(word: string): string {
        if (!!word) {
            return word[0].toUpperCase() + word.substring(1);
        }
        return "";
    }

    static startWithLowerCase(word: string): string {
        if (!!word) {
            return word[0].toLowerCase() + word.substring(1);
        }
        return "";
    }

    static writer(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "ModelUnitWriter";
    }

    static parser(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Parser";
    }

    static grammar(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "Grammar";
    }

    static grammarStr(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "GrammarStr";
    }

    static syntaxAnalyser(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "SyntaxAnalyser";
    }

    static unitAnalyser(
        language: FreMetaLanguage,
        unit: FreMetaUnitDescription | FreMetaModelDescription | undefined,
    ): string {
        if (!!unit) {
            return this.startWithUpperCase(unit?.name) + "SyntaxAnalyserPart";
        } else {
            return this.startWithUpperCase(language?.name) + "CommonSyntaxAnalyserPart";
        }
    }

    static semanticAnalyser(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "SemanticAnalyser";
    }

    static semanticWalker(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "SemanticAnalysisWalker";
    }

    static reader(language: FreMetaLanguage): string {
        return this.startWithUpperCase(language?.name) + "ModelUnitReader";
    }

    static binaryProjectionFunction(): string {
        return "_getBinaryExpressionBox";
    }

    static instance(instance: FreMetaInstance): string {
        return instance.name;
    }

    static refName(property: FreMetaProperty): string {
        return "$" + property.name;
    }

    static interpreterClassname(language: FreMetaLanguage): string {
        return Names.startWithUpperCase(language.name) + "Interpreter";
    }

    static interpreterBaseClassname(language: FreMetaLanguage): string {
        return Names.interpreterClassname(language) + "Base";
    }

    static interpreterInterfacename(language: FreMetaLanguage): string {
        return "I" + Names.interpreterClassname(language);
    }

    static interpreterInitname(language: FreMetaLanguage): string {
        return Names.interpreterClassname(language) + "Init";
    }

    static interpreterName(language: FreMetaLanguage): string {
        return "Main" + Names.interpreterClassname(language);
    }

}
