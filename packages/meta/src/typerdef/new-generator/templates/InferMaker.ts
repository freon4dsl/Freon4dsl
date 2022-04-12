import {
    PitInferenceRule,
    PiTyperDef
} from "../../new-metalanguage";
import {  Names } from "../../../utils";
import { PiClassifier } from "../../../languagedef/metalanguage";
import { NewTyperGenUtils } from "./NewTyperGenUtils";

export class InferMaker {
    extraMethods: string[] = [];
    typerdef: PiTyperDef = null;
    private toBeCopied: PiClassifier[] = [];

    public makeInferType(typerDef: PiTyperDef, allLangConcepts: string, rootType: string, varName: string, imports: PiClassifier[]): string {
        NewTyperGenUtils.types = typerDef.types;
        this.typerdef = typerDef;
        let result: string = "";
        // find all infertype rules
        const inferRules: PitInferenceRule[] = [];
        typerDef.classifierSpecs.forEach(spec => {
            inferRules.push(...(spec.rules.filter(r => r instanceof PitInferenceRule)))
        });
        // make an entry for all classifiers that have an infertype rule
        result = `${inferRules.map(conRule =>
            `if (${varName}.piLanguageConcept() === "${Names.classifier(conRule.owner.myClassifier)}") {
                result = ${NewTyperGenUtils.makeExpAsType(conRule.exp, varName, imports)};
             }`
        ).join(" else ")}`;
        // add an entry for all types that do not have an inferType rule
        if (result.length > 0) { // include an else only if we already have an if-statement
            result += " else ";
        }
        result += `if (this.mainTyper.isType(${varName})) {
                result = PiType.create({ internal: ${varName} });
            }`;
        return result;
    }

    // // for all elements in toBeCopied add a method to extraMethods
    // // first, make sure all parts can be copied as well
    // const extraToBeCopied: PiClassifier[] = [];
    // extraToBeCopied.push(...this.toBeCopied);
    // this.toBeCopied.forEach(cls =>{
    //     const subs: PiClassifier[] = LangUtil.findAllImplementorsAndSubs(cls).filter(c => c instanceof PiConcept && !c.isAbstract);
    //     subs.forEach(sub => {
    //         sub.allParts().forEach(prop => {
    //             ListUtil.addIfNotPresent(extraToBeCopied, prop.type);
    //         })
    //     })
    // });
    // // second, make the methods
    // extraToBeCopied.forEach(cls => {
    //     const typeName: string = Names.classifier(cls);
    //     const subs: PiClassifier[] = LangUtil.findAllImplementorsAndSubs(cls).filter(c => c instanceof PiConcept && !c.isAbstract);
    //
    //     let method: string = `private makeCopyOf${cls.name}(toBeCopied: ${typeName}): ${typeName} {
    //         let result: ${typeName} = toBeCopied;
    //         ${subs.map(s => `if (toBeCopied.piLanguageConcept() === "${Names.classifier(s)}") {
    //             result = ${Names.classifier(s)}.create({
    //                 ${s.allProperties().map(prop =>
    //             `${prop.name}:${TyperGenUtils.makeCopyEntry(prop, "toBeCopied", Names.classifier(s))}`).join(",\n")}
    //             });
    //         }`).join(" else ")}
    //         return result;
    //     }`;
    //
    //     this.extraMethods.push(method);
    //     ListUtil.addIfNotPresent(imports, typeName);
    // });

