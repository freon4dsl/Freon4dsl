import { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import { Imports, Names } from "../../../utils/index.js"
import { refRuleName } from "./GrammarUtils.js";
import { GrammarPart } from "./GrammarPart.js";
import {
    internalTransformLimitedList,
    internalTransformPartList,
    internalTransformPrimList,
    internalTransformPrimValue,
    internalTransformRefList, internalTransformTempRef
} from '../ParserGenUtil.js';

const tempReferenceClassName: string = "ParsedNodeReference";

export class GrammarModel {

    
    constructor(language: FreMetaLanguage) {
        this.language = language;
    }

    // these four properties are set by the GrammarGenerator
    public language: FreMetaLanguage;
    public parts: GrammarPart[] = [];
    public trueValue: string = "true";
    public falseValue: string = "false";
    public refSeparator: string = "."; // default reference separator

    toGrammar(): string {
        // there is no prettier for the grammar string, therefore we take indentation and
        // other layout matters into account in this template
        // unfortunately, this makes things a little less legible :-(
        return `// This file contains the input to the AGL parser generator
// (see https://https://github.com/dhakehurst/net.akehurst.language).
// The grammar in this file is read by ${Names.reader(this.language)}

export const ${Names.grammarStr(this.language)} = \`
namespace ${Names.language(this.language)}
grammar ${Names.grammar(this.language)} {

${this.grammarContent()}

${refRuleName} = [ identifier / '${this.refSeparator}' ]+ ;

// white space and comments
skip WHITE_SPACE = "\\\\s+" ;
skip SINGLE_LINE_COMMENT = "//[^\\\\r\\\\n]*" ;
skip MULTI_LINE_COMMENT = "/\\\\*[^*]*\\\\*+(?:[^*/][^*]*\\\\*+)*/" ;

// the predefined basic types
leaf identifier          = "[a-zA-Z_][a-zA-Z0-9-_]*" ;
/* see https://stackoverflow.com/questions/37032620/regex-for-matching-a-string-literal-in-java */
leaf stringLiteral       = '"' "[^\\\\"\\\\\\\\]*(\\\\\\\\.[^\\\\"\\\\\\\\]*)*" '"' ;
leaf numberLiteral       = "[0-9]+";
leaf booleanLiteral      = '${this.falseValue}' | '${this.trueValue}';

}\`; // end of grammar`;
    }

    private grammarContent(): string {
        let result: string = "";
        this.parts.forEach((part) => {
            if (!!part.unit) {
                result += `// rules for "${part.unit.name}"\n`;
            } else {
                result += `// common rules\n`;
            }
            part.rules.map((rule) => {
                result += rule.toGrammar() + "\n\n";
            });
        });
        return result.trimEnd();
    }

    toMethod(language: FreMetaLanguage, relativePath: string): string {
        const className: string = Names.syntaxAnalyser(this.language);
        let handlerRegistration: string = "";
        this.parts.forEach((part) =>
            part.rules.map((rule) => {
                const name: string = rule.ruleName;
                handlerRegistration += `super.registerFor('${name}', (n, c, s) => this.${this.getPartAnalyserName(part)}.transform${name}(n, c, s));`;
            }),
        );

        handlerRegistration += `super.registerFor('${refRuleName}', (n, c, s) => this.transform${refRuleName}(n, c, s));`

        const imports = new Imports(relativePath)
        imports.core = new Set([Names.FreParseLocation, Names.FreNamedNode, Names.FreNode, Names.FreNodeReference, Names.FreOwnerDescriptor])
        imports.language.add(Names.classifier(language.modelConcept))
        // Template starts here
        return `
        // TEMPLATE: GrammarModel.toMethod(...)
        ${imports.makeImports(language)}
        import {
            SyntaxAnalyserByMethodRegistrationAbstract,
            type KtList,
            type Sentence,
            type SpptDataNodeInfo
        } from "net.akehurst.language-agl-processor/net.akehurst.language-agl-processor.mjs";
        import { type SpptDataNode } from "net.akehurst.language-agl-processor";
        import { ${this.parts.map((part) => `${Names.unitAnalyser(this.language, part.unit)}`).join(", ")} } from "./index.js";

        export enum PrimValueType {
            "string",
            "identifier",
            "boolean",
            "number"
        }

        export class ${tempReferenceClassName} implements ${Names.FreNode} {
            pathname: string[];
            parseLocation: ${Names.FreParseLocation};
        
            constructor(pathname: string[], location: ${Names.FreParseLocation}) {
                this.pathname = pathname;
                this.parseLocation = location;
            }
        
            freId(): string {
                throw new Error("Method not implemented.");
            }
            freLanguageConcept(): string {
                throw new Error("Method not implemented.");
            }
            freOwner(): FreNode {
                throw new Error("Method not implemented.");
            }
            freOwnerDescriptor(): FreOwnerDescriptor {
                throw new Error("Method not implemented.");
            }
            freIsModel(): boolean {
                throw new Error("Method not implemented.");
            }
            freIsUnit(): boolean {
                throw new Error("Method not implemented.");
            }
            freIsExpression(): boolean {
                throw new Error("Method not implemented.");
            }
            freIsBinaryExpression(): boolean {
                throw new Error("Method not implemented.");
            }
            copy(): ${Names.FreNode} {
                throw new Error("Method not implemented.");
            }
            match(toBeMatched: Partial<${Names.FreNode}>): boolean {
                throw new Error("Method not implemented.");
            }
        
            toString() {
                return \`${tempReferenceClassName}: \${this.pathname} [\${this.parseLocation.line}:\${this.parseLocation.column}]\`;
            }
        }

        /**
        *   Class ${className} is the main syntax analyser.
        *   The actual work is being done by its parts, one for each model unit,
        *   and one common part that contains the methods used in multiple units.
        *   Together the syntax analysers transform the parse tree into a FreNode model.
        *
        */
        export class ${className} extends SyntaxAnalyserByMethodRegistrationAbstract<${Names.classifier(language.modelConcept)}> {
            sourceName: string = "";
            ${this.parts.map((part) => `private ${this.getPartAnalyserName(part)}: ${Names.unitAnalyser(this.language, part.unit)} = new ${Names.unitAnalyser(this.language, part.unit)}(this)`).join(";\n")}

            registerHandlers() {
                ${handlerRegistration}
            }
            
            /**
             * Generic method to transform lists of primitive values
             */
            public ${internalTransformPrimList}<T extends string | number | boolean>(
                list: string[],
                primType: PrimValueType,
                separator?: string
            ): T[] {
                // console.log("${internalTransformPrimList} called: "  + JSON.stringify(list));             
                let result: T[] = [];
                if (!!list) {
                    list.forEach((element) => {
                        if (element !== null && element !== undefined && element !== separator) {
                            result.push(this.${internalTransformPrimValue}(element, primType) as T);
                        }
                    });
                }
                return result;
            }
        
            /**
             * Generic method to transform a primitive value, which is parsed as a string, into the correct type.
             */
            public ${internalTransformPrimValue}<T extends string | number | boolean>(
                element: string,
                primType: PrimValueType
            ): T {
                // console.log("${internalTransformPrimValue} called: " + element + ", " + primType);                
                switch (primType) {
                    case PrimValueType.number:
                        const num = parseFloat(element);
                        return (isNaN(num) ? 0 : num) as T; // Handle invalid number gracefully.
                    case PrimValueType.string:
                    case PrimValueType.identifier:
                        // todo make sure we remove only the outer quotes
                        return element.replace(/"/g, "") as T;
                    case PrimValueType.boolean:
                        return (element.toLowerCase() === "true") as T; // Case-insensitive matching for booleans.
                    default:
                        return element as T; // Default case (string)
                }
            }
            
            /**
             * Generic method to transform lists of parts.
             */
            public ${internalTransformPartList}<T>(list: KtList<T>, separator?: string): T[] {
                // console.log("${internalTransformPartList} called: " + JSON.stringify(list));
                let result: T[] = [];
                if (!!list) {
                    for (const element of list.asJsReadonlyArrayView()) {
                        if (element !== null && element !== undefined && element !== separator) {
                            result.push(element);
                        }
                    }
                }
                return result;
            }
    
            /**
             * Generic method to transform lists of references. The input will be a list of ${tempReferenceClassName}s, which
             * result from transform__fre_reference. However, the input may also contain objects of type String,
             * which hold the separator between the elements of the reference list, not the 'reference separator' ("${this.refSeparator}").
             */
            public ${internalTransformRefList}\<T extends ${Names.FreNamedNode}\>(list: KtList<T>, typeName: string): ${Names.FreNodeReference}\<T\>[] {
                // console.log("${internalTransformRefList} called: " + JSON.stringify(list));
                let result: FreNodeReference<T>[] = [];
                if (!!list) {
                    for (const child of list.asJsReadonlyArrayView()) {
                        if (child.constructor.name === '${tempReferenceClassName}') {
                            result.push(this.${internalTransformTempRef}<T>((child as unknown as ${tempReferenceClassName}), typeName));
                        }
                    }
                }
                return result;
            }

            /**
             * Generic method to transform a single reference into a temporary object of type ${tempReferenceClassName}.
             * The actual FreNodeReference object is created when the type of the referred node is known.
             * The 'reference separator' ("${this.refSeparator}") is removed in the process.
             */
            public transform__fre_reference(nodeInfo: SpptDataNodeInfo, children: KtList<object>, sentence: Sentence): ${tempReferenceClassName} {
                // console.log("transform__fre_reference called: " + JSON.stringify(children));
                let pathname: string[] = [];
                for (const child of children.asJsReadonlyArrayView()) {
                    if (child !== null && child !== undefined && (typeof child === 'string' ? child !== '${this.refSeparator}' : false)) {
                        pathname.push(child.toString());
                    }
                }
                return new ${tempReferenceClassName}(pathname, this.location(sentence, nodeInfo.node));
            }
    
            /**
             * Generic method to transform a ${tempReferenceClassName} into the right ${Names.FreNodeReference}.
             * 
             * @param referred
             * @param freMetaConcept
             */
            public ${internalTransformTempRef}<T extends ${Names.FreNamedNode}>(referred: ${tempReferenceClassName}, freMetaConcept: string): ${Names.FreNodeReference}<T> {
                const result = ${Names.FreNodeReference}.create<T>(referred.pathname, freMetaConcept);
                result.parseLocation = (referred as ${tempReferenceClassName}).parseLocation;
                return result;
            }
            
            /**
             * Generic method to transform a list of references to limited objects into the correct list. The input may have
             * elements of type String, which represent the separators, terminators, etc. These elements are ignored.
             *
             * @param list
             * @private
             */
            public ${internalTransformLimitedList}<T extends ${Names.FreNamedNode}>(list: KtList<any>): ${Names.FreNodeReference}<T>[] {
                let result: ${Names.FreNodeReference}<T>[] = [];
                list.asJsReadonlyArrayView().forEach(xx => {
                    if (xx instanceof ${Names.FreNodeReference}) {
                        result.push(xx);
                    }
                });
                return result;
            }
            
            /**
             * Generic method to transform location information.
             *
             * @param sentence
             * @param node
             */
            public location(sentence: Sentence, node: SpptDataNode): ${Names.FreParseLocation} {              
                const location = sentence.locationFor(node.startPosition, node.nextInputNoSkip - node.startPosition);
                return ${Names.FreParseLocation}.create({
                    filename: this.sourceName,
                    line: location.line,
                    column: location.column,
                });
            }
        }`;
        // end Template
    }

    private getPartAnalyserName(part: GrammarPart) {
        if (!!part.unit) {
            return `_unit_${part.unit.name}_analyser`;
        } else {
            return `_unit_common_analyser`;
        }
    }
}
