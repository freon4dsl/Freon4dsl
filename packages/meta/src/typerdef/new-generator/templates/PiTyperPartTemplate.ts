import { Names, PROJECTITCORE, LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiConcept, PiLanguage, PiClassifier } from "../../../languagedef/metalanguage";
import {
    PiTyperDef,
    PitInferenceRule,
    PitExp,
    PitInstanceExp,
    PitAnytypeExp, PitFunctionCallExp, PitPropertyCallExp, PitSelfExp, PitWhereExp, PitConforms, PitEquals, PitAppliedExp
} from "../../new-metalanguage";
import { TyperGenUtils } from "./TyperGenUtils";
import { ListUtil } from "../../../utils";
import { PitExpWithType } from "../../new-metalanguage/expressions/PitExpWithType";

const inferFunctionName: string = "inferType";
const conformsFunctionName: string = "conformsTo";
const equalsFunctionName: string = "equalsType";

export class PiTyperPartTemplate {
    typerdef: PiTyperDef;
    language: PiLanguage;
    imports: string[] = []; // holds all names of classes from PiLanguage that need to be imported

    generateTyperPart(language: PiLanguage, typerdef: PiTyperDef, relativePath: string): string {
        if (!!typerdef) {
            return this.generateFromDefinition(typerdef, language, relativePath);
        } else {
            return this.generateDefault(language, relativePath);
        }
    }

    private generateDefault(language: PiLanguage, relativePath: string): string {
        const allLangConcepts: string = Names.allConcepts(language);
        const typerInterfaceName: string = Names.PiTyperPart;
        const generatedClassName: string = Names.typerPart(language);

        // Template starts here
        return `
        import { ${typerInterfaceName} } from "${PROJECTITCORE}";
        import { ${allLangConcepts} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        import { ${Names.typer(language)} } from "./${Names.typer(language)}";
        
        export class ${generatedClassName} implements ${typerInterfaceName} {
            mainTyper: ${Names.typer(language)};
            
            /**
             * See interface 
             */
            public inferType(modelelement: ${allLangConcepts}): ${allLangConcepts} | null {
                if (this.mainTyper.isType(modelelement)) {
                    return modelelement;
                }
                return null;
            }
            /**
             * See interface 
             */
            public equalsType(elem1: ${allLangConcepts}, elem2: ${allLangConcepts}): boolean | null {
                const $type1: ${allLangConcepts} = this.mainTyper.inferType(elem1);
                const $type2: ${allLangConcepts} = this.mainTyper.inferType(elem2);
                if ($type1.piLanguageConcept() !== $type2.piLanguageConcept()) {
                    return false;
                }
                return $type1 === $type2;
            }
            /**
             * See interface 
             */
            public conformsTo(elem1: ${allLangConcepts}, elem2: ${allLangConcepts}): boolean | null {
                return true;
            }
            /**
             * See interface 
             */
            public conformList(typelist1: ${allLangConcepts}[], typelist2: ${allLangConcepts}[]): boolean | null {
                return true;
            }
            /**
             * See interface 
             */
            public isType(elem: ${allLangConcepts}): boolean | null {
                return false;
            }  
            
            /**
             * Returns the common super type of all elements in typelist
             * @param typelist
             */
            public commonSuperType(typelist: ${allLangConcepts}[]): ${allLangConcepts} | null {
                return null;
            }            
        }`;
    }

