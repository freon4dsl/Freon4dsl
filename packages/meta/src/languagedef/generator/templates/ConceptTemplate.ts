import { Names } from "../../../utils/Names";
import { PathProvider, PROJECTITCORE } from "../../../utils/PathProvider";
import {
    PiConceptProperty,
    PiPrimitiveProperty,
    PiBinaryExpressionConcept,
    PiExpressionConcept, PiConcept, PiLimitedConcept
} from "../../metalanguage/PiLanguage";

export class ConceptTemplate {
    constructor() {
    }

    generateConcept(concept: PiConcept, relativePath: string): string {
        const language = concept.language;
        const hasSuper = !!concept.base;
        if(hasSuper && !(!!concept.base.referred)) console.log("ERROR in " + concept.name);
        const extendsClass = hasSuper ? Names.concept(concept.base.referred) : "MobxModelElementImpl";
        const hasName = concept.implementedPrimProperties().some(p => p.name === "name");
        const isAbstract = concept.isAbstract;
        // const hasSymbol = !!concept.symbol;
        const baseExpressionName = Names.concept(concept.language.findExpressionBase());
        const isBinaryExpression = concept instanceof PiBinaryExpressionConcept;
        const isExpression = (!isBinaryExpression) && concept instanceof PiExpressionConcept;
        const abstract = (concept.isAbstract ? "abstract" : "");
        const implementsPi = (isExpression ? "PiExpression" : (isBinaryExpression ? "PiBinaryExpression" : (hasName ? "PiNamedElement" : "PiElement")));
        const hasInterface = concept.interfaces.length > 0;
        const intfaces = Array.from(
            new Set(
                concept.interfaces.map(i => Names.interface(i.referred))
            )
        );

        const predefInstances = (concept instanceof PiLimitedConcept ? this.createInstances(concept) : ``);
        const extrasForLimitedConcept = (concept instanceof PiLimitedConcept ? this.createLimitedExtras(concept) : ``);

        const binExpConcept: PiBinaryExpressionConcept = isBinaryExpression ? concept as PiBinaryExpressionConcept : null;
        // const expConcept : PiExpressionConcept = isExpression ? concept as PiExpressionConcept : null;

        const imports = Array.from(
            new Set(
                concept.parts().map(p => Names.classifier(p.type.referred))
                    .concat(concept.references().map(r => Names.classifier(r.type.referred)))
                    .concat(concept.interfaces.map(i => Names.interface(i.referred)))
                    .concat(Names.concept(language.expressionPlaceHolder))
                    .concat([baseExpressionName])
                    .concat(concept.allParts().map(part => part.type.name))
                    .concat(concept.allReferences().map(part => part.type.name))
                    .filter(name => !(name === concept.name))
                    .concat((concept.base ? Names.concept(concept.base.referred) : null))
                    .filter(r => r !== null)
            )
        );

        const mobxImports: string[] = ["model"];
        if (!hasSuper) {
            mobxImports.push("MobxModelElementImpl");
        }
        if (concept.allParts().some(part => part.isList) || concept.references().some(part => part.isList)) {
            mobxImports.push("observablelistpart");
        }
        if (concept.parts().some(part => !part.isList)) {
            mobxImports.push("observablepart");
        }
        if (concept.references().some(ref => ref.isList)) {
            if (!mobxImports.some(im => im === "observablelistpart")) {
                mobxImports.push("observablelistpart");
            }
        }
        if (concept.references().some(ref => !ref.isList)) {
            if (!mobxImports.some(im => im === "observablepart")) {
                mobxImports.push("observablepart");
            }
        }
        // if (concept.enumProperties.some(ref => ref.isList)) {
        //     if (!mobxImports.some(im => im === "observablelistreference")) {
        //         mobxImports.push("observablelistreference");
        //     }
        // }
        // if (concept.enumProperties.some(ref => !ref.isList)) {
        //     if (!mobxImports.some(im => im === "observablereference")) {
        //         mobxImports.push("observablereference");
        //     }
        // }

        // Template starts here
        const result = `
            ${(concept.implementedPrimProperties().length > 0 ) ? `import { observable } from "mobx";` : ""}
            import * as uuid from "uuid";
            import { ${Names.PiElement}, ${Names.PiNamedElement}, ${Names.PiExpression}, ${Names.PiBinaryExpression} } from "${PROJECTITCORE}";
            import { ${mobxImports.join(",")} } from "${PROJECTITCORE}";
            import { ${Names.metaType(language)} } from "./${Names.metaType(language)}";
            import { ${Names.PiElementReference} } from "./${Names.PiElementReference}";
            ${imports.map(imp => `import { ${imp} } from "./${imp}";`).join("")}
            
            @model
            export ${abstract}  class ${Names.concept(concept)} extends ${extendsClass} implements ${implementsPi}${intfaces.map(imp => `, ${imp}`).join("")}
            {
                readonly $typename: ${language.name}ConceptType = "${concept.name}";
                ${!hasSuper ? "$id: string;" : ""}
                    
                constructor(id?: string) {
                    ${!hasSuper ? "super();" : "super(id);"}
                    ${!hasSuper ? `
                        if (!!id) { 
                            this.$id = id;
                        } else {
                            this.$id = uuid.v4();
                        }` : ""
        }
                    ${concept instanceof PiBinaryExpressionConcept ? `
                    this.left = new ${Names.concept(language.expressionPlaceHolder)};
                    this.right = new ${Names.concept(language.expressionPlaceHolder)};
                    ` : ""
        }
                }
                
                ${predefInstances}
                ${concept.implementedPrimProperties().map(p => this.generatePrimitiveProperty(p)).join("")}
                ${concept.implementedParts().map(p => this.generatePartProperty(p)).join("")}
                ${concept.implementedReferences().map(p => this.generateReferenceProperty(p)).join("")}

                ${extrasForLimitedConcept}
                
                piLanguageConcept(): ${language.name}ConceptType {
                    return this.$typename;
                }

                ${!concept.base ? `
                piId(): string {
                    return this.$id;
                }`
            : ""}
                
                piIsExpression(): boolean {
                    return ${isExpression || isBinaryExpression};
                }
                
                piIsBinaryExpression(): boolean {
                    return ${isBinaryExpression};
                }
                
                ${isExpression || isBinaryExpression ? `
                piIsExpressionPlaceHolder(): boolean {
                    return ${concept instanceof PiExpressionConcept && concept.isExpressionPlaceholder()};
                }`
            : ""}
                
                ${isBinaryExpression && binExpConcept != null ? `
                piPriority(): number {
                    return ${binExpConcept.getPriority() ? binExpConcept.getPriority() : "-1"};
                }
                
                public piLeft(): ${baseExpressionName} {
                    return this.left;
                }
                
                public piRight(): ${baseExpressionName} {
                    return this.right;
                }
                
                public piSetLeft(value: ${baseExpressionName}): void {
                    this.left = value;
                }
                
                public piSetRight(value: ${baseExpressionName}): void {
                    this.right = value;
                }
                `
            : ""}

                ${(hasName && !isAbstract) ? `
                static create(name: string): ${concept.name} {
                    const result = new ${concept.name}();
                    result.name = name;
                    return result;
                }`
            : ""}
                
            }`;
        return result;
    }

