import {
    PiConcept,
    PiLanguage
} from "../../../languagedef/metalanguage";
import { LANGUAGE_GEN_FOLDER, Names } from "../../../utils";

export class SyntaxAnalyserTemplate {

    generateSyntaxAnalyser(langUnit: PiConcept, branchNames: string[], imports: string[], generatedSyntaxAnalyserMethods: string[], relativePath: string): string {
        // Template starts here
        return `
        import {net} from "net.akehurst.language-agl-processor";
        import SyntaxAnalyser = net.akehurst.language.api.syntaxAnalyser.SyntaxAnalyser;
        import SharedPackedParseTree = net.akehurst.language.api.sppt.SharedPackedParseTree;
        import SPPTBranch = net.akehurst.language.api.sppt.SPPTBranch;
        import SPPTLeaf = net.akehurst.language.api.sppt.SPPTLeaf;
        import SPPTNode = net.akehurst.language.api.sppt.SPPTNode;
        import { PiElementReference, ${imports.join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";    
        import {${Names.PiNamedElement}} from "@projectit/core";
        
        /**
        *   Class ${Names.syntaxAnalyser(langUnit)} is ... TODO
        *   
        */
        export class ${Names.syntaxAnalyser(langUnit)} implements SyntaxAnalyser {
            locationMap: any;
        
            clear(): void {
                throw new Error("Method not implemented.");
            }
        
            transform\<T\>(sppt: SharedPackedParseTree): T {
                if (!!sppt.root) {
                    return this.transformNode(sppt.root) as unknown as T;
                } else {
                    return null;
                }
            }
        
            private transformNode(node: SPPTNode): any {
                try {
                    if (node.isLeaf) {
                        return this.transformLeaf(node);
                    } else if (node.isBranch) {
                        return this.transformBranch(node as SPPTBranch);
                    }
                } catch (e) {
                    if (e.message.startsWith("Syntax error in ") || e.message.startsWith("Error in ${Names.syntaxAnalyser(langUnit)}")) {
                        throw e;
                    } else {
                        // add more info to the error message 
                        throw new Error(\`Syntax error in "\${node.matchedText}": \${e.message}\`);
                    }
                }
            }
            
            private transformLeaf(node: SPPTNode): any {
                let tmp = (node as SPPTLeaf).matchedText;
                if (tmp.startsWith("\\"")) { // stringLiteral
                    // it is a stringLiteral, we should strip the surrounding quotes
                    tmp = tmp.slice(1, tmp.length - 1);
                    return tmp;
                // } else if (tmp == "true") { // booleanLiteral
                //     return true;
                // } else if (tmp == "false") { // booleanLiteral
                //     return false;
                } else if (Number.isInteger(parseInt(tmp))) { // numberLiteral
                    return parseInt(tmp);
                } else { // identifier
                    return tmp;
                }
            }      
          
            private transformBranch(branch: SPPTBranch): any {
                let brName: string = branch.name;
                ${branchNames.map(name => `if ('${name}' == brName) {
                    return this.transform${name}(branch);
                    } else `).join("\n")}                
                {
                    throw new Error(\`Error in ${Names.syntaxAnalyser(langUnit)}: \${brName} not handled\`);
                }
            }
            
            ${generatedSyntaxAnalyserMethods.map(method => `${method}`).join("\n\n")}
          
            /**
             * Generic method to transform references
             * ...PiElemRef = identifier;
             */
            private piElemRef\<T extends PiNamedElement\>(branch: SPPTBranch, typeName: string) : PiElementReference\<T\> {
                let refName: string = this.transformNode(branch);
                // if (refName == null || refName == undefined || refName.length == 0) {
                //    throw new Error(\`Syntax error in "\${branch.matchedText}": cannot create empty reference\`);
                //}
                return PiElementReference.create\<T\>(refName, typeName );
            }
        
            /**
             * Generic method to transform lists
             */
            private transformList\<T\>(branch: SPPTBranch, separator?: string) : T[] {
                let result: T[] = [];
                for (const child of branch.nonSkipChildren.toArray()) {
                    let element: any = this.transformNode(child);
                    if (element) {
                        if (!separator) {
                            result.push(element);
                        } else {
                            if (element !== separator) result.push(element);
                        }
                    }
                }
                return result;
            }
        }`;
        // end Template
    }
}