    private generateFromDefinition(typerdef: PiTyperDef, language: PiLanguage, relativePath: string) {
        this.typerdef = typerdef;
        this.language = language;
        let rootType = TyperGenUtils.getTypeRoot(language, typerdef);
        ListUtil.addIfNotPresent(this.imports, rootType);
        const allLangConcepts: string = Names.allConcepts(language);
        ListUtil.addIfNotPresent(this.imports, allLangConcepts);
        const generatedClassName: string = Names.typerPart(language);
        const typerInterfaceName: string = Names.PiTyperPart;

        // TODO see if we need a default type to return from inferType

        // Template starts here
        const baseClass = `
        
        /**
         * Class ${generatedClassName} implements the typer generated from, if present, the typer definition,
         * otherwise this class implements the default typer.
         */
        export class ${generatedClassName} implements ${typerInterfaceName} {
            mainTyper: ${Names.typer(language)};
            
            /**
             * See interface 
             */        
            public inferType(modelelement: ${allLangConcepts}): ${rootType} | null {
                if (!modelelement) return null;
                
                ${this.makeInferType(typerdef, allLangConcepts, rootType)}
                return null;
            }
            
            /**
             * See interface 
             */
            public equalsType(elem1: ${allLangConcepts}, elem2: ${allLangConcepts}): boolean | null {
                if (!elem1 || !elem2) return null;
                
                ${this.makeEqualsType(typerdef)}
                const $type1: ${allLangConcepts} = this.mainTyper.inferType(elem1);
                const $type2: ${allLangConcepts} = this.mainTyper.inferType(elem2);
                if ($type1.piLanguageConcept() !== $type2.piLanguageConcept()) {
                    return false;
                }
                return $type1 === $type2;
            }
            
            /**
             * See interface 
             */
            public conformsTo(elem1: ${rootType}, elem2: ${rootType}): boolean | null {
                if (!elem1 || !elem2) return null;
                if ( this.equalsType(elem1, elem2) ) return true;
                return false;
            }
            
            /**
             * See interface 
             */
            public conformList(typelist1: ${rootType}[], typelist2: ${rootType}[]): boolean | null {
                if (typelist1.length !== typelist2.length) return false;
                let result: boolean = true;
                for (let index in typelist1) {
                    result = this.conformsTo(typelist1[index], typelist2[index]);
                    if (result == false) return result;
                }
                return result;
            }

            /**
             * See interface 
             */        
            public isType(elem: ${allLangConcepts}): boolean | null { // entries for all types marked 'isType'
                ${this.makeIsType(typerdef.types)}
            } 
            
            /**
             * Returns the common super type of all elements in typelist
             * @param typelist
             */
            public commonSuperType(typelist: ${allLangConcepts}[]): ${rootType} | null {
                return null;
            }
        }`;

        const imports = `import { ${typerInterfaceName} } from "${PROJECTITCORE}";
        import { ${this.imports.map(im => im).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";
        import { ${Names.typer(language)} } from "./${Names.typer(language)}";`;

        return imports + baseClass;
    }

    private makeIsType(allTypes: PiClassifier[]) {
        let result: string = "";
        // add statements for all concepts that are marked 'isType'
        // all elements of allTypes should be PiConcepts
        const myList: PiConcept[] = allTypes.filter(t => t instanceof PiConcept) as PiConcept[];
        myList.forEach(type => {
            ListUtil.addIfNotPresent(this.imports, Names.concept(type));
        });
        result = `${myList.map(type => 
            `if (elem instanceof ${Names.concept(type)}) {
                return true;
            }`
        ).join(' else ')}`;
        result = result.concat(`return false;`);
        return result;
    }

    private makeInferType(typerDef: PiTyperDef, allLangConcepts: string, rootType: string): string {
        let result: string = '';
        if (!!typerDef.classifierRules) {
            // make entry for all concepts that have an inferType rule
            const inferRules: PitInferenceRule[] = typerDef.classifierRules.filter(rule =>
                rule instanceof PitInferenceRule) as PitInferenceRule[];

            result = `${inferRules.map(conRule =>
                `if (modelelement.piLanguageConcept() === "${conRule.myClassifier.name}") {
                return ${this.makeInferExp(conRule.exp)};
             }`
            ).join(" else ")}`;

            // add entry for all types that do not have an inferType rule
            if (result.length > 0) { // include an else if we already have an if-statement
                result += " else ";
            }
            let typeCast: string = '';
            if (allLangConcepts !== rootType) {
                typeCast = ` as ${rootType}`;
            }
            result += `if (this.mainTyper.isType(modelelement)) {
                return modelelement${typeCast};
            }`;
        }
        return result;
    }

    private makeInferExp(exp: PitExp): string {
        ListUtil.addIfNotPresent(this.imports, "PiElementReference");
        if (exp instanceof PitPropertyCallExp) {
            return this.makePropCallInferExp(exp);
        } else if (exp instanceof PitWhereExp) {
            return this.makeWhereInferExp(exp);
        } else {
            return this.makeTypeScriptForExp(exp);
        }
    }

    private makePropCallInferExp(exp: PitPropertyCallExp) {
        // use common super type, because the argument to inferType is a list
        let argStr: string = this.makeTypeScriptForExp(exp);
        if (exp.property.isList) {
            argStr = `this.mainTyper.commonSuperType(${argStr})`;
        }
        return `this.mainTyper.${inferFunctionName}(${argStr})`;
    }

