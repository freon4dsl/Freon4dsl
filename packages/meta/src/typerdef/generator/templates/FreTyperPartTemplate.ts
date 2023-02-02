import { Names, PROJECTITCORE, LANGUAGE_GEN_FOLDER, TYPER_CONCEPTS_FOLDER } from "../../../utils";
import { FreConcept, FreLanguage, FreClassifier } from "../../../languagedef/metalanguage";
import { TyperDef } from "../../metalanguage";
import { ListUtil } from "../../../utils";
import { FreTypeEqualsMaker } from "./FreTypeEqualsMaker";
import { FreTypeInferMaker } from "./FreTypeInferMaker";
import { FreSuperTypeMaker } from "./FreSuperTypeMaker";
import { FreTyperGenUtils } from "./FreTyperGenUtils";

export class FreTyperPartTemplate {
    typerdef: TyperDef;
    language: FreLanguage;
    imports: string[] = [];
    importedClassifiers: FreClassifier[] = []; // holds all classifiers that need to be imported, either from LANGUAGE_GEN_FOLDER, or from TYPER_CONCEPTS_FOLDER

    generateTyperPart(language: FreLanguage, typerdef: TyperDef, relativePath: string): string {
        if (!!typerdef) {
            return this.generateFromDefinition(typerdef, language, relativePath);
        } else {
            return this.generateDefault(language);
        }
    }

    private generateDefault(language: FreLanguage): string {
        // const allLangConcepts: string = Names.allConcepts(language);
        const typerInterfaceName: string = Names.FreTyperPart;
        const generatedClassName: string = Names.typerPart(language);

        // Template starts here
        return `
        import { ${Names.FreNode}, ${Names.FreType}, FreTyper, FreCompositeTyper} from "${PROJECTITCORE}";
        
        export class ${generatedClassName} implements ${typerInterfaceName} {
            mainTyper: FreCompositeTyper;
            
            /**
             * Returns true if 'modelelement' is marked as 'type' in the Typer definition.
             * @param modelelement
             */
            public isType(modelelement: ${Names.FreNode}): boolean | null {
                return false;
            }
        
            /**
             * Returns the type of 'modelelement' according to the type rules in the Typer Definition.
             * @param modelelement
             */
            public inferType(modelelement: ${Names.FreNode}): ${Names.FreType} | null {
                return null;
            }
        
            /**
             * Returns true if type1 equals type2.
             * This is a strict equal.
             * @param type1
             * @param type2
             */
            public equals(type1: ${Names.FreType}, type2: ${Names.FreType}): boolean | null {
                return false;
            }
        
            /**
             * Returns true if type1 conforms to type2. The direction is type1 conforms to type2.
             * @param type1
             * @param type2
             */
            public conforms(type1: ${Names.FreType}, type2: ${Names.FreType}): boolean | null {
                return false;
            }
        
            /**
             * Returns true if all types in typelist1 conform to the types in typelist2, in the given order.
             * @param typelist1
             * @param typelist2
             */
            public conformsList(typelist1: ${Names.FreType}[], typelist2: ${Names.FreType}[]): boolean | null {
                return false;
            }
        
            /**
             * Returns the common super type of all types in typelist
             * @param typelist
             */
            public commonSuper(typelist: ${Names.FreType}[]): ${Names.FreType} | null {
                return null;
            }   
            
            /**
             * Returns all super types as defined in the typer definition.
             * @param type
             */
            public getSuperTypes(type: ${Names.FreType}): ${Names.FreType}[] | null {
                return [];
            }     
        }`;
    }

