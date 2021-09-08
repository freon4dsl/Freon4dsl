import {
    PiBinaryExpressionConcept,
    PiConcept,
    PiExpressionConcept, PiInterface,
    PiLanguage,
    PiLimitedConcept,
    PiProperty
} from "../../../languagedef/metalanguage";
import { LANGUAGE_GEN_FOLDER, Names } from "../../../utils";
import {
    PiEditConcept,
    PiEditProjectionItem,
    PiEditProjectionText,
    PiEditPropertyProjection,
    PiEditSubProjection,
    PiEditUnit
} from "../../metalanguage";
// import { findEditorDefsForUnit, findTypeNameForProperty } from "./ParserAnalyser";
import { optionalRulePrefix } from "./ParserGenerator";

export class SyntaxAnalyserTemplate {
    binaryExpressions: PiBinaryExpressionConcept[] = [];
    private conceptMethods: string[] = [];
    private methodsForOptionalProjections: string[] = [];

    /**
     *
     */
    public generateSyntaxAnalyser2(language: PiLanguage, langUnit: PiConcept, editDef: PiEditUnit, relativePath: string): string {
        const expressionBase: PiExpressionConcept = language.findExpressionBase();
        // TODO findBinaryExpressionBase in language and use it in method for binary expressions
        this.binaryExpressions = [];
        this.methodsForOptionalProjections = [];
        const imports = language.concepts.map(concept => Names.concept(concept))
            .concat(language.interfaces.map(intf => Names.interface(intf)));

        // The following method sorts the elements in the editor definition and
        // stores its result in two lists: one for all editor definitions found, one for all used interfaces
        const sortedEditorDefs: PiEditConcept[] = [];
        const sortedInterfaces: PiInterface[] = [];

        // findEditorDefsForUnit(langUnit, editDef.conceptEditors, sortedEditorDefs, sortedInterfaces);

        // make the concept rules
        sortedEditorDefs.map(conceptDef => this.makeConceptMethod(conceptDef));

        // Template starts here
        return `
        import {net} from "net.akehurst.language-agl-processor";
        import SyntaxAnalyser = net.akehurst.language.api.syntaxAnalyser.SyntaxAnalyser;
        import SharedPackedParseTree = net.akehurst.language.api.sppt.SharedPackedParseTree;
        import SPPTBranch = net.akehurst.language.api.sppt.SPPTBranch;
        import SPPTLeaf = net.akehurst.language.api.sppt.SPPTLeaf;
        import SPPTNode = net.akehurst.language.api.sppt.SPPTNode;
        import { ${Names.PiElementReference}, ${imports.join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";    
        import {${Names.PiNamedElement}} from "@projectit/core";
        
        /**
        *   Class ${Names.language(language)}SyntaxAnalyser is ... TODO
        *   
        */
        export class ${Names.language(language)}SyntaxAnalyser implements SyntaxAnalyser {
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
                        return (node as SPPTLeaf).matchedText;
                    } else if (node.isBranch) {
                        return this.transformBranch(node as SPPTBranch);
                    }
                } catch (e) {
                    throw new Error(\`Syntax error in "\${node.matchedText}": \${e}\`);
                }
            }
            
            private transformBranch(branch: SPPTBranch): any {
                let brName: string = branch.name;
                if ('ExModel' == brName) {
                    return this.transformExModel(branch);
                } else {
                    throw \`Error in ${Names.language(language)}SyntaxAnalyser: \${brName} not handled\`;
                }
            }
            
            ${this.conceptMethods.map(method => `${method} ;`).join("\n\n")}
 
            /**
             * Generic method to transform binary expressions.
             * Binary expressions are parsed accordng to this rule:
             * BinaryExpression = [${Names.concept(expressionBase)} / operator]2+ ;
             * In this method we build a skewed tree, which in a later phase needs to be balanced
             * according to the priorities of the operators.
             * @param branch
             * @private
             */
            private binaryExpression(branch: SPPTBranch) : BinaryExpression {
                const actualList = branch.nonSkipChildren.toArray()[0].nonSkipChildren.toArray();
                let index = 0;
                let first = this.transformNode(actualList[index++]);
                while (index < actualList.length) {
                    let operator = this.transformNode(actualList[index++]);
                    let second = this.transformNode(actualList[index++]);
                    let combined: BinaryExpression = null;
                    switch (operator) {
                        ${this.binaryExpressions.map(exp =>
                        `case '${exp.getSymbol()}': {
                            combined = ${Names.concept(exp)}.create({left: first, right: second});
                            break;
                        }`)}
                        default: {
                            combined = null;
                        }
                    }
                    first = combined;
                }
                return first;
            }
 
 
            
            /**
             * Generic method to transform references
             * ...PiElemRef = identifier;
             */
            private piElemRef\<T extends PiNamedElement\>(branch: SPPTBranch) : PiElementReference\<T\> {
                let refName: string = this.transformNode(branch.nonSkipChildren.toArray()[0]);
                return PiElementReference.create\<T\>(refName, "T");
            }
        
            /**
             * Generic method to transform lists
             */
            private transformList\<T\>(branch: SPPTBranch, separator?: string) : T[] {
                // console.log(\`executing parameter list\`);
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

    private makeConceptMethod(conceptDef: PiEditConcept) {
        const piClassifier: PiConcept = conceptDef.concept.referred;
        if (piClassifier.isModel || piClassifier instanceof PiLimitedConcept) {
            // do nothing
        } else if (piClassifier instanceof PiBinaryExpressionConcept) {
            this.binaryExpressions.push(piClassifier);
        } else if (piClassifier.isAbstract) {
            // this.conceptMethods.push(this.makeChoiceMethod(piClassifier));
        } else {
            this.conceptMethods.push(this.makeOrdinaryMethod(conceptDef, piClassifier));
        }
    }

    private makeOrdinaryMethod(conceptDef: PiEditConcept, piClassifier: PiConcept) {
        const name = Names.concept(piClassifier);
        // determine which properties of the concept will get a value through this parse rule
        const propsToSet: PiProperty[] = [];
        conceptDef.projection.lines.forEach(l => {
            l.items.forEach(item => {
                if (item instanceof PiEditPropertyProjection) {
                    propsToSet.push(item.expression.findRefOfLastAppliedFeature());
                }
                if (item instanceof PiEditSubProjection) {
                    item.items.forEach(sub => {
                        if (sub instanceof PiEditPropertyProjection) {
                            propsToSet.push(sub.expression.findRefOfLastAppliedFeature());
                        }
                    });
                }
            });
        });

        let index: number = 0;
        return `
        private transform${name}(branch: SPPTBranch) : ${name} {
            const children = branch.nonSkipChildren.toArray();

            ${conceptDef.projection.lines.map(l =>
            `${this.doAllItems(l.items)}`)}
    
            return ${name}.create({${propsToSet.map(prop => `${prop.name}:${prop.name}`).join(", ")}});
        }`
    }

    private doAllItems(list: PiEditProjectionItem[]): string {
        let result = "";
        if (!!list && list.length > 0) {
            list.forEach((item, index) => {
                if (item instanceof PiEditProjectionText) {
                    // do nothing
                } else if (item instanceof PiEditPropertyProjection) {
                    result += `${this.makePropertyProjection(item, index)} `
                } else if (item instanceof PiEditSubProjection) {
                    result += `${this.makeSubProjection(item, index)} `
                }
            });
        }
        return result;
    }

    private makeSubProjection(item: PiEditSubProjection, index: number): string {
        // TODO check: I expect only one property projection in a sub projection
        if (item.optional) {
            const comment: string = `An optional element will always be parsed as a List. The List will have 1 or 0 element, 
            depending on whether or not the element is present in the input.`;
            // create both a method for the optional rule and a call to that method within the transform method for the
            // parent of this subprojection
            let newOptionalMethodName = optionalRulePrefix;
            let newOptionalMethod = "";
            item.items.forEach((sub, index) => {
                if (sub instanceof PiEditSubProjection) {
                    newOptionalMethod += this.makeSubProjection(sub, index);
                }
                if (sub instanceof PiEditPropertyProjection) {
                    // add the property name to the method name
                    let propName = sub.expression.findRefOfLastAppliedFeature().name;
                    newOptionalMethodName += propName.charAt(0).toUpperCase() + propName.slice(1);
                    newOptionalMethod += `${this.makePropertyProjection(sub, index)}`;
                }
                if (sub instanceof PiEditProjectionText) {
                    // do nothing
                }
            });
            // remember the extra method, it should be added to the output later
            this.methodsForOptionalProjections.push(`${newOptionalMethodName} = ${newOptionalMethod}`);
            return `${newOptionalMethodName}?`;
        } else {
            return `${this.doAllItems(item.items)}`;
        }
    }

    private makePropertyProjection(item: PiEditPropertyProjection, index: number): string {
        const myElem: PiProperty = item.expression.findRefOfLastAppliedFeature();
        const propName = myElem.name;
        if (!!myElem) {
            // find the right typeName
            // let typeName = findTypeNameForProperty(myElem, item, []);
            // if (myElem.isList) {
            //     return `
            //     const ${propName}Branch = children[${index}];
            //     let ${propName}: ${typeName}[] = [];
            //     if (!${propName}Branch.isEmptyMatch) {
            //         ${propName} = this.transformList<${typeName}>(${propName}Branch, '*');
            //     }`
            // } else {
            //     return `const ${propName} = this.transformNode(children[${index}]);`;
            // }
            return "";
        } else {
            return "";
        }
    }

    generateSyntaxAnalyser(language: PiLanguage, branchNames: string[], imports: string[], generatedSyntaxAnalyserMethods: string[], relativePath: string): string {
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
        *   Class ${Names.language(language)}SyntaxAnalyser is ... TODO
        *   
        */
        export class ${Names.language(language)}SyntaxAnalyser implements SyntaxAnalyser {
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
                        return (node as SPPTLeaf).matchedText;
                    } else if (node.isBranch) {
                        return this.transformBranch(node as SPPTBranch);
                    }
                } catch (e) {
                    throw new Error(\`Syntax error in "\${node.matchedText}": \${e}\`);
                }
            }
            
            private transformBranch(branch: SPPTBranch): any {
                let brName: string = branch.name;
                ${branchNames.map(name => `if ('${name}' == brName) {
                    return this.transform${name}(branch);
                    } else `).join("\n")}                
                {
                    throw \`Error in ${Names.language(language)}SyntaxAnalyser: \${brName} not handled\`;
                }
            }
            
            ${generatedSyntaxAnalyserMethods.map(method => `${method} ;`).join("\n\n")}
          
            /**
             * Generic method to transform references
             * ...PiElemRef = identifier;
             */
            private piElemRef\<T extends PiNamedElement\>(branch: SPPTBranch) : PiElementReference\<T\> {
                let refName: string = this.transformNode(branch.nonSkipChildren.toArray()[0]);
                return PiElementReference.create\<T\>(refName, "T");
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
