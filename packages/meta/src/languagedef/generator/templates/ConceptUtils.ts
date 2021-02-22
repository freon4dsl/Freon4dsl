import { Names, PROJECTITCORE } from "../../../utils";
import { PiConcept, PiConceptProperty, PiPrimitiveProperty } from "../../metalanguage";

export function findMobxImports(hasSuper: boolean, concept: PiConcept): string[] {
    const mobxImports: string[] = ["model"];
    if (!hasSuper) {
        mobxImports.push("MobxModelElementImpl");
    }
    if (concept.implementedProperties().some(part => part.isList && !part.isPrimitive)) {
        mobxImports.push("observablelistpart");
    }
    if (concept.implementedProperties().some(part => !part.isList && !part.isPrimitive)) {
        mobxImports.push("observablepart");
    }
    return mobxImports;
}

export function makeImportStatements(hasSuper: boolean, needsObservable: boolean, importsFromCore: string[], modelImports: string[]): string {
    return `
            ${!hasSuper ? `import * as uuid from "uuid";` : ``}
            ${needsObservable ? `import { observable } from "mobx";` : ""}            
            import { ${importsFromCore.join(",")} } from "${PROJECTITCORE}";
            import { ${modelImports.join(", ")} } from "./internal";
            `;
}

export function makeBasicProperties(metaType: string, conceptName: string, hasSuper: boolean): string {
    return `readonly $typename: ${metaType} = "${conceptName}";    // holds the metatype in the form of a string
                ${!hasSuper ? "$id: string;     // a unique identifier" : ""}    `;
}

export function makePrimitiveProperty(property: PiPrimitiveProperty): string {
    const comment = "// implementation of " + property.name;
    // const decorator = property.isList ? "@observablelistpart" : "@observable";
    const decorator = "@observable";
    const arrayType = property.isList ? "[]" : "";
    let initializer = "";
    if (!property.isList) {
        switch (property.primType) {
            case "string": {
                initializer = `= \"${property.initialValue ? property.initialValue : ``}\"`;
                break;
            }
            case "number": {
                initializer = `= ${property.initialValue ? property.initialValue : `0`}`;
                break;
            }
            case "boolean": {
                initializer = `= ${property.initialValue ? property.initialValue : `false`}`;
                break;
            }
        }
    } else {
        if (!!property.initialValueList) {
            if (property.primType === "string") {
                initializer = `= [${property.initialValueList.map(elem => `\"${elem}\"`).join(", ")}]`;
            } else {
                initializer = `= [${property.initialValueList}]`;
            }
        }
    }
    return `${decorator} ${property.name} : ${property.primType}${arrayType} ${initializer}; \t${comment}`;
}

export function makePartProperty(property: PiConceptProperty): string {
    const comment = "// implementation of " + property.name;
    const decorator = property.isList ? "@observablelistpart" : "@observablepart";
    const arrayType = property.isList ? "[]" : "";
    const initializer = "";
    return `${decorator} ${property.name} : ${Names.classifier(property.type.referred)}${arrayType} ${initializer}; ${comment}`;
}

export function makeReferenceProperty(property: PiConceptProperty): string {
    const comment = "// implementation of " + property.name;
    const decorator = property.isList ? "@observablelistpart" : "@observablepart";
    const arrayType = property.isList ? "[]" : "";
    return `${decorator} ${property.name} : PiElementReference<${Names.classifier(property.type.referred)}>${arrayType}; ${comment}`;
}

export function makeBasicMethods(hasSuper: boolean, metaType: string, isModel: boolean, isUnit: boolean, isExpression: boolean, isBinaryExpression): string {
    return `constructor(id?: string) {
                    ${!hasSuper ? `
                        super();
                        if (!!id) { 
                            this.$id = id;
                        } else {
                            this.$id = uuid.v4();
                        }`
        : "super(id);"
    }                   
                }
                                
                /**
                 * Returns the metatype of this instance in the form of a string.
                 */               
                piLanguageConcept(): ${metaType} {
                    return this.$typename;
                }

                ${!hasSuper ? `
                /**
                 * Returns the unique identifier of this instance.
                 */                
                 piId(): string {
                    return this.$id;
                }`
        : ""}
                
                /**
                 * Returns true if this instance is a model concept.
                 */                 
                piIsModel(): boolean {
                    return ${isModel};
                }
                
                /**
                 * Returns true if this instance is a model unit.
                 */                 
                piIsUnit(): boolean {
                    return ${isUnit};
                }
                                
                /**
                 * Returns true if this instance is an expression concept.
                 */                 
                piIsExpression(): boolean {
                    return ${isExpression};
                }

                /**
                 * Returns true if this instance is a binary expression concept.
                 */                 
                piIsBinaryExpression(): boolean {
                    return ${isBinaryExpression};
                }`;
}
