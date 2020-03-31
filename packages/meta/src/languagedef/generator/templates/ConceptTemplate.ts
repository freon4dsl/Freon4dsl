import { Names } from "../../../utils/Names";
import { PathProvider } from "../../../utils/PathProvider";
import { PiLangConceptProperty, PiLangEnumProperty, PiLangPrimitiveProperty, PiLangBinaryExpressionConcept, PiLangExpressionConcept, PiLangClass } from "../../metalanguage/PiLanguage";

export class ConceptTemplate {
    constructor() {
    }

    generateConcept(concept: PiLangClass, relativePath: string): string {
        const language = concept.language;
        const hasSuper = !!concept.base;
        const extendsClass = hasSuper ? Names.concept(concept.base.referedElement()) : "MobxModelElementImpl";
        const hasName = concept.primProperties.some(p => p.name === "name");
        // const hasSymbol = !!concept.symbol;
        const baseExpressionName = Names.concept(concept.language.findExpressionBase());
        const isBinaryExpression = concept.binaryExpression();
        const isExpression = (!isBinaryExpression) && concept.expression() ;
        const abstract = (concept.isAbstract ? "abstract" : "");
        const implementsPi = (isExpression ? "PiExpression": (isBinaryExpression ? "PiBinaryExpression" : (hasName ? "PiNamedElement" : "PiElement")));

        const binExpConcept : PiLangBinaryExpressionConcept = isBinaryExpression ? concept as PiLangBinaryExpressionConcept : null;
        const expConcept : PiLangExpressionConcept = isExpression ? concept as PiLangExpressionConcept : null;

        const imports = Array.from(
            new Set(
                concept.parts.map(p => Names.concept(p.type.referedElement()))
                    .concat(concept.references.map(r => Names.concept(r.type.referedElement())))
                    .concat(language.enumerations.map(e => Names.enumeration(e)))
                    .concat(language.unions.map(e => Names.union(e)))
                    .concat(Names.concept(language.expressionPlaceholder()))
                    .concat([baseExpressionName])
                    .filter(name => !(name === concept.name))
                    // .concat(element.properties.map(p => p.type).filter(t => language.enumerations.some(e => e.name === t)))
                    .concat((concept.base ? Names.concept(concept.base.referedElement()) : null))
                    .filter(r => r !== null)
            )
        );

        const mobxImports: string[] = ["model"];
        // if( element.references.length > 0) {
        //     mobxImports.push("observable")
        // }
        if (!hasSuper) {
            mobxImports.push("MobxModelElementImpl");
        }
        if (concept.parts.some(part => part.isList)) {
            mobxImports.push("observablelistpart");
        }
        if (concept.parts.some(part => !part.isList)) {
            mobxImports.push("observablepart");
        }
        if (concept.references.some(ref => ref.isList)) {
            if( !mobxImports.some( im => im === "observablelistpart")) {
                mobxImports.push("observablelistpart");
            }
        }
        if (concept.references.some(ref => !ref.isList)) {
            if( !mobxImports.some( im => im === "observablepart")) {
                mobxImports.push("observablepart");
            }
        }

        // Template starts here
        const result = `
            ${(concept.primProperties.length > 0 || concept.enumProperties.length > 0)? `import { observable } from "mobx";` : ""}
            import * as uuid from "uuid";
            import { ${Names.PiElement}, ${Names.PiNamedElement}, ${Names.PiExpression}, ${Names.PiBinaryExpression} } from "${PathProvider.corePath}";
            import { ${mobxImports.join(",")} } from "${PathProvider.corePath}";
            import { ${Names.metaType(language)} } from "./${Names.metaType(language)}";
            import { ${Names.PiElementReference} } from "./${Names.PiElementReference}";
            ${imports.map(imp => `import { ${imp} } from "./${imp}";`).join("")}
            @model
            export ${abstract}  class ${Names.concept(concept)} extends ${extendsClass} implements ${implementsPi} 
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
                    ${concept.binaryExpression() ? `
                    this.left = new ${Names.concept(language.expressionPlaceholder())};
                    this.right = new ${Names.concept(language.expressionPlaceholder())};
                    `: ""
                    }
                }
                
                ${concept.primProperties.map(p => this.generatePrimitiveProperty(p)).join("")}
                ${concept.enumProperties.map(p => this.generateEnumerationProperty(p)).join("")}
                ${concept.parts.map(p => this.generatePartProperty(p)).join("")}
                ${concept.references.map(p => this.generateReferenceProperty(p)).join("")}

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
                
                ${ isExpression || isBinaryExpression ? `
                piIsExpressionPlaceHolder(): boolean {
                    return ${concept.isExpressionPlaceholder()};
                }`
                : ""}
                
                ${ isBinaryExpression && binExpConcept != null ? `
                public piSymbol(): string {
                    return "${binExpConcept.symbol}";
                }
                
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

                ${hasName ? `
                static create(name: string): ${concept.name} {
                    const result = new ${concept.name}();
                    result.name = name;
                    return result;
                }`
            : ""}
                
            }`;
        return result;
    }

    generatePrimitiveProperty(property: PiLangPrimitiveProperty): string {
        return `
            @observable ${property.name}: ${property.primType} ${property.isList ? "[]" : ""};
        `;
    }

    generateEnumerationProperty(property: PiLangEnumProperty): string {
        return `
            @observable ${property.name}: ${Names.enumeration((property.type.referedElement()))} ${property.isList ? "[]" : `= ${Names.enumeration((property.type.referedElement()))}.$piANY;`};
        `;
    }

    generatePartProperty(property: PiLangConceptProperty): string {
        const decorator = property.isList ? "@observablelistpart" : "@observablepart";
        const arrayType = property.isList ? "[]" : "";
        const initializer = ((property.type.referedElement() instanceof PiLangExpressionConcept) ? `= ${property.isList ? "[" : ""} new ${Names.concept(property.owningConcept.language.expressionPlaceholder())} ${property.isList ? "]" : ""}` : "");
        return `
            ${decorator} ${property.name} : ${Names.concept(property.type.referedElement())}${arrayType} ${initializer};
        `;
    }

    generateReferenceProperty(property: PiLangConceptProperty): string {
        const decorator = property.isList ? "@observablepartreference" : "@observablepart";
        const arrayType = property.isList ? "[]" : "";
        return `
            ${decorator} ${property.name} : PiElementReference<${Names.concept(property.type.referedElement())}>${arrayType};
        `;
    }

}
