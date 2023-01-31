import { Names, PROJECTITCORE, LANGUAGE_GEN_FOLDER, TYPER_CONCEPTS_FOLDER } from "../../../utils";
import { PiConcept, PiLanguage, PiClassifier } from "../../../languagedef/metalanguage";
import { PiTyperDef } from "../../metalanguage";
import { ListUtil } from "../../../utils";
import { FreonTypeEqualsMaker } from "./FreonTypeEqualsMaker";
import { FreonTypeInferMaker } from "./FreonTypeInferMaker";
import { FreonSuperTypeMaker } from "./FreonSuperTypeMaker";
import { FreonTyperGenUtils } from "./FreonTyperGenUtils";

export class FreonTyperPartTemplate {
    typerdef: PiTyperDef;
    language: PiLanguage;
    imports: string[] = [];
    importedClassifiers: PiClassifier[] = []; // holds all classifiers that need to be imported, either from LANGUAGE_GEN_FOLDER, or from TYPER_CONCEPTS_FOLDER

    generateTyperPart(language: PiLanguage, typerdef: PiTyperDef, relativePath: string): string {
        if (!!typerdef) {
            return this.generateFromDefinition(typerdef, language, relativePath);
        } else {
            return this.generateDefault(language);
        }
    }

    private generateDefault(language: PiLanguage): string {
        // const allLangConcepts: string = Names.allConcepts(language);
        const typerInterfaceName: string = Names.FreonTyperPart;
        const generatedClassName: string = Names.typerPart(language);

        // Template starts here
        return `
        import { ${Names.PiElement}, ${Names.PiType}, FreTyper, FreCompositeTyper} from "${PROJECTITCORE}";
        
        export class ${generatedClassName} implements ${typerInterfaceName} {
            mainTyper: FreCompositeTyper;
            
            /**
             * Returns true if 'modelelement' is marked as 'type' in the Typer definition.
             * @param modelelement
             */
            public isType(modelelement: ${Names.PiElement}): boolean | null {
                return false;
            }
        
            /**
             * Returns the type of 'modelelement' according to the type rules in the Typer Definition.
             * @param modelelement
             */
            public inferType(modelelement: ${Names.PiElement}): ${Names.PiType} | null {
                return null;
            }
        
            /**
             * Returns true if type1 equals type2.
             * This is a strict equal.
             * @param type1
             * @param type2
             */
            public equals(type1: ${Names.PiType}, type2: ${Names.PiType}): boolean | null {
                return false;
            }
        
            /**
             * Returns true if type1 conforms to type2. The direction is type1 conforms to type2.
             * @param type1
             * @param type2
             */
            public conforms(type1: ${Names.PiType}, type2: ${Names.PiType}): boolean | null {
                return false;
            }
        
            /**
             * Returns true if all types in typelist1 conform to the types in typelist2, in the given order.
             * @param typelist1
             * @param typelist2
             */
            public conformsList(typelist1: ${Names.PiType}[], typelist2: ${Names.PiType}[]): boolean | null {
                return false;
            }
        
            /**
             * Returns the common super type of all types in typelist
             * @param typelist
             */
            public commonSuper(typelist: ${Names.PiType}[]): ${Names.PiType} | null {
                return null;
            }   
            
            /**
             * Returns all super types as defined in the typer definition.
             * @param type
             */
            public getSuperTypes(type: ${Names.PiType}): ${Names.PiType}[] | null {
                return [];
            }     
        }`;
    }

