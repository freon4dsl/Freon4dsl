import { PiConcept, PiLanguage, PiPrimitiveType } from "../../../languagedef/metalanguage";
import { PitTypeConcept, PiTyperDef } from "../../metalanguage";
import { ConceptUtils } from "../../../languagedef/generator/templates/ConceptUtils";
import { LANGUAGE_GEN_FOLDER, ListUtil, Names, PROJECTITCORE } from "../../../utils";

export class FreonTypeConceptMaker {
    piTypeName: string = "PiType";

    generateTypeConcept(language: PiLanguage, concept: PitTypeConcept, relativePath: string): string {
        const myName: string = Names.classifier(concept);
        const hasSuper = !!concept.base;
        const extendsClass = hasSuper ? `extends ${Names.classifier(concept.base.referred)}` : `implements ${this.piTypeName}`;
        const coreImports: string[] = ["PiUtils", "PiWriter", "PiParseLocation" ];
        if (!hasSuper) {
            coreImports.push(this.piTypeName);
            coreImports.push("PiElement");
        }
        const modelImports: string[] = this.findModelImports(concept, language);
        const typeImports: string[] = this.findTypeImports(concept, hasSuper);

        // Template starts here
        return `
            ${this.makeImportStatements(relativePath, coreImports, modelImports, typeImports)}

            /**
             * Class ${myName} is the implementation of the type concept with the same name in the typer definition file.
             */            
            export class ${myName} ${extendsClass} {
                ${ConceptUtils.makeStaticCreateMethod(concept, myName)}
                            
                ${ConceptUtils.makeBasicProperties("string", myName, hasSuper)}
                ${concept.implementedPrimProperties().map(p => ConceptUtils.makePrimitiveProperty(p)).join("\n")}
                ${concept.implementedParts().map(p => ConceptUtils.makePartProperty(p)).join("\n")}
                              
                ${this.makeConstructor(hasSuper)} 
                ${ConceptUtils.makeCopyMethod(concept, myName, false)}     
                
                toPiString(writer: PiWriter): string {
                    // take into account indentation
                    return ${this.makeToPiString(myName, concept)};
                }                  
                
                ${!hasSuper ? `toAstElement(): PiElement {
                    return null;
                }` : ``}                    
            }
        `;
    }

    private makeToPiString(myName: string, concept: PitTypeConcept): string {
        const props: string[] = [];
        concept.allProperties().forEach(prop => {
            if (prop.type instanceof PiPrimitiveType) {
                props.push(`${prop.name}: \${this.${prop.name}}`);
            } else if (prop.type instanceof PitTypeConcept) {
                props.push(`${prop.name}: \${this.${prop.name}?.toPiString(writer)}`);
            } else {
                props.push(`${prop.name}: \${writer.writeToString(this.${prop.name})}`);
            }
        });
        // take into account indentation
        let result: string = `${myName} [ 
    ${props.map(p => `${p}`).join(",\n\t")} 
]`;
        result = "\`" + result + "\`";
        return result;
    }

    private makeImportStatements(relativePath: string, importsFromCore: string[], modelImports: string[], typeImports: string[]): string {
        return `      
            ${importsFromCore.length > 0 ? `import { ${importsFromCore.join(",")} } from "${PROJECTITCORE}";` : ``}
            ${modelImports.length > 0 ? `import { ${modelImports.join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";` : ``}
            ${typeImports.length > 0 ? `import { ${typeImports.join(", ")} } from "./internal";`: `` }
            `;
    }

    private makeConstructor(hasSuper: boolean): string {
        return `constructor(id?: string) {
                    ${!hasSuper ? `
                        if (!!id) { 
                            this.$id = id;
                        } else {
                            this.$id = PiUtils.ID(); // uuid.v4();
                        }`
                        : "super(id);"
                    }                 
                }`;
    }

    private findModelImports(concept: PitTypeConcept, language: PiLanguage): string[] {
        // return the names of all property types that are not PitTypeConcepts
        const result: string[] = [];
        concept.implementedParts().forEach(part => {
            if (!(part.type instanceof PitTypeConcept) && part.type.name != this.piTypeName && !(part.type instanceof PiPrimitiveType)) {
                result.push(Names.classifier(part.type));
            }
        });
        return result;
    }

    private findTypeImports(concept: PitTypeConcept, hasSuper: boolean): string[] {
        // return the names of all property types that are PitTypeConcepts
        const result: string[] = [];
        if (hasSuper) {
            result.push(Names.classifier(concept.base.referred));
        }
        concept.implementedParts().forEach(part => {
            if (part.type instanceof PitTypeConcept && part.type.name != "PiType") {
                result.push(Names.classifier(part.type));
            }
        });
        return result;
    }

    public makeIndexFile(typerdef: PiTyperDef) {
        const tmp: string[] = typerdef.typeConcepts.map(con =>
            Names.classifier(con)
        );
        return `
        /**
         * This index deploys the pattern from Michael Weststrate
         * (https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
         * in order to avoid problem with circular imports.
         */
         
        export {
        ${tmp.map(c =>
            `${c}`
        ).join(",\n")}
        } from "./internal"`;
    }

    public makeInternalFile(typerdef: PiTyperDef) {
        const tmp: string[] = [];

        this.sortConcepts(typerdef.typeConcepts).reverse().map(c =>
            tmp.push(Names.concept(c))
        );
        typerdef.typeConcepts.forEach(con => {
            if (!!con.base) {
                ListUtil.addIfNotPresent(tmp, Names.classifier(con.base.referred));
            }
        });
        // the template starts here
        return `
        /**
         * This index deploys the pattern from Michael Weststrate
         * (https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
         * in order to avoid problem with circular imports.
         *
         * The exports are sorted such that base concepts are exported before the
         * concepts that are extending them.
         */           
            
        ${tmp.map(c =>
            `export * from "./${c}";`
        ).join("\n")}
        `;
    }

    // TODO test this method and see if it is better than the one in GenerationHelpers
    private sortConcepts(list: PiConcept[]): PiConcept[] {
        const result: PiConcept[] = list.map(con => !con.base ? con : null).filter(el => el !== null);
        const conceptsWithBase: PiConcept[] = list.map(con => con.base ? con : null).filter(el => el !== null);
        if (conceptsWithBase.length > 0) {
            ListUtil.addListIfNotPresent(result, this.sortConcepts(conceptsWithBase.map(con => con.base.referred)));
        }
        return result;
    }
}
