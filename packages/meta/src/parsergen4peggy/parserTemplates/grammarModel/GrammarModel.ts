import { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import {LANGUAGE_GEN_FOLDER, Names} from "../../../utils/index.js";
import {getTypeCall, refRuleName} from "./GrammarUtils.js";
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

    toGrammar(relativePath: string): string {
        // there is no prettier for the grammar string, therefore we take indentation and
        // other layout matters into account in this template
        // unfortunately, this makes things a little less legible :-(
        return `//
// This file contains all the parse rules for all of the concepts defined in the .ast files. 
// The parse rules follow the syntax as defined in the .edit files.
//
// This file is generated as a convenience. Its content is used to generate the parser in the 
// ${Names.parser(this.language)}.js module. Running the following command on the command line, 
// from the directory where the ${Names.parser(this.language)}.js module reseides, will produce 
// the same parser.
//
// peggy -o ${Names.parser(this.language)}.js --format es --allowed-start-rules ${this.getStartRules().map(r => r).join(",")} ${Names.grammar(this.language)}.peggy   
//      

{{
import * as helper from "./${Names.parserHelpers}";
import { FreNodeReference } from "@freon4dsl/core";
import {${this.imports().join(",\n\t")} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";
}}

${this.grammarContent()}

//
// Rule for references 
//

${refRuleName} = __ref:identifier|1.., '${this.refSeparator}'|  // returns an Array of strings

//
// Rules for primitive values
//

identifier     "identifier" 
    = ws first:[a-zA-Z_] rest:[a-zA-Z0-9_]* ws { return first + rest.join(""); }
numberLiteral  "number"     
    = ws all:[0-9]+ ws { return parseInt(all.join(""), 10); }
booleanLiteral "boolean"    
    = ws "${this.falseValue}" ws { return false }
    / ws "${this.trueValue}" ws { return true }
stringLiteral  "string"     
    = ws quotation_mark chars:char* quotation_mark ws { return chars.join(""); }

//
// Basic rules for text, escaped and unescaped
//

char
  = unescaped
  / escape
    sequence:(
        '"'
      / "\\\\"
      / "/"
      / "b" { return "\\b"; }
      / "f" { return "\\f"; }
      / "n" { return "\\n"; }
      / "r" { return "\\r"; }
      / "t" { return "\\t"; }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16));
        }
    )
    { return sequence; }

escape "escape character"
  = "\\\\"

quotation_mark
  = '"'

unescaped "normal character"
  = [^\\0-\\x1F\\x22\\x5C]

DIGIT  = [0-9]
HEXDIG = [0-9a-f]i
  
//
// Basic rules for whitespace and comments
//	 

ws "optional whitespace" = rws?

rws "whitespace"         
  = ([ \\t\\n\\r]
  / SingleLineComment 
  / MultiLineComment )*
  
Comment "comment"
  = MultiLineComment
  / SingleLineComment

MultiLineComment
  = "/*" (!"*/" SourceCharacter)* "*/"

SingleLineComment
  = "//" (!LineTerminator SourceCharacter)*

SourceCharacter
  = .  

LineTerminator "end of line"
  = [\\n\\r\\u2028\\u2029]
`;
    }

    private grammarContent(): string {
        let result: string = "";
        this.parts.forEach((part) => {
            if (!!part.unit) {
                result += `// Rules for "${part.unit.name}"\n`;
            } else {
                result += `// Common rules\n`;
            }
            part.rules.map((rule) => {
                result += rule.toGrammar() + "\n\n";
            });
        });
        return result.trimEnd();
    }

    private imports(): string[] {
        let result: string[] = [];
        this.parts.forEach((part) => {
            part.rules.map((rule) => {
                    if (rule.nameToImport() && rule.nameToImport().length > 0) {
                        result.push(rule.nameToImport())
                    }
                }
            );
        });
        return result;
    }

    public getStartRules(): string[] {
        const result: string[] = [];
        this.parts.forEach((part) => {
            if (!!part.unit) {
                result.push(getTypeCall(part.unit)) + "YYY";
            }
        })
        return  result;
    }

    // toMethod(): string {
    //     const className: string = Names.syntaxAnalyser(this.language);
    //     let switchContent: string = "";
    //     this.parts.forEach((part) =>
    //         part.rules.map((rule) => {
    //             const name = rule.ruleName;
    //             switchContent += `if ('${name}' === brName) {
    //                     return this.${this.getPartAnalyserName(part)}.transform${name}(branch);
    //                 } else `;
    //         }),
    //     );
    //
    //     switchContent += `if ('${refRuleName}' === brName) {
    //                     return this.transform${refRuleName}(branch);
    //                 } else `;
    //
    //     // Template starts here
    //     return `
    //     import {net} from "net.akehurst.language-agl-processor";
    //     import SyntaxAnalyser = net.akehurst.language.api.syntaxAnalyser.SyntaxAnalyser;
    //     import SharedPackedParseTree = net.akehurst.language.api.sppt.SharedPackedParseTree;
    //     import SPPTBranch = net.akehurst.language.api.sppt.SPPTBranch;
    //     import SPPTLeaf = net.akehurst.language.api.sppt.SPPTLeaf;
    //     import SPPTNode = net.akehurst.language.api.sppt.SPPTNode;
    //     import { ${Names.FreNamedNode}, ${Names.FreParseLocation}, ${Names.FreNodeReference} } from "@freon4dsl/core";
    //     import { ${this.parts.map((part) => `${Names.unitAnalyser(this.language, part.unit)}`).join(", ")} } from ".";
    //
    //     /**
    //     *   Class ${className} is the main syntax analyser.
    //     *   The actual work is being done by its parts, one for each model unit,
    //     *   and one common part that contains the methods used in multiple units.
    //     *
    //     */
    //     export class ${className} implements SyntaxAnalyser {
    //         sourceName: string = "";
    //         locationMap: any;
    //         ${this.parts.map((part) => `private ${this.getPartAnalyserName(part)}: ${Names.unitAnalyser(this.language, part.unit)} = new ${Names.unitAnalyser(this.language, part.unit)}(this)`).join(";\n")}
    //
    //         clear(): void {
    //             throw new Error("Method not implemented.");
    //         }
    //
    //         transform\<T\>(sppt: SharedPackedParseTree): T {
    //             if (!!sppt.root) {
    //                 return this.${internalTransformNode}(sppt.root) as unknown as T;
    //             } else {
    //                 return null;
    //             }
    //         }
    //
    //         public ${internalTransformNode}(node: SPPTNode): any {
    //             if (!!node) {
    //                 try {
    //                     if (node.isLeaf) {
    //                         return this.${internalTransformLeaf}(node);
    //                     } else if (node.isBranch) {
    //                         return this.${internalTransformBranch}(node as SPPTBranch);
    //                     }
    //                 } catch (e) {
    //                     if (e.message.startsWith("Syntax error in ") || e.message.startsWith("Error in ${className}")) {
    //                         throw e;
    //                     } else {
    //                         // add more info to the error message
    //                         throw new Error(\`Syntax error in "\${this.sourceName} (line: \${node.location.line}, column: \${node.location.column})": \${e.message}\`);
    //                     }
    //                     // console.log(e.message + e.stack);
    //                 }
    //             } else {
    //                 return null;
    //             }
    //         }
    //
    //         private ${internalTransformLeaf}(node: SPPTNode): any {
    //             let tmp = ((node as SPPTLeaf)?.nonSkipMatchedText).trim();
    //             if (tmp.length > 0) {
    //                 if (tmp.startsWith('"')) { // stringLiteral, strip the surrounding quotes
    //                     tmp = tmp.slice(1, tmp.length - 1);
    //                     return tmp;
    //                 } else if (tmp == "${this.falseValue}") { // booleanLiteral
    //                     return false;
    //                 } else if (tmp == "${this.trueValue}") { // booleanLiteral
    //                     return true;
    //                 } else if (Number.isInteger(parseInt(tmp, 10))) { // numberLiteral
    //                     return parseInt(tmp, 10);
    //                 } else { // identifier
    //                     return tmp;
    //                 }
    //             }
    //             return null;
    //         }
    //
    //         private ${internalTransformBranch}(branch: SPPTBranch): any {
    //             const brName: string = branch.name;
    //             ${switchContent}
    //             {
    //                 throw new Error(\`Error in ${className}: \${brName} not handled for node '\${branch?.matchedText}'\`);
    //             }
    //         }
    //
    //         /**
    //          * Generic method to get the children of a branch. Throws an error if no children can be found.
    //          */
    //         public getChildren(branch: SPPTBranch): any {
    //             if (!!branch && !!branch.nonSkipChildren) {
    //                 try {
    //                     return branch.nonSkipChildren.toArray();
    //                 } catch (e) {
    //                     throw new Error(\`Cannot follow branch: \${e.message} (\${branch.matchedText.trimEnd()})\`);
    //                 }
    //             }
    //             return null;
    //         }
    //
    //         /**
    //          * Generic method to get the optional group of a branch. Throws an error if no group can be found.
    //          */
    //         public getGroup(branch: SPPTBranch) {
    //             // take the first element in the [0..1] optional group or multi branch
    //             let group: any = branch;
    //             let stop: boolean = false;
    //             while (!stop) {
    //                 let nextOne: any = null;
    //                 try {
    //                     nextOne = group.nonSkipChildren?.toArray()[0];
    //                 } catch (e) {
    //                     throw new Error(\`Cannot follow group: \${e.message} (\${group.matchedText})\`);
    //                 }
    //                 if (!nextOne || (!nextOne.name.includes("multi") && !nextOne.name.includes("group"))) {
    //                     stop = true; // found a branch with actual content, return its parent!
    //                 } else {
    //                     group = nextOne;
    //                 }
    //             }
    //             return group;
    //         }
    //
    //         public transform${refRuleName}(branch: SPPTBranch){
    //             if (branch.name.includes("multi") || branch.name.includes("List")) { // its a path name
    //                 return this.${internalTransformList}<string>(branch, "${this.refSeparator}");
    //             } else { // its a single name
    //                 return this.${internalTransformLeaf}(branch);
    //             }
    //         }
    //
    //         /**
    //          * Generic method to transform references
    //          * ...FreNodeRef = identifier;
    //          */
    //         public freNodeRef\<T extends ${Names.FreNamedNode}\>(branch: SPPTBranch, typeName: string) : ${Names.FreNodeReference}\<T\> {
    //             let referred: string | string[] | T = this.${internalTransformNode}(branch);
    //             if (this.getChildren(branch)?.length > 1) {
    //                 // its a path name
    //                 referred = this.transformSharedPackedParseTreeList<string>(branch, '${this.refSeparator}');
    //             }
    //             if (referred === null || referred === undefined ) {
    //                 // throw new Error(\`Syntax error in "\${branch?.parent?.matchedText}": cannot create empty reference\`);
    //                 return null;
    //             } else if (typeof referred === "string" && (referred as string).length === 0) {
    //                 // throw new Error(\`Syntax error in "\${branch?.parent?.matchedText}": cannot create empty reference\`);
    //                 return null;
    //             } else {
    //                 return ${Names.FreNodeReference}.create<T>(referred, typeName);
    //             }
    //         }
    //
    //         /**
    //          * Generic method to transform lists
    //          */
    //         public ${internalTransformList}\<T\>(branch: SPPTBranch, separator?: string): T[] {
    //             let result: T[] = [];
    //             const children = this.getChildren(branch);
    //             if (!!children) {
    //                 for (const child of children) {
    //                     let element: any = this.${internalTransformNode}(child);
    //                     if (element !== null && element !== undefined ) {
    //                         if (separator === null || separator === undefined) {
    //                             result.push(element);
    //                         } else {
    //                             if (element !== separator) {
    //                                 result.push(element);
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //             return result;
    //         }
    //
    //         /**
    //          * Generic method to transform lists of references
    //          */
    //         public ${internalTransformRefList}\<T extends ${Names.FreNamedNode}\>(branch: SPPTBranch, typeName: string, separator?: string): ${Names.FreNodeReference}\<T\>[] {
    //             let result: ${Names.FreNodeReference}\<T\>[] = [];
    //             const children = this.getChildren(branch);
    //             if (!!children) {
    //                 for (const child of children) {
    //                     let refName: any = this.${internalTransformNode}(child);
    //                     if (refName !== null && refName !== undefined) {
    //                         if (separator === null || separator === undefined) {
    //                             result.push(${Names.FreNodeReference}.create<T>(refName, typeName));
    //                         } else {
    //                             if (refName !== separator) {
    //                                 result.push(${Names.FreNodeReference}.create<T>(refName, typeName));
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //             return result;
    //         }
    //
    //         public location(branch: SPPTBranch): ${Names.FreParseLocation} {
    //             return ${Names.FreParseLocation}.create({
    //                 filename: this.sourceName,
    //                 line: branch.location.line,
    //                 column: branch.location.column
    //             });
    //         }
    //     }`;
    //     // end Template
    // }

    // private getPartAnalyserName(part: GrammarPart) {
    //     if (!!part.unit) {
    //         return `_unit_${part.unit.name}_analyser`;
    //     } else {
    //         return `_unit_common_analyser`;
    //     }
    // }
}