    private makeWhereInferExp(exp: PitWhereExp) {
        let type = exp.otherType.type;
        const conditionStr: string[] = [];
        exp.conditions.forEach(cond => {
            // which part of the condition refers to 'otherType'
            let otherTypePart: PitExp;
            let knownTypePart: PitExp;
            let baseSource = cond.left.baseSource();
            if (baseSource instanceof PitPropertyCallExp && baseSource.property === exp.otherType) {
                otherTypePart = cond.left;
                knownTypePart = cond.right;
            } else {
                baseSource = cond.right.baseSource();
                if (baseSource instanceof PitPropertyCallExp && baseSource.property === exp.otherType) {
                    otherTypePart = cond.right;
                    knownTypePart = cond.left;
                }
            }
            // strip the source from otherTypePart
            otherTypePart = this.removeBaseSource(otherTypePart);
            // see whether we need a PiElementReference
            let appliedExp: PitPropertyCallExp;
            if (otherTypePart instanceof PitPropertyCallExp) {
                appliedExp = otherTypePart;
            }
            let myString: string;
            const myTypeStr = Names.classifier(appliedExp.property.type);
            if (!!appliedExp && !appliedExp.property.isPart) { // found a reference
                ListUtil.addIfNotPresent(this.imports, myTypeStr);
                myString = `PiElementReference.create<${myTypeStr}>(${this.makeTypeScriptForExp(knownTypePart)} as ${myTypeStr}, "${myTypeStr}")`;
            } else {
                myString = `${this.makeTypeScriptForExp(knownTypePart)} as ${myTypeStr}`;
            }
            // create the param to the create method
            const result: string = `${appliedExp.property.name}: ${myString}`;
            conditionStr.push(result);
        });

        ListUtil.addIfNotPresent(this.imports, Names.classifier(type));
        return `${Names.classifier(type)}.create({
                ${conditionStr.map(cond => cond).join(",\n")}
            })`;
    }

    private removeBaseSource(otherTypePart: PitExp | PitAppliedExp): PitAppliedExp {
        // console.log("removing base Source: " + otherTypePart.toPiString());
        if (otherTypePart instanceof PitAppliedExp && !!otherTypePart.source) {
            if (!(otherTypePart.source instanceof PitAppliedExp)) {
                return this.removeBaseSource(otherTypePart.source);
            } else {
                otherTypePart.source = null;
                // console.log("remove returns: " + otherTypePart.toPiString());
                return otherTypePart;
            }
        }
        console.log("remove returns: null" );
        return null;
    }

    private makeTypeScriptForExp(exp: PitExp, noSource?: boolean): string {
        if (exp instanceof PitAnytypeExp) {
            return "any";
        } else if (exp instanceof PitFunctionCallExp) {
            let argumentsStr: string = exp.actualParameters.map(arg => `${this.makeTypeScriptForExp(arg)}`).join(", ");
            if (exp.calledFunction === 'typeof') {
                // we know that typeof has a single argument
                if (exp.actualParameters[0] instanceof PitPropertyCallExp && exp.actualParameters[0].property.isList) { // use common super type, because the argument to inferType is a list
                    argumentsStr = `this.mainTyper.commonSuperType(${argumentsStr})`;
                }
                return `this.mainTyper.inferType(${argumentsStr})`;
            } else if (exp.calledFunction === 'commonSuperType') {
                return `this.mainTyper.commonSuperType([${argumentsStr}])`;
            } else {
                return `${exp.calledFunction}(${argumentsStr})`;
            }
        } else if (exp instanceof PitPropertyCallExp) {
            let refText: string = '';
            if (!exp.property.isPart) {
                refText = ".referred";
            }
            return `${this.makeSourceTypeScript(exp)}${exp.property.name}${refText}`;
        } else if (exp instanceof PitInstanceExp) {
            ListUtil.addIfNotPresent(this.imports, Names.concept(exp.myLimited));
            return Names.concept(exp.myLimited) + "." + Names.instance(exp.myInstance);
        } else if (exp instanceof PitSelfExp) {
            ListUtil.addIfNotPresent(this.imports, Names.classifier(exp.returnType));
            return `(modelelement as ${Names.classifier(exp.returnType)})`;
        } else if (exp instanceof PitConforms) {
            return `this.mainTyper.${conformsFunctionName}(${this.makeTypeScriptForExp(exp.left)}, ${this.makeTypeScriptForExp(exp.right)})`;
        } else if (exp instanceof PitEquals) {
            return `this.mainTyper.${equalsFunctionName}(${this.makeTypeScriptForExp(exp.left)}, ${this.makeTypeScriptForExp(exp.right)})`;
        } else if (exp instanceof PitWhereExp) {
            // no common typescript for all occcurences of whereExp
        } else if (exp instanceof PitExpWithType) {
            // TODO see if we really need a class PiExpWithType
            // console.log("returning empty for " + exp.toPiString() + " of type " + exp.constructor.name);
            return `(${this.makeTypeScriptForExp(exp.inner)} as ${Names.classifier(exp.expectedType)})`;
        }
        return '';
    }

    private makeSourceTypeScript(exp: PitAppliedExp) {
        let sourceStr: string = "";
        if (!!exp.source) {
            sourceStr = this.makeTypeScriptForExp(exp.source) + ".";
        }
        return sourceStr;
    }

    private makeEqualsType(typerdef: PiTyperDef): string {
        return '';
    }
}
