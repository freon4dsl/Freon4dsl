import { Names } from "../../../utils/Names";
import { PathProvider, PROJECTITCORE } from "../../../utils/PathProvider";
import {
    PiConceptProperty,
    PiPrimitiveProperty,
    PiBinaryExpressionConcept,
    PiExpressionConcept, PiConcept, PiLimitedConcept, PiProperty, PiInstance, PiPropertyInstance
} from "../../metalanguage/PiLanguage";

export class ModelunitTemplate {
    constructor() {
    }

    generateModelUnit(concept: PiConcept, relativePath: string): string {
        let publicConcepts = Array.from(
            new Set(
                concept.parts().map(p => ((p.isPublic)? p.type.referred : null) )
                    .concat(concept.references().map(r => (r.isPublic? r.type.referred : null)))
                    .filter(type => !(type instanceof PiConcept))
            )
        );
        publicConcepts.push(concept);
        let result: string = publicConcepts.map(concept =>
            `${this.generatePublicConcept(concept)}`
        ).join("\n\n");
        // const publicConcepts = Array.from(
        //     new Set(
        //         concept.parts().map(p => ( p.type.referred ))
        //             .concat(concept.references().map(r => r.type.referred ))
        //         // .filter(type => !(type instanceof PiConcept))
        //     )
        // );
        // let result: string = publicConcepts.map(concept =>
        //     `I${Names.concept(concept)}`
        // ).join("\n\n");
        return result;
    }

    private generatePublicConcept(concept: PiConcept) {
        const language = concept.language;
        const hasSuper = !!concept.base;
        const extendsClass = hasSuper ? Names.concept(concept.base.referred) : "";
        const hasName = concept.implementedPrimProperties().some(p => p.name === "name");
        const isAbstract = concept.isAbstract;
        const baseExpressionName = Names.concept(concept.language.findExpressionBase());
        const isBinaryExpression = concept instanceof PiBinaryExpressionConcept;
        const isExpression = (!isBinaryExpression) && concept instanceof PiExpressionConcept;
        const abstract = (concept.isAbstract ? "abstract" : "");
        const implementsPi = (isExpression ? "PiExpression" : (isBinaryExpression ? "PiBinaryExpression" : (hasName ? "PiNamedElement" : "PiElement")));
        const intfaces = Array.from(
            new Set(
                concept.interfaces.map(i => Names.interface(i.referred))
            )
        );

        const binExpConcept: PiBinaryExpressionConcept = isBinaryExpression ? concept as PiBinaryExpressionConcept : null;

        const imports = Array.from(
            new Set(
                concept.parts().map(p => Names.classifier(p.type.referred))
                    .concat(concept.references().map(r => Names.classifier(r.type.referred)))
                    .concat(concept.interfaces.map(i => Names.interface(i.referred)))
                    .concat([baseExpressionName])
                    .concat(concept.allParts().map(part => part.type.name))
                    .concat(concept.allReferences().map(part => part.type.name))
                    .filter(name => !(name === Names.concept(concept)))
                    .concat((concept.base ? Names.concept(concept.base.referred) : null))
                    .filter(r => r !== null)
            )
        );

        // Template starts here
        const result = `
            import { ${Names.PiElement}, ${Names.PiNamedElement}, ${Names.PiExpression}, ${Names.PiBinaryExpression} } from "${PROJECTITCORE}";
            import { ${Names.metaType(language)} } from "./${Names.metaType(language)}";
            import { ${Names.PiElementReference} } from "./${Names.PiElementReference}";
            ${imports.length > 0 ? imports.map(imp => `import { ${imp} } from "./${imp}";`).join("") : ``}

            /**
             * Interface I${Names.concept(concept)} represents the public aspects of the concept with the same name in the language definition file.
             */            
            export interface I${Names.concept(concept)} ${hasSuper? `extends ${extendsClass}` : ``} implements ${implementsPi}${intfaces.map(imp => `, ${imp}`).join("")}
            {
                ${concept.implementedPrimProperties().map(p => this.generatePrimitiveProperty(p)).join("\n")}
                ${concept.implementedParts().map(p => this.generatePartProperty(p)).join("\n")}
                ${concept.implementedReferences().map(p => this.generateReferenceProperty(p)).join("\n")}                                 
            
                /**
                 * Returns the metatype of this instance in the form of a string.
                 */               
                piLanguageConcept(): ${Names.metaType(language)};

            }`;
        return result;
    }

    private generatePrimitiveProperty(property: PiPrimitiveProperty): string {
        if (property.isPublic) {
            const comment = "// implementation of " + property.name;
            const arrayType = property.isList ? "[]" : "";
            return `${property.name} : ${property.primType}${arrayType}; \t${comment}`;
        } else {
            return "";
        }
    }

    private generatePartProperty(property: PiConceptProperty): string {
        if (property.isPublic) {
            const comment = "// implementation of " + property.name;
            const arrayType = property.isList ? "[]" : "";
            return `${property.name} : I${Names.classifier(property.type.referred)}${arrayType}; ${comment}`;
        } else {
            return "";
        }
    }

    private generateReferenceProperty(property: PiConceptProperty): string {
        if (property.isPublic) {
            const comment = "// implementation of " + property.name;
            const arrayType = property.isList ? "[]" : "";
            return `${property.name} : PiElementReference<I${Names.classifier(property.type.referred)}>${arrayType}; ${comment}`;
        } else {
            return "";
        }
    }
}
