import { ConceptUtils } from "../../../languagedef/generator/templates/ConceptUtils.js"
import { FreMetaConcept, FreMetaPrimitiveType } from "../../../languagedef/metalanguage/index.js";
import { FretTypeConcept, TyperDef } from "../../metalanguage/index.js";
import { Names, Imports } from "../../../utils/on-lang/index.js"
import { ListUtil } from '../../../utils/no-dependencies/index.js';

export class FreTypeConceptMaker {
    freTypeName: string = Names.FreType;

    generateTypeConcept(concept: FretTypeConcept, relativePath: string): string {
        const myName: string = Names.classifier(concept);
        const hasSuper = !!concept.base;
        const extendsClass = hasSuper
            ? `extends ${Names.classifier(concept.base.referred)}`
            : `implements ${this.freTypeName}`;
        const imports = new Imports(relativePath)
        imports.core = new Set<string>([Names.FreUtils, Names.FreWriter, Names.FreParseLocation]);
        if (!hasSuper) {
            imports.core.add(this.freTypeName);
            imports.core.add(Names.FreNode);
        }
        imports.language = this.findModelImports(concept);
        imports.typer = this.findTypeImports(concept, hasSuper);

        // Template starts here
        return `
            // Template: FreTyperConceptMaker.generateTypeConcept(...)
            ${imports.makeImports(concept.language)}

            /**
             * Class ${myName} is the implementation of the type concept with the same name in the typer definition file.
             */
            export class ${myName} ${extendsClass} {
                ${ConceptUtils.makeStaticCreateMethod(concept, myName)}

                ${ConceptUtils.makeBasicProperties("string", myName, hasSuper)}
                ${concept
                    .implementedPrimProperties()
                    .map((p) => ConceptUtils.makePrimitiveProperty(p))
                    .join("\n")}
                ${concept
                    .implementedParts()
                    .map((p) => ConceptUtils.makePartProperty(p))
                    .join("\n")}

                ${this.makeConstructor(hasSuper)}
                ${ConceptUtils.makeCopyMethod(concept, myName, false)}

                toFreString(writer: ${Names.FreWriter}): string {
                    // take into account indentation
                    return ${this.makeToFreString(myName, concept)};
                }

                ${
                    !hasSuper
                        ? `toAstElement(): ${Names.FreNode} | undefined {
                    return undefined;
                }`
                        : ``
                }
            }
        `;
    }

    private makeToFreString(myName: string, concept: FretTypeConcept): string {
        const props: string[] = [];
        concept.allProperties().forEach((prop) => {
            if (prop.type instanceof FreMetaPrimitiveType) {
                props.push(`${prop.name}: \${this.${prop.name}}`);
            } else if (prop.type instanceof FretTypeConcept) {
                props.push(`${prop.name}: \${this.${prop.name}?.toFreString(writer)}`);
            } else {
                props.push(`${prop.name}: \${writer.writeToString(this.${prop.name})}`);
            }
        });
        // take into account indentation
        let result: string = `${myName} [
    ${props.map((p) => `${p}`).join(",\n\t")}
]`;
        result = "`" + result + "`";
        return result;
    }

    private makeConstructor(hasSuper: boolean): string {
        return `constructor(id?: string) {
                    ${
                        !hasSuper
                            ? `
                        if (!!id) {
                            this.$id = id;
                        } else {
                            this.$id = ${Names.FreUtils}.ID(); // uuid.v4();
                        }`
                            : "super(id);"
                    }
                }`;
    }

    private findModelImports(concept: FretTypeConcept): Set<string> {
        // return the names of all property types that are not FretTypeConcepts
        const result: Set<string> = new Set<string>();
        concept.implementedParts().forEach((part) => {
            if (
                !(part.type instanceof FretTypeConcept) &&
                part.type.name !== this.freTypeName &&
                !(part.type instanceof FreMetaPrimitiveType)
            ) {
                result.add(Names.classifier(part.type));
            }
        });
        return result;
    }

    private findTypeImports(concept: FretTypeConcept, hasSuper: boolean): Set<string> {
        // return the names of all property types that are FretTypeConcepts
        const result: Set<string> = new Set<string>()
        if (hasSuper) {
            result.add(Names.classifier(concept.base.referred));
        }
        concept.implementedParts().forEach((part) => {
            if (part.type instanceof FretTypeConcept && part.type.name !== Names.FreType) {
                result.add(Names.classifier(part.type));
            }
        });
        return result;
    }

    public makeIndexFile(typerdef: TyperDef) {
        const tmp: string[] = typerdef.typeConcepts.map((con) => Names.classifier(con));
        return `
        // Template: FreTyperConceptMaker.makeIndexFile(...)
        /**
         * This index deploys the pattern from Michael Weststrate
         * (https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
         * in order to avoid problem with circular imports.
         */

        export {
        ${tmp.map((c) => `${c}`).join(",\n")}
        } from "./internal.js"`;
    }

    public makeInternalFile(typerdef: TyperDef) {
        const tmp: string[] = [];

        this.sortConcepts(typerdef.typeConcepts)
            .reverse()
            .map((c) => tmp.push(Names.concept(c)));
        typerdef.typeConcepts.forEach((con) => {
            if (!!con.base) {
                ListUtil.addIfNotPresent(tmp, Names.classifier(con.base.referred));
            }
        });
        // the template starts here
        return `
        // Template: FreTyperConceptMaker.makeInternalFile(...)
        /**
         * This index deploys the pattern from Michael Weststrate
         * (https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
         * in order to avoid problem with circular imports.
         *
         * The exports are sorted such that base concepts are exported before the
         * concepts that are extending them.
         */

        ${tmp.map((c) => `export * from "./${c}.js";`).join("\n")}
        `;
    }

    // TODO test this method and see if it is better than the one in GenerationHelpers
    private sortConcepts(list: FreMetaConcept[]): FreMetaConcept[] {
        const result: (FreMetaConcept | undefined)[] = list
            .map((con) => (!con.base ? con : undefined))
            .filter((el) => el !== undefined);
        const conceptsWithBase: (FreMetaConcept | undefined)[] = list
            .map((con) => (con.base ? con : undefined))
            .filter((el) => el !== undefined);
        if (conceptsWithBase.length > 0) {
            ListUtil.addListIfNotPresent(result, this.sortConcepts(conceptsWithBase.map((con) => con!.base.referred)));
        }
        if (result.length > 0) {
            return result as FreMetaConcept[];
        } else {
            return [];
        }
    }
}
