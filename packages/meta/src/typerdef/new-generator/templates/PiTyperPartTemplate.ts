import { Names, PROJECTITCORE, LANGUAGE_GEN_FOLDER, TYPER_CONCEPTS_FOLDER } from "../../../utils";
import { PiConcept, PiLanguage, PiClassifier } from "../../../languagedef/metalanguage";
import {
    PitTypeConcept,
    PiTyperDef
} from "../../new-metalanguage";
import { ListUtil } from "../../../utils";
import { EqualsMaker } from "./EqualsMaker";
import { InferMaker } from "./InferMaker";
import { SuperTypeMaker } from "./SuperTypeMaker";

export class PiTyperPartTemplate {
    typerdef: PiTyperDef;
    language: PiLanguage;
    imports: string[] = [];
    importedClassifiers: PiClassifier[] = []; // holds all classifiers that need to be imported, either from LANGUAGE_GEN_FOLDER, or from TYPER_CONCEPTS_FOLDER

    generateTyperPart(language: PiLanguage, typerdef: PiTyperDef, relativePath: string): string {
        if (!!typerdef) {
            return this.generateFromDefinition(typerdef, language, relativePath);
        } else {
            return this.generateDefault(language, relativePath);
        }
    }

    private generateDefault(language: PiLanguage, relativePath: string): string {
        // const allLangConcepts: string = Names.allConcepts(language);
        const typerInterfaceName: string = Names.PiTyperPart;
        const generatedClassName: string = Names.typerPart(language);

        // Template starts here
        return `
        import { PiElement, PiType, PiTyper, PiTyperPart } from "${PROJECTITCORE}";
        import { ${Names.typer(language)} } from "./${Names.typer(language)}";
        
        export class ${generatedClassName} implements ${typerInterfaceName} {
            mainTyper: ${Names.typer(language)};
            
            /**
             * Returns true if 'modelelement' is marked as 'type' in the Typer definition.
             * @param modelelement
             */
            public isType(modelelement: PiElement): boolean | null {
                return false;
            }
        
            /**
             * Returns the type of 'modelelement' according to the type rules in the Typer Definition.
             * @param modelelement
             */
            public inferType(modelelement: PiElement): PiType | null {
                return null;
            }
        
            /**
             * Returns true if type1 equals type2.
             * This is a strict equal.
             * @param type1
             * @param type2
             */
            public equals(type1: PiType, type2: PiType): boolean | null {
                return false;
            }
        
            /**
             * Returns true if type1 conforms to type2. The direction is type1 conforms to type2.
             * @param type1
             * @param type2
             */
            public conforms(type1: PiType, type2: PiType): boolean | null {
                return false;
            }
        
            /**
             * Returns true if all types in typelist1 conform to the types in typelist2, in the given order.
             * @param typelist1
             * @param typelist2
             */
            public conformsList(typelist1: PiType[], typelist2: PiType[]): boolean | null {
                return false;
            }
        
            /**
             * Returns the common super type of all types in typelist
             * @param typelist
             */
            public commonSuper(typelist: PiType[]): PiType | null {
                return null;
            }   
            
            /**
             * Returns all super types as defined in the typer definition.
             * @param type
             */
            public getSuperTypes(type: PiType): PiType[] | null {
                return [];
            }     
        }`;
    }

    private generateFromDefinition(typerdef: PiTyperDef, language: PiLanguage, relativePath: string) {
        this.typerdef = typerdef;
        this.language = language;
        let rootType = Names.classifier(typerdef.typeRoot());
        ListUtil.addIfNotPresent(this.imports, rootType);
        const allLangConcepts: string = Names.allConcepts(language);
        ListUtil.addIfNotPresent(this.imports, allLangConcepts);
        const generatedClassName: string = Names.typerPart(language);
        const typerInterfaceName: string = Names.PiTyperPart;
        const equalsMaker: EqualsMaker = new EqualsMaker();
        const inferMaker: InferMaker = new InferMaker();
        const superTypeMaker: SuperTypeMaker = new SuperTypeMaker();

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
             * Returns true if 'modelelement' is marked as 'type' in the Typer definition.
             * @param modelelement
             */
            public isType(modelelement: PiElement): boolean | null {
                ${this.makeIsType(typerdef.types)}
            }
                        
            /**
             * Returns the type of 'modelelement' according to the type rules in the Typer Definition.
             * @param modelelement
             */
            public inferType(modelelement: PiElement): PiType | null {
                if (!modelelement) return null;
                if (modelelement instanceof PiType) {
                    return modelelement;
                }
                let result: PiType = null;
                ${inferMaker.makeInferType(typerdef, allLangConcepts, rootType, "modelelement", this.importedClassifiers)}
                return result;
            }

            /**
             * Returns true if type1 equals type2.
             * This is a strict equal.
             * @param type1
             * @param type2
             */
            public equals(type1: PiType, type2: PiType): boolean | null {
                if (!type1 || !type1.internal || !type2 || !type2.internal) return false;  
                ${equalsMaker.makeEqualsType(typerdef, "type1", "type2", this.importedClassifiers)}
                return type1.internal === type2.internal;
            }
            
            /**
             * Returns true if type1 conforms to type2. The direction is type1 conforms to type2.
             * @param type1
             * @param type2
             */
            public conforms(type1: PiType, type2: PiType): boolean | null {
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
            public conformsList(typelist1: PiType[], typelist2: PiType[]): boolean | null {
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
            public commonSuper(typelist: PiType[]): PiType | null {
                const result: PiType[] = CommonSuperTypeUtil.commonSuperType(typelist, this.mainTyper);        
                if (!!result && result.length > 0) {
                    return result[0];
                }
                return null;
            }

            /**
             * Returns all super types as defined in the typer definition.
             * @param type
             */
            public getSuperTypes(type: PiType): PiType[] {
                ${superTypeMaker.makeSuperTypes(typerdef, "type", this.importedClassifiers)}
            }
                        
            ${inferMaker.extraMethods.map(meth => meth).join("\n\n")}
            
            private metaTypeOk(element: PiElement, requestedType: string): boolean {
                const metatype = element.piLanguageConcept();
                if (metatype === requestedType || Language.getInstance().subConcepts(requestedType).includes(metatype)) {
                    return true;
                }
                return false;
            }
            
            private typeOf(myArg: PiElement | PiElement[]): PiType {
                let result: PiType;
                if (Array.isArray(myArg)) {
                    result = this.mainTyper.commonSuperType(myArg);
                } else {
                    result = this.mainTyper.inferType(myArg);
                }
                return result;
            }
        }`;

        const typeConceptImports: string [] = [];
        this.importedClassifiers.forEach(cls => {
           if (cls instanceof PitTypeConcept) {
               ListUtil.addIfNotPresent(typeConceptImports, Names.classifier(cls));
           } else {
               ListUtil.addIfNotPresent(this.imports, Names.classifier(cls));
           }
        });

        ListUtil.addIfNotPresent(this.imports, "PiElementReference");
        const imports = `import { ${typerInterfaceName}, PiType, PiElement, Language, CommonSuperTypeUtil } from "${PROJECTITCORE}";
        import { ${this.imports.map(im => im).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";
        ${typeConceptImports.length > 0 ? `import { ${typeConceptImports.map(im => im).join(", ")} } from "${relativePath}${TYPER_CONCEPTS_FOLDER}";` : ``}
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
            `if (modelelement instanceof ${Names.concept(type)}) {
                return true;
            }`
        ).join(' else ')}`;
        result = result.concat(`return false;`);
        return result;
    }
}