import { Names, Imports } from "../../../utils/on-lang/index.js"
import { FreMetaConcept, FreMetaLanguage, FreMetaClassifier } from "../../../languagedef/metalanguage/index.js";
import { TyperDef } from "../../metalanguage/index.js";
import { FreTypeEqualsMaker } from "./FreTypeEqualsMaker.js";
import { FreTypeInferMaker } from "./FreTypeInferMaker.js";
import { FreSuperTypeMaker } from "./FreSuperTypeMaker.js";
import { FreTyperGenUtils } from "./FreTyperGenUtils.js";
import { LOG2USER } from '../../../utils/basic-dependencies/index.js';

export class FreTyperPartTemplate {
    // @ts-ignore Property is set in the only public method 'generateTyperPart'.
    typerdef: TyperDef;
    // @ts-ignore Property is set in the only public method 'generateTyperPart'.
    language: FreMetaLanguage;
    importedClassifiers: FreMetaClassifier[] = []; // holds all classifiers that need to be imported, either from LANGUAGE_GEN_FOLDER, or from TYPER_CONCEPTS_FOLDER

    generateTyperPart(language: FreMetaLanguage, typerdef: TyperDef | undefined, relativePath: string): string {
        if (language === undefined || language === null) {
            LOG2USER.error("Could not create type part, because language was not set.");
            return "";
        }
        this.language = language;
        if (!!typerdef) {
            return this.generateFromDefinition(typerdef, relativePath);
        } else {
            return this.generateDefault();
        }
    }

    private generateDefault(): string {
        // const allLangConcepts: string = Names.allConcepts(language);
        const generatedClassName: string = Names.typerPart(this.language);
        const imports: Imports = new Imports()
        imports.core = new Set<string>([Names.FreNode, Names.FreType, Names.FreTyper, Names.FreCompositeTyper])

        // Template starts here
        return `
        // TEMPLATE: FreTyperPartTemplate.generateDefault(...)
        ${imports.makeImports(this.language)}

        export class ${generatedClassName} implements ${Names.FreTyper} {
            mainTyper: FreCompositeTyper;

            /**
             * Returns true if 'node' is marked as 'type' in the Typer definition.
             * @param node
             */
            public isType(node: ${Names.FreNode}): boolean | null {
                return false;
            }

            /**
             * Returns the type of 'node' according to the type rules in the Typer Definition.
             * @param node
             */
            public inferType(node: ${Names.FreNode}): ${Names.FreType} | null {
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

    private generateFromDefinition(typerdef: TyperDef, relativePath: string) {
        this.typerdef = typerdef;
        this.language = this.language;
        const rootType: string = !!typerdef?.typeRoot() ? Names.classifier(typerdef?.typeRoot()!) : "unknown-root-type";
        const generatedClassName: string = Names.typerPart(this.language);
        const equalsMaker: FreTypeEqualsMaker = new FreTypeEqualsMaker();
        const inferMaker: FreTypeInferMaker = new FreTypeInferMaker();
        const superTypeMaker: FreSuperTypeMaker = new FreSuperTypeMaker();
        const imports: Imports = new Imports(relativePath)
        imports.language.add(rootType);

        // TODO see if we need a default type to return from inferType

        // Template starts here
        const baseClass = `

        /**
         * Class ${generatedClassName} implements the typer generated from, if present, the typer definition,
         * otherwise this class implements the default typer.
         */
        export class ${generatedClassName} implements ${Names.FreTyper} {
            mainTyper: FreCompositeTyper; //  ${Names.typer(this.language)};

            /**
             * Returns true if 'node' is marked as 'type' in the Typer definition.
             * @param node
             */
            public isType(node: ${Names.FreNode}): boolean | null {
                ${this.makeIsType(typerdef.types, imports)}
            }

            /**
             * Returns the type of 'node' according to the type rules in the Typer Definition.
             * @param node
             */
            public inferType(node: ${Names.FreNode}): ${Names.FreType} | null {
                if (!node) { return null; }
                let result: ${Names.FreType} = null;
                ${inferMaker.makeInferType(typerdef, "node", this.importedClassifiers)}
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

            ${inferMaker.extraMethods.map((meth) => meth).join("\n\n")}

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

        this.importedClassifiers.forEach((cls) => {
            if (FreTyperGenUtils.isType(cls)) {
                if (cls.name !== Names.FreType) {
                    imports.typer.add(Names.classifier(cls));
                }
            } else {
                imports.language.add(Names.classifier(cls));
            }
        });
        imports.core = new Set<string>([
            Names.FreTyper,
            Names.FreCompositeTyper,
            Names.FreType,
            Names.AstType,
            Names.FreNode,
            Names.FreLanguage,
            Names.FreCommonSuperTypeUtil
        ])
        
        // `${typeConceptImports.length > 0 ? `import { ${typeConceptImports.map((im) => im).join(", ")} } from "${relativePath}${TYPER_CONCEPTS_FOLDER}/index.js";` : ``}`;

        return `
            // TEMPLATE: FreTyperPartTemplate.generateFromDefinition(...)
            ${imports.makeImports(this.language)}

            ${baseClass}
            `
    }

    private makeIsType(allTypes: FreMetaClassifier[], imports: Imports) {
        let result: string = "";
        // add statements for all concepts that are marked 'isType'
        // all elements of allTypes should be FreConcepts
        const myList: FreMetaConcept[] = allTypes.filter((t) => t instanceof FreMetaConcept) as FreMetaConcept[];
        myList.forEach((type) => {
            imports.language.add(Names.concept(type));
        });
        result = `${myList
            .map(
                (type) =>
                    `if (node instanceof ${Names.concept(type)}) {
                return true;
            }`,
            )
            .join(" else ")}`;
        result = result.concat(`return false;`);
        return result;
    }
}
