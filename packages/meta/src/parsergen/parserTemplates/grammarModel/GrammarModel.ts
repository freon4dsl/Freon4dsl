import { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import { Names } from "../../../utils/index.js";
import {
    internalTransformBranch,
    internalTransformLeaf,
    internalTransformList,
    internalTransformNode,
    internalTransformRefList,
} from "../ParserGenUtil.js";
import { refRuleName } from "./GrammarUtils.js";
import { GrammarPart } from "./GrammarPart.js";

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

    toMethod(): string {
        const className: string = Names.syntaxAnalyser(this.language);
        let switchContent: string = "";
        this.parts.forEach((part) =>
            part.rules.map((rule) => {
                const name = rule.ruleName;
                switchContent += `if ('${name}' === brName) {
                        return this.${this.getPartAnalyserName(part)}.transform${name}(branch);
                    } else `;
            }),
        );

        switchContent += `if ('${refRuleName}' === brName) {
                        return this.transform${refRuleName}(branch);
                    } else `;

        // Template starts here
        return `
        import {net} from "net.akehurst.language-agl-processor";
        import SyntaxAnalyser = net.akehurst.language.api.syntaxAnalyser.SyntaxAnalyser;
        import SharedPackedParseTree = net.akehurst.language.api.sppt.SharedPackedParseTree;
        import SPPTBranch = net.akehurst.language.api.sppt.SPPTBranch;
        import SPPTLeaf = net.akehurst.language.api.sppt.SPPTLeaf;
        import SPPTNode = net.akehurst.language.api.sppt.SPPTNode;
        import { ${Names.FreNamedNode}, ${Names.FreParseLocation}, ${Names.FreNodeReference} } from "@freon4dsl/core";
        import { ${this.parts.map((part) => `${Names.unitAnalyser(this.language, part.unit)}`).join(", ")} } from "./index.js";

        /**
        *   Class ${className} is the main syntax analyser.
        *   The actual work is being done by its parts, one for each model unit,
        *   and one common part that contains the methods used in multiple units.
        *
        */
        export class ${className} implements SyntaxAnalyser {
            sourceName: string = "";
            locationMap: any;
            ${this.parts.map((part) => `private ${this.getPartAnalyserName(part)}: ${Names.unitAnalyser(this.language, part.unit)} = new ${Names.unitAnalyser(this.language, part.unit)}(this)`).join(";\n")}

            clear(): void {
                throw new Error("Method not implemented.");
            }

            transform\<T\>(sppt: SharedPackedParseTree): T {
                if (!!sppt.root) {
                    return this.${internalTransformNode}(sppt.root) as unknown as T;
                } else {
                    return null;
                }
            }

            public ${internalTransformNode}(node: SPPTNode): any {
                if (!!node) {
                    try {
                        if (node.isLeaf) {
                            return this.${internalTransformLeaf}(node);
                        } else if (node.isBranch) {
                            return this.${internalTransformBranch}(node as SPPTBranch);
                        }
                    } catch (e) {
                        if (e.message.startsWith("Syntax error in ") || e.message.startsWith("Error in ${className}")) {
                            throw e;
                        } else {
                            // add more info to the error message
                            throw new Error(\`Syntax error in "\${this.sourceName} (line: \${node.location.line}, column: \${node.location.column})": \${e.message}\`);
                        }
                        // console.log(e.message + e.stack);
                    }
                } else {
                    return null;
                }
            }

            private ${internalTransformLeaf}(node: SPPTNode): any {
                let tmp = ((node as SPPTLeaf)?.nonSkipMatchedText).trim();
                if (tmp.length > 0) {
                    if (tmp.startsWith('"')) { // stringLiteral, strip the surrounding quotes
                        tmp = tmp.slice(1, tmp.length - 1);
                        return tmp;
                    } else if (tmp == "${this.falseValue}") { // booleanLiteral
                        return false;
                    } else if (tmp == "${this.trueValue}") { // booleanLiteral
                        return true;
                    } else if (Number.isInteger(parseInt(tmp, 10))) { // numberLiteral
                        return parseInt(tmp, 10);
                    } else { // identifier
                        return tmp;
                    }
                }
                return null;
            }

            private ${internalTransformBranch}(branch: SPPTBranch): any {
                const brName: string = branch.name;
                ${switchContent}
                {
                    throw new Error(\`Error in ${className}: \${brName} not handled for node '\${branch?.matchedText}'\`);
                }
            }

            /**
             * Generic method to get the children of a branch. Throws an error if no children can be found.
             */
            public getChildren(branch: SPPTBranch): any {
                if (!!branch && !!branch.nonSkipChildren) {
                    try {
                        return branch.nonSkipChildren.toArray();
                    } catch (e) {
                        throw new Error(\`Cannot follow branch: \${e.message} (\${branch.matchedText.trimEnd()})\`);
                    }
                }
                return null;
            }

            /**
             * Generic method to get the optional group of a branch. Throws an error if no group can be found.
             */
            public getGroup(branch: SPPTBranch) {
                // take the first element in the [0..1] optional group or multi branch
                let group: any = branch;
                let stop: boolean = false;
                while (!stop) {
                    let nextOne: any = null;
                    try {
                        nextOne = group.nonSkipChildren?.toArray()[0];
                    } catch (e) {
                        throw new Error(\`Cannot follow group: \${e.message} (\${group.matchedText})\`);
                    }
                    if (!nextOne || (!nextOne.name.includes("multi") && !nextOne.name.includes("group"))) {
                        stop = true; // found a branch with actual content, return its parent!
                    } else {
                        group = nextOne;
                    }
                }
                return group;
            }

            public transform${refRuleName}(branch: SPPTBranch){
                if (branch.name.includes("multi") || branch.name.includes("List")) { // its a path name
                    return this.${internalTransformList}<string>(branch, "${this.refSeparator}");
                } else { // its a single name
                    return this.${internalTransformLeaf}(branch);
                }
            }

            /**
             * Generic method to transform references
             * ...FreNodeRef = identifier;
             */
            public freNodeRef\<T extends ${Names.FreNamedNode}\>(branch: SPPTBranch, typeName: string) : ${Names.FreNodeReference}\<T\> {
                let referred: string | string[] | T = this.${internalTransformNode}(branch);
                if (this.getChildren(branch)?.length > 1) {
                    // its a path name
                    referred = this.transformSharedPackedParseTreeList<string>(branch, '${this.refSeparator}');
                }
                if (referred === null || referred === undefined ) {
                    // throw new Error(\`Syntax error in "\${branch?.parent?.matchedText}": cannot create empty reference\`);
                    return null;
                } else if (typeof referred === "string" && (referred as string).length === 0) {
                    // throw new Error(\`Syntax error in "\${branch?.parent?.matchedText}": cannot create empty reference\`);
                    return null;
                } else {
                    return ${Names.FreNodeReference}.create<T>(referred, typeName);
                }
            }

            /**
             * Generic method to transform lists
             */
            public ${internalTransformList}\<T\>(branch: SPPTBranch, separator?: string): T[] {
                let result: T[] = [];
                const children = this.getChildren(branch);
                if (!!children) {
                    for (const child of children) {
                        let element: any = this.${internalTransformNode}(child);
                        if (element !== null && element !== undefined ) {
                            if (separator === null || separator === undefined) {
                                result.push(element);
                            } else {
                                if (element !== separator) {
                                    result.push(element);
                                }
                            }
                        }
                    }
                }
                return result;
            }

            /**
             * Generic method to transform lists of references
             */
            public ${internalTransformRefList}\<T extends ${Names.FreNamedNode}\>(branch: SPPTBranch, typeName: string, separator?: string): ${Names.FreNodeReference}\<T\>[] {
                let result: ${Names.FreNodeReference}\<T\>[] = [];
                const children = this.getChildren(branch);
                if (!!children) {
                    for (const child of children) {
                        let refName: any = this.${internalTransformNode}(child);
                        if (refName !== null && refName !== undefined) {
                            if (separator === null || separator === undefined) {
                                result.push(${Names.FreNodeReference}.create<T>(refName, typeName));
                            } else {
                                if (refName !== separator) {
                                    result.push(${Names.FreNodeReference}.create<T>(refName, typeName));
                                }
                            }
                        }
                    }
                }
                return result;
            }

            public location(branch: SPPTBranch): ${Names.FreParseLocation} {
                return ${Names.FreParseLocation}.create({
                    filename: this.sourceName,
                    line: branch.location.line,
                    column: branch.location.column
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
