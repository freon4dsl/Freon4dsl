import {
    PiConcept
} from "../../../../languagedef/metalanguage";
import { LANGUAGE_GEN_FOLDER, Names } from "../../../../utils";
import { refSeparator } from "./RHSEntries";

export class SyntaxAnalyserTemplate {

    generateSyntaxAnalyser(langUnit: PiConcept, branchNames: string[], imports: string[], generatedSyntaxAnalyserMethods: string, relativePath: string): string {
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
                        throw new Error(\`Syntax error in "\${node?.matchedText}": \${e.message}\`);
                    }
                }
            }
            
            private transformLeaf(node: SPPTNode): any {
                let tmp = ((node as SPPTLeaf)?.matchedText).trim();
                if (tmp.startsWith('"')) { // stringLiteral, strip the surrounding quotes
                    tmp = tmp.slice(1, tmp.length - 1);
                    return tmp;
                } else if (tmp == "false") { // booleanLiteral
                    return false;
                } else if (tmp == "true") { // booleanLiteral
                    return true;
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
                    throw new Error(\`Error in ${Names.syntaxAnalyser(langUnit)}: \${brName} not handled for node '\${branch?.matchedText}'\`);
                }
            }
            
            ${generatedSyntaxAnalyserMethods}

            /**
             * Generic method to get the children of a branch. Throws an error if no children can be found.
             */
            private getChildren(branch: SPPTBranch, methodName: string): any {
                let children: any = null;
                try {
                    return branch.nonSkipChildren.toArray();
                } catch (e) {
                    throw new Error(\`In \${methodName}: cannot find children: \${branch?.matchedText}\`);
                }
                return children;
            }

            /**
             * Generic method to get the optional group of a branch. Throws an error if no group can be found.
             */            
            private getGroup(branch: SPPTBranch) {
                // take the first element in the [0..1] optional group or multi branch
                let group: any = branch;
                let stop: boolean = false;
                while (!stop) {
                    let nextOne: any = null;
                    try {
                        nextOne = group.nonSkipChildren.toArray()[0]; 
                    } catch (e) {
                        throw new Error(\`Cannot find children of \${group.matchedText}: \${e.message}\`);
                    }
                    if (!nextOne.name.includes("multi") && !nextOne.name.includes("group")) {
                        stop = true; // found a branch with actual content, return its parent!
                    } else {
                        group = nextOne;
                    }
                }
                return group;
            }
              
            private transform__pi_reference(branch: SPPTBranch){
                if (branch.name.includes("multi") || branch.name.includes("List")) {
                    return this.transformList<string>(branch, "${refSeparator}");
                } else {
                    return this.transformLeaf(branch);
                }
            }
    
            /**
             * Generic method to transform references
             * ...PiElemRef = identifier;
             */
            private piElemRef\<T extends PiNamedElement\>(branch: SPPTBranch, typeName: string) : PiElementReference\<T\> {
                let referred: string | string[] | T = this.transformNode(branch);
                if (referred == null || referred == undefined ) {
                    throw new Error(\`Syntax error in "\${branch?.parent?.matchedText}": cannot create empty reference\`);
                } else if (typeof referred === "string" && (referred as string).length == 0) {
                    throw new Error(\`Syntax error in "\${branch?.parent?.matchedText}": cannot create empty reference\`);
                } else {
                    return PiElementReference.create<T>(referred, typeName);
                }
            }
        
            /**
             * Generic method to transform lists
             */
            private transformList\<T\>(branch: SPPTBranch, separator?: string): T[] {
                let result: T[] = [];
                const children = this.getChildren(branch, "transformList");
                if (!!children) {
                    for (const child of children) {
                        let element: any = this.transformNode(child);
                        if (element !== null && element !== undefined) {
                            if (separator == null || separator == undefined) {
                                result.push(element);
                            } else {
                                if (element != separator) {
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
            private transformRefList\<T extends PiNamedElement\>(branch: SPPTBranch, typeName: string, separator?: string): PiElementReference\<T\>[] {
                let result: PiElementReference\<T\>[] = [];
                const children = this.getChildren(branch, "transformRefList");
                if (!!children) {
                    for (const child of children) {
                        let refName: any = this.transformNode(child);
                        if (refName !== null && refName !== undefined && refName.length > 0) {
                            if (separator === null || separator === undefined) {
                                result.push(PiElementReference.create<T>(refName, typeName));
                            } else {
                                if (refName !== separator) {
                                    result.push(PiElementReference.create<T>(refName, typeName));
                                }
                            }
                        }
                    }
                }
                return result;
            }
        }`;
        // end Template
    }
}
