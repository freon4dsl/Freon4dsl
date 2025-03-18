import { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import { LANGUAGE_GEN_FOLDER, Names } from "../../../utils/index.js";
import { refRuleName } from "./GrammarUtils.js";
import { GrammarPart } from "./GrammarPart.js";
import {internalTransformPrimList, internalTransformRefList} from "../ParserGenUtil.js";

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
leaf identifier          = "[a-zA-Z_][a-zA-Z0-9_]*" ;
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

        // Template starts here
        return `
        import {
            SyntaxAnalyserByMethodRegistrationAbstract,
            KtList,
            Sentence,
            SpptDataNodeInfo
        } from "net.akehurst.language-agl-processor/net.akehurst.language-agl-processor.mjs";
        import { SPPTBranch, SpptDataNode } from "net.akehurst.language-agl-processor";
        import { ${Names.FreParseLocation}, ${Names.FreNamedNode}, ${Names.FreNodeReference} } from "@freon4dsl/core";
        import { ${Names.classifier(language.modelConcept)} } from "${relativePath}${LANGUAGE_GEN_FOLDER}/index.js";
        import { ${this.parts.map((part) => `${Names.unitAnalyser(this.language, part.unit)}`).join(", ")} } from "./index.js";

        /**
        *   Class ${className} is the main syntax analyser.
        *   The actual work is being done by its parts, one for each model unit,
        *   and one common part that contains the methods used in multiple units.
        *
        */
        export class ${className} extends SyntaxAnalyserByMethodRegistrationAbstract<${Names.classifier(language.modelConcept)}> {
            sourceName: string = "";
            ${this.parts.map((part) => `private ${this.getPartAnalyserName(part)}: ${Names.unitAnalyser(this.language, part.unit)} = new ${Names.unitAnalyser(this.language, part.unit)}(this)`).join(";\n")}

            registerHandlers(branch: SPPTBranch) {
                ${handlerRegistration}
            }
            
            /**
             * Generic method to transform lists of primitive values
             */
            public ${internalTransformPrimList}(list: string[], primType: string, separator?: string): (string | number | boolean)[] {
                let result: (string | number | boolean)[] = []
                if (!!list) {
                    list.forEach((element) => {
                        if (element !== null && element !== undefined && element !== separator) {
                                switch (primType) {
                                    case 'number': result.push(parseInt(element, 10)); break;
                                    case 'string': result.push(element.replace(/"/g, '')); break;
                                    case 'boolean': result.push(element === "true"); break;
                                    default: break;
                                }
                        }
                    });
                }
                return result;
            }
    
            /**
             * Generic method to transform lists of references
             */
            public ${internalTransformRefList}\<T extends ${Names.FreNamedNode}\>(list: KtList<T>, typeName: string, separator?: string): ${Names.FreNodeReference}\<T\>[] {
                console.log("transformRefList called: " + JSON.stringify(list));
                let result: FreNodeReference<T>[] = [];
                if (!!list) {
                    for (const child of list.toArray()) {
                        if (child !== null && child !== undefined && child !== separator) {
                            result.push(FreNodeReference.create<T>(child, typeName));
                        }
                    }
                }
                return result;
            }

            /**
             * Generic method to transform a single reference
             */
            public transform${refRuleName}(nodeInfo: SpptDataNodeInfo, children: KtList<object>, sentence: Sentence): string[]{
                const props = children.asJsReadonlyArrayView()[0] as KtList<[string, any]>;
                console.log("\\t " + props)
                return props;
            }

            /**
             * Generic method to transform location information
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