    private generateFromDefinition(typerdef: TyperDef, language: FreLanguage, relativePath: string) {
        this.typerdef = typerdef;
        this.language = language;
        let rootType = Names.classifier(typerdef?.typeRoot());
        ListUtil.addIfNotPresent(this.imports, rootType);
        const allLangConcepts: string = Names.allConcepts(language);
        ListUtil.addIfNotPresent(this.imports, allLangConcepts);
        const generatedClassName: string = Names.typerPart(language);
        const typerInterfaceName: string = Names.FreTyperPart;
        const equalsMaker: FreTypeEqualsMaker = new FreTypeEqualsMaker();
        const inferMaker: FreTypeInferMaker = new FreTypeInferMaker();
        const superTypeMaker: FreSuperTypeMaker = new FreSuperTypeMaker();

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
            public isType(modelelement: ${Names.FreNode}): boolean | null {
                ${this.makeIsType(typerdef.types)}
            }
                        
            /**
             * Returns the type of 'modelelement' according to the type rules in the Typer Definition.
             * @param modelelement
             */
            public inferType(modelelement: ${Names.FreNode}): ${Names.FreType} | null {
                if (!modelelement) return null;
                let result: ${Names.FreType} = null;
                ${inferMaker.makeInferType(typerdef, allLangConcepts, rootType, "modelelement", this.importedClassifiers)}
                return result;
            }

            /**
             * Returns true if type1 equals type2.
             * This is a strict equal.
             * @param type1
             * @param type2
             */
            public equals(type1: ${Names.FreType}, type2: ${Names.FreType}): boolean | null {
                if (!type1 || !type2 ) return false;  
                ${equalsMaker.makeEqualsType(typerdef, "type1", "type2", this.importedClassifiers)}
                return false;
            }
            
            /**
             * Returns true if type1 conforms to type2. The direction is type1 conforms to type2.
             * @param type1
             * @param type2
             */
            public conforms(type1: ${Names.FreType}, type2: ${Names.FreType}): boolean | null {
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
            public conformsList(typelist1: ${Names.FreType}[], typelist2: ${Names.FreType}[]): boolean | null {
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
            public commonSuper(typelist: ${Names.FreType}[]): ${Names.FreType} | null {
                const result: ${Names.FreType}[] = FreCommonSuperTypeUtil.commonSuperType(typelist, this.mainTyper);        
                if (!!result && result.length > 0) {
                    return result[0];
                }
                return null;
            }

            /**
             * Returns all super types as defined in the typer definition.
             * @param type
             */
            public getSuperTypes(type: ${Names.FreType}): ${Names.FreType}[] {
                ${superTypeMaker.makeSuperTypes(typerdef, "type", this.importedClassifiers)}
            }
                        
            ${inferMaker.extraMethods.map(meth => meth).join("\n\n")}
                      
            private typeOf(myArg: ${Names.FreNode} | ${Names.FreNode}[]): ${Names.FreType} {
                let result: ${Names.FreType};
                if (Array.isArray(myArg)) {
                    result = this.mainTyper.commonSuperType(myArg);
                } else {
                    result = this.mainTyper.inferType(myArg);
                }
                return result;
            }
            
            private getElemFromAstType(type: ${Names.FreType}, metatype: string): ${Names.FreNode} {
                if (type.$typename === "AstType") {
                    const astElement: ${Names.FreNode} = (type as AstType).astElement;
                    if (${Names.FreLanguage}.getInstance().metaConformsToType(astElement, metatype)) {
                        return astElement;
                    }
                }
                return null;
            }
        }`;

        const typeConceptImports: string [] = [];
        this.importedClassifiers.forEach(cls => {
            if (FreTyperGenUtils.isType(cls)) {
                if (cls.name !== Names.FreType) {
                    ListUtil.addIfNotPresent(typeConceptImports, Names.classifier(cls));
                }
            } else {
                ListUtil.addIfNotPresent(this.imports, Names.classifier(cls));
            }

        });

        const imports = `import { ${typerInterfaceName}, FreCompositeTyper, ${Names.FreType}, AstType, ${Names.FreNode}, ${Names.FreLanguage}, ${Names.FreNodeReference}, FreCommonSuperTypeUtil } from "${PROJECTITCORE}";
        import { ${this.imports.map(im => im).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";
        ${typeConceptImports.length > 0 ? `import { ${typeConceptImports.map(im => im).join(", ")} } from "${relativePath}${TYPER_CONCEPTS_FOLDER}";` : ``}`;

        return imports + baseClass;
    }

    private makeIsType(allTypes: FreClassifier[]) {
        let result: string;
        // add statements for all concepts that are marked 'isType'
        // all elements of allTypes should be FreConcepts
        const myList: FreConcept[] = allTypes.filter(t => t instanceof FreConcept) as FreConcept[];
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
