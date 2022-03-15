import { Names, PROJECTITCORE, LANGUAGE_GEN_FOLDER, sortConcepts, langExpToTypeScript } from "../../../utils";
import { PiConcept, PiInterface, PiLanguage, PiLangExp, PiLangSelfExp, PiClassifier } from "../../../languagedef/metalanguage";
import {
    PiTyperDef,
    PitClassifierRule,
    PitAnyTypeRule,
    PitInferenceRule,
    PitExp,
    PitInstanceExp,
    PitAnytypeExp, PitFunctionCallExp, PitPropertyCallExp, PitSelfExp, PitStatement, PitWhereExp, PitConforms, PitEquals, PitAppliedExp
} from "../../new-metalanguage";

const inferFunctionName: string = "inferType";
const conformsFunctionName: string = "conformsTo";
const equalsFunctionName: string = "equalsType";

export class PiTyperPartTemplate {
    typerdef: PiTyperDef;
    language: PiLanguage;

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
        }`;
    }

    private generateFromDefinition(typerdef: PiTyperDef, language: PiLanguage, relativePath: string) {
        this.typerdef = typerdef;
        this.language = language;
        const rootType = null;
        const allLangConcepts: string = Names.allConcepts(language);
        const generatedClassName: string = Names.typerPart(language);
        const typerInterfaceName: string = Names.PiTyperPart;

        // Template starts here
        return `
        import { ${typerInterfaceName}, Language } from "${PROJECTITCORE}";
        import { ${allLangConcepts} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";
        import { ${language.concepts.map(concept => `
                ${Names.concept(concept)}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";       
        import { ${language.interfaces.map(intf => `
                ${intf.name}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";       
        import { ${Names.typer(language)} } from "./${Names.typer(language)}";
        
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
                ${this.makeInferType(typerdef)}
                if (this.mainTyper.isType(modelelement)) {
                    return modelelement;
                }
                return this.defaultType;
            }
            
            /**
             * See interface 
             */
            public equalsType(elem1: ${allLangConcepts}, elem2: ${allLangConcepts}): boolean | null {
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
        }`;
    }

    private makeIsType(allTypes: PiClassifier[]) {
        let result: string = "";
        // add statements for all concepts that are marked 'isType'
        for (const type of allTypes) {
            if (type instanceof PiConcept) { // should be the case for all elements of allTypes
                result = result.concat(`if (elem instanceof ${Names.concept(type)}) {
                                    return true;
                                }`);
            }
        }
        result = result.concat(`return false;`);
        return result;
    }

    private makeInferType(typerDef: PiTyperDef): string {
        let result: string = '';
        // make entry for all concepts that have an inferType rule
        // const inferRules: PitInferenceRule[] = typerDef.classifierRules.filter(rule =>
        //             rule instanceof PitInferenceRule) as PitInferenceRule[];
        //
        // result = inferRules.map(conRule => {
        //     `if (modelelement.piLanguageConcept() === ${conRule.myClassifier.name}) {
        //         return ${this.makeInferExp(conRule.exp)};
        //      }`
        // }).join(" else ");

        // add entry for all types that do not have an inferType rule
        return result;
    }

    private makeInferExp(exp: PitExp): string {
        if (exp instanceof PitPropertyCallExp) {
            return `${inferFunctionName}(${this.makeTypeScriptForExp(exp)})`;
        } else if (exp instanceof PitWhereExp) {
            let type = exp.otherType.type;
            exp.conditions.forEach(cond => {
                // which part of the condition refers to 'otherType'
                // otherTypePart = cond.left.
            })
            return `${Names.classifier(type)}.create({
                baseType: PiElementReference.create(this.inferType((modelelement as UnitLiteral).inner) as PredefinedType, "PredefinedType"),
                unit: (modelelement as UnitLiteral).unit
            })`;
        } else {
            return this.makeTypeScriptForExp(exp);
        }
    }

    private makeTypeScriptForExp(exp: PitExp): string {
        if (exp instanceof PitAnytypeExp) {
            return "any";
        } else if (exp instanceof PitFunctionCallExp) {
            let argumentsStr: string = exp.actualParameters.map(arg => `${this.makeTypeScriptForExp(arg)}`).join(", ");
            return `${this.makeSourceTypeScript(exp)}${exp.calledFunction}(${argumentsStr})`;
        } else if (exp instanceof PitPropertyCallExp) {
            return `${this.makeSourceTypeScript(exp)}${exp.property.name}`;
        } else if (exp instanceof PitInstanceExp) {
            return Names.concept(exp.myLimited) + ":" + Names.instance(exp.myInstance);
        } else if (exp instanceof PitSelfExp) {
            return `(modelelement as ${Names.classifier(exp.returnType)}).`;
        } else if (exp instanceof PitConforms) {
            return `${conformsFunctionName}(${this.makeTypeScriptForExp(exp.left)}, ${this.makeTypeScriptForExp(exp.right)})`;
        } else if (exp instanceof PitEquals) {
            return `${equalsFunctionName}(${this.makeTypeScriptForExp(exp.left)}, ${this.makeTypeScriptForExp(exp.right)})`;
        } else if (exp instanceof PitWhereExp) {
            // no common typescript for all occcurences of whereExp
        }
        return '';
    }

    private makeSourceTypeScript(exp: PitAppliedExp) {
        let sourceStr: string = "";
        if (!!exp.source) {
            sourceStr = this.makeTypeScriptForExp(exp.source);
        }
        return sourceStr;
    }

    private makeEqualsType(typerdef: PiTyperDef): string {
        return '';
    }
}
