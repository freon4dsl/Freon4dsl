import { Names, PROJECTITCORE, LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiConcept, PiLanguage, PiClassifier } from "../../../languagedef/metalanguage";
import { PiTyperDef } from "../../new-metalanguage";
import { ListUtil } from "../../../utils";
import { EqualsMaker } from "./EqualsMaker";
import { TyperGenUtils } from "./TyperGenUtils";
import { InferMaker } from "./InferMaker";

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
        const equalsMaker: EqualsMaker = new EqualsMaker();
        const inferMaker: InferMaker = new InferMaker();

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
        
                let inner: PiElement = null;
                ${inferMaker.makeInferType(typerdef, allLangConcepts, rootType, "modelelement", this.imports)}
                if (!!inner) {
                    return PiType.create({ internal: inner });
                }
                return null;
            }

            /**
             * Returns true if type1 equals type2.
             * This is a strict equal.
             * @param type1
             * @param type2
             */
            public equals(type1: PiType, type2: PiType): boolean | null {
                const internal1 = type1?.internal;
                const internal2 = type2?.internal;
                if (!internal1 || !internal2) return false;
                if (internal1.piLanguageConcept() !== internal2.piLanguageConcept()) {
                    return false;
                }
                
                ${equalsMaker.makeEqualsType(typerdef, "internal1", "internal2", this.imports)}
                return type1.internal === type2.internal;
            }
            
            /**
             * Returns true if type1 conforms to type2. The direction is type1 conforms to type2.
             * @param type1
             * @param type2
             */
            public conforms(type1: PiType, type2: PiType): boolean | null {
                if (!type1 || !type2) return null;
                // TODO implement this
                if ( this.equals(type1, type2) ) return true;
                return false;
            }
            
            /**
             * Returns true if all types in typelist1 conform to the types in typelist2, in the given order.
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
                return null;
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

        const imports = `import { ${typerInterfaceName}, PiType, PiElement, Language } from "${PROJECTITCORE}";
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
            `if (modelelement instanceof ${Names.concept(type)}) {
                return true;
            }`
        ).join(' else ')}`;
        result = result.concat(`return false;`);
        return result;
    }


}