    /*
    private makeWhereInferExp(exp: PitWhereExp, varName: string, imports: PiClassifier[], varType: PiClassifier): string {
        // for each where exp we create an extra method that creates the new type and a call to this method
        // we add 'this.extraMethods.length' to make the name unique
        const methodName: string = "make" + Names.classifier(exp.otherType.type) + this.extraMethods.length;
        const argName: string = "from";
        // make the method and store it in 'this.extraMethods'
        // for each condition in the expression we create a part of the input to the create method
        let methodStr: string = "";
        const conditionStr: string[] = [];
        const partCreation: string[] = [];
        exp.sortedConditions().forEach((cond, index) => {
            // left hand side needs to be created from the elements of the right handside
            if (cond.left instanceof PitPropertyCallExp) {
                // create the property to be use in the final 'create' method
                const partName = `newPart${index + 1}`;                         // its name
                // create the value for this property, all needed statements are added to 'partCreation'
                this.makeRHS(cond.right, argName, partName, cond.left.property, imports, partCreation);
                // make the part to be used in the 'create' method
                conditionStr.push(`${cond.left.property.name}: ${partName}`);
            }
        });

        // make the method
        let type = exp.otherType.type;
        methodStr = `private ${methodName}(${argName}: ${Names.classifier(varType)}): ${Names.classifier(type)} {
            ${partCreation.map(p => p).join("\n")}
            return ${Names.classifier(type)}.create({
                ${conditionStr.map(str => str).join(",\n")}
            });
        }`;
        // add the method to 'this.extraMethods'
        if (methodStr.length > 0) {
            this.extraMethods.push(methodStr);
        }
        // add the right classes to the imports
        ListUtil.addIfNotPresent(imports, Names.classifier(type));
        ListUtil.addIfNotPresent(imports, Names.classifier(varType));
        // make the method call and return it
        return `this.${methodName}(${varName} as ${Names.classifier(varType)})`;
    }

    private isComplexExp(right: PitExp): boolean {
        if (right instanceof PitFunctionCallExp) {
            return true;
        } else if (right instanceof PitPropertyCallExp && right.source) {
            return this.isComplexExp(right.source);
        } else if (right instanceof PitExpWithType) {
            return this.isComplexExp(right.inner);
        } else if (right instanceof PitWhereExp) {
            return true;
        }
        return false;
    }

    private splitExps(exp: PitExp): PitExp[] {
        const result: PitExp[] = [];
        result.push(exp);
        if (exp instanceof PitAppliedExp) {
            if (!!exp.source) {
                result.push(...this.splitExps(exp.source));
            }
            exp.source = null;
        } else if (exp instanceof PitExpWithType) {
            result.push(exp.inner);
        }
        return result;
    }

    private makeRHS(right: PitExp, varName: string, partName: string, property: PiProperty, imports: PiClassifier[], partCreation: string[]) {
        let partBaseType = Names.classifier(property.type);   // its ProjectIt type
        let partType = partBaseType;                          // its TS type
        if (!property.isPart) {
            ListUtil.addIfNotPresent(imports, "PiElementReference");
            ListUtil.addIfNotPresent(imports, partBaseType);
            partType = `PiElementReference<${partBaseType}>`;
        }
        let rightStr: string = '';
        if (this.isComplexExp(right)) {
            // we know somewhere in the string of expressions there is a Function call or a where exp
            // first sort the expression such that the source is first
            const expSeries: PitExp[] = this.splitExps(right).reverse();
            let nextVar: string;
            let prevVar: string;
            expSeries.forEach((exp, index) => {
                nextVar = "var" + index + exp.constructor.name;
                if (index === 0) {
                    partCreation.push(`let ${nextVar}: ${Names.classifier(exp.returnType)} =
                        ${this.makeSpecial(exp, varName, prevVar, exp.returnType, property.isPart, imports, partCreation)}`);
                    // it is the first variable in the list, so we cannot assign it to the previous variable

                } else {
                    partCreation.push(`let ${nextVar}: ${Names.classifier(exp.returnType)} =
                        ${this.makeSpecial(exp, varName, prevVar, exp.returnType, property.isPart, imports, partCreation)};`);
                }
                prevVar = nextVar;
            });
            rightStr = nextVar;
        } else {
            rightStr = TyperGenUtils.makeTypeScriptForExp(right, varName, imports);
        }
        if (!property.isPart) {
            partCreation.push(`const ${partName}: ${partType} = PiElementReference.create<${partBaseType}>(${rightStr}, "${partBaseType}")`);
        } else {
            partCreation.push(`const ${partName}: ${partType} = ${rightStr}`);
        }
    }

    private makeSpecial(exp: PitExp, varName: string, nextVar: string, returnType: PiClassifier, isPart: boolean, imports: PiClassifier[], partCreation: string[]): string {
        // returns the typescript to get the value for 'varName'
        // and adds all needed extra statements to 'partCreation'
        let result: string = '';
        if (this.isComplexExp(exp)) {
            if (exp instanceof PitFunctionCallExp) {
                // do argument(s)
                let argVar: string = "myArg"
                let argType: string = Names.classifier(exp.actualParameters[0].returnType);
                ListUtil.addIfNotPresent(imports, argType);
                if (exp.actualParameters[0].isList) {
                    argType = argType + '[]';
                }
                // partCreation.push(`const ${argVar}: ${argType} = ${this.makeSpecial(exp.actualParameters[0], varName, argVar, exp.actualParameters[0].returnType, true, imports, partCreation)};`);
                partCreation.push(`const ${argVar}: ${argType} = ${TyperGenUtils.makeTypeScriptForExp(exp.actualParameters[0], varName, imports)};`);
                // do function
                const funcVar: string = "checkedVar";
                if (exp.calledFunction === "typeof") {
                    const typeVar = "typeVar";
                    partCreation.push(`const ${typeVar}: PiType = this.typeOf(${argVar});`);
                    partCreation.push(`let ${funcVar}: ${Names.classifier((returnType))};`);
                    if (isPart) {
                        // remember to create a copy method for this type
                        ListUtil.addIfNotPresent(this.toBeCopied, returnType);
                        //
                        partCreation.push(`if (!!${typeVar} && !!${typeVar}.internal && this.metaTypeOk(${typeVar}.internal, "${Names.classifier((returnType))}")) {
                            // make sure the node in the AST is copied, otherwise its parent would be changed!!!
                            ${funcVar} = this.makeCopyOfTypeUsage(${typeVar}.internal as ${Names.classifier((returnType))});
                        }`);
                    } else {
                        partCreation.push(`if (!!${typeVar} && !!${typeVar}.internal && this.metaTypeOk(${typeVar}.internal, "${Names.classifier((returnType))}")) {
                            ${funcVar} = ${typeVar}.internal as ${Names.classifier((returnType))};
                        }`);
                    }
                }
                return `${funcVar}`;
            } else if (exp instanceof PitExpWithType) {
                return `(${nextVar} as ${Names.classifier(exp.returnType)})`;
            }
        } else if (exp instanceof PitPropertyCallExp) {
            return `${nextVar}.${TyperGenUtils.makeTypeScriptForExp(exp, varName, imports)}`;
        } else {
            return TyperGenUtils.makeTypeScriptForExp(exp, varName, imports);
        }
        return result;
    }
*/

}