    generatePrimitiveProperty(property: PiPrimitiveProperty): string {
        return `
            @observable ${property.name}: ${property.primType} ${property.isList ? "[]" : ""};
        `;
    }

    // generateEnumerationProperty(property: PiLangEnumProperty): string {
    //     return `
    //         @observable ${property.name}: ${Names.enumeration((property.type.referred))} ${property.isList ? "[]" : `= ${Names.enumeration((property.type.referred))}.$piANY;`};
    //     `;
    // }

    generatePartProperty(property: PiConceptProperty): string {
        const decorator = property.isList ? "@observablelistpart" : "@observablepart";
        const arrayType = property.isList ? "[]" : "";
        const initializer = ((property.type.referred instanceof PiExpressionConcept) ? `= ${property.isList ? "[" : ""} new ${Names.concept(property.owningConcept.language.expressionPlaceHolder)} ${property.isList ? "]" : ""}` : "");
        return `
            ${decorator} ${property.name} : ${Names.classifier(property.type.referred)}${arrayType} ${initializer};
        `;
    }

    generateReferenceProperty(property: PiConceptProperty): string {
        const decorator = property.isList ? "@observablelistpart" : "@observablepart";
        const arrayType = property.isList ? "[]" : "";
        return `
            ${decorator} ${property.name} : PiElementReference<${Names.classifier(property.type.referred)}>${arrayType};
        `;
    }

    private createInstances(limitedConcept: PiLimitedConcept) {
        // TODO should take into account all properties that are set in the .lang file
        let conceptName = limitedConcept.name;
        return `${limitedConcept.instances.map(predef =>
                `static ${predef.name}: ${conceptName} = ${conceptName}.fromString("${predef.name}")` ).join(";")}
            static $piANY : ${conceptName} = ${conceptName}.fromString("$piANY");

           static values = [${limitedConcept.instances.map(l => `${conceptName}.${l.name}`).join(", ")}]`
    }

    private createLimitedExtras(limitedConcept: PiLimitedConcept): string {
        let conceptName = limitedConcept.name;
        return `
        public asString(): string {
                return this.name;
            }

            static fromString(v: string): ${conceptName} {
                switch(v) {
                    ${limitedConcept.instances.map(predef => `case "${predef.name}":
                    if (this.${predef.name} !== null) {
                        let predef = new ${conceptName}();                  
                        predef.name = "${predef.name}";
                        return predef;
                    } else {
                        return ${conceptName}.${predef.name};
                    }`
        ).join(";")}
                    default:
                    if (this.$piANY !== null) {
                        let predef = new ${conceptName}();                  
                        predef.name = "$piANY";
                        return predef;
                    } else {
                        return ${conceptName}.$piANY;
                    }
                }
        }`;
    }
}