    private generateFromDefinition(typerdef: PiTyperDef, language: PiLanguage, relativePath: string) {
        this.typerdef = typerdef;
        this.language = language;
        let rootType = Names.classifier(typerdef?.typeRoot());
        ListUtil.addIfNotPresent(this.imports, rootType);
        const allLangConcepts: string = Names.allConcepts(language);
        ListUtil.addIfNotPresent(this.imports, allLangConcepts);
        const generatedClassName: string = Names.typerPart(language);
        const typerInterfaceName: string = Names.FreonTyperPart;
        const equalsMaker: FreonTypeEqualsMaker = new FreonTypeEqualsMaker();
        const inferMaker: FreonTypeInferMaker = new FreonTypeInferMaker();
        const superTypeMaker: FreonSuperTypeMaker = new FreonSuperTypeMaker();

        // TODO see if we need a default type to return from inferType

        // Template starts here
        const baseClass = `
        
        /**
         * Class ${generatedClassName} implements the typer generated from, if present, the typer definition,
         * otherwise this class implements the default typer.
         */
        export class ${generatedClassName} implements ${typerInterfaceName} {
            mainTyper: FreCompositeTyper; //  ${Names.typer(language)};

            /**
             * Returns true if 'modelelement' is marked as 'type' in the Typer definition.
             * @param modelelement
             */
            public isType(modelelement: ${Names.PiElement}): boolean | null {
                ${this.makeIsType(typerdef.types)}
            }
                        
            /**
             * Returns the type of 'modelelement' according to the type rules in the Typer Definition.
             * @param modelelement
             */
            public inferType(modelelement: ${Names.PiElement}): ${Names.PiType} | null {
                if (!modelelement) return null;
                let result: ${Names.PiType} = null;
                ${inferMaker.makeInferType(typerdef, allLangConcepts, rootType, "modelelement", this.importedClassifiers)}
                return result;
            }

            /**
             * Returns true if type1 equals type2.
             * This is a strict equal.
             * @param type1
             * @param type2
             */
            public equals(type1: ${Names.PiType}, type2: ${Names.PiType}): boolean | null {
                if (!type1 || !type2 ) return false;  
                ${equalsMaker.makeEqualsType(typerdef, "type1", "type2", this.importedClassifiers)}
                return false;
            }
            
            /**
             * Returns true if type1 conforms to type2. The direction is type1 conforms to type2.
             * @param type1
             * @param type2
             */
            public conforms(type1: ${Names.PiType}, type2: ${Names.PiType}): boolean | null {
                if (!type1 || !type2) return null;
                let result: boolean = false;
                if (this.equals(type1, type2)) {
                    result = true;
                } else {
                    this.getSuperTypes(type1).forEach(super1 => {
                       if (this.equals(super1, type2)) {
                           result = true;
                       }
                    });
                }
                return result;
            }
            
            /**
             * Returns true if all types in typelist1 conform to the types in typelist2, pairswise, in the given order.
             * @param typelist1
             * @param typelist2
             */
            public conformsList(typelist1: ${Names.PiType}[], typelist2: ${Names.PiType}[]): boolean | null {
                if (typelist1.length !== typelist2.length) return false;
                let result: boolean = true;
                for (let index in typelist1) {
                    result = this.conforms(typelist1[index], typelist2[index]);
                    if (result == false) return result;
                }
                return result;
            }
        
            /**
             * Returns the common super type of all types in typelist
             * @param typelist
             */
            public commonSuper(typelist: ${Names.PiType}[]): ${Names.PiType} | null {
                const result: ${Names.PiType}[] = FreCommonSuperTypeUtil.commonSuperType(typelist, this.mainTyper);        
                if (!!result && result.length > 0) {
                    return result[0];
                }
                return null;
            }

            /**
             * Returns all super types as defined in the typer definition.
             * @param type
             */
            public getSuperTypes(type: ${Names.PiType}): ${Names.PiType}[] {
                ${superTypeMaker.makeSuperTypes(typerdef, "type", this.importedClassifiers)}
            }
                        
            ${inferMaker.extraMethods.map(meth => meth).join("\n\n")}
                      
            private typeOf(myArg: ${Names.PiElement} | ${Names.PiElement}[]): ${Names.PiType} {
                let result: ${Names.PiType};
                if (Array.isArray(myArg)) {
                    result = this.mainTyper.commonSuperType(myArg);
                } else {
                    result = this.mainTyper.inferType(myArg);
                }
                return result;
            }
            
            private getElemFromAstType(type: ${Names.PiType}, metatype: string): ${Names.PiElement} {
                if (type.$typename === "AstType") {
                    const astElement: ${Names.PiElement} = (type as AstType).astElement;
                    if (${Names.FreLanguage}.getInstance().metaConformsToType(astElement, metatype)) {
                        return astElement;
                    }
                }
                return null;
            }
        }`;

        const typeConceptImports: string [] = [];
        this.importedClassifiers.forEach(cls => {
            if (FreonTyperGenUtils.isType(cls)) {
                if (cls.name !== "${Names.PiType}") {
                    ListUtil.addIfNotPresent(typeConceptImports, Names.classifier(cls));
                }
            } else {
                ListUtil.addIfNotPresent(this.imports, Names.classifier(cls));
            }

        });

        const imports = `import { ${typerInterfaceName}, FreCompositeTyper, ${Names.PiType}, AstType, ${Names.PiElement}, ${Names.FreLanguage}, ${Names.PiElementReference}, FreCommonSuperTypeUtil } from "${PROJECTITCORE}";
        import { ${this.imports.map(im => im).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";
        ${typeConceptImports.length > 0 ? `import { ${typeConceptImports.map(im => im).join(", ")} } from "${relativePath}${TYPER_CONCEPTS_FOLDER}";` : ``}
        // import { ${Names.typerPart(language)} } from "./${Names.typerPart(language)}";`;

        return imports + baseClass;
    }

    private makeIsType(allTypes: PiClassifier[]) {
        let result: string;
        // add statements for all concepts that are marked 'isType'
        // all elements of allTypes should be PiConcepts
        const myList: PiConcept[] = allTypes.filter(t => t instanceof PiConcept) as PiConcept[];
        myList.forEach(type => {
            ListUtil.addIfNotPresent(this.imports, Names.concept(type));
        });
        result = `${myList.map(type => 
            `if (modelelement instanceof ${Names.concept(type)}) {
                return true;
            }`
        ).join(' else ')}`;
        result = result.concat(`return false;`);
        return result;
    }
}
