import { GenerationUtil, Names } from "../../../utils";
import {
    FrePrimitiveProperty,
    FreBinaryExpressionConcept,
    FreExpressionConcept,
    FreConcept,
    FreLimitedConcept,
    FreProperty,
    FreInstanceProperty,
    FreClassifier,
    FrePrimitiveType
} from "../../metalanguage";
import { ConceptUtils } from "./ConceptUtils";
import { ClassifierUtil } from "./ClassifierUtil";

export class ConceptTemplate {
    // TODO clean up imports in every generate method
    generateConcept(concept: FreConcept): string {
        if (concept instanceof FreLimitedConcept) {
            return this.generateLimited(concept);
        } else if (concept instanceof FreBinaryExpressionConcept) {
            return this.generateBinaryExpression(concept);
        } else {
            return this.generateConceptPrivate(concept);
        }
    }

    private generateConceptPrivate(concept: FreConcept): string {
        const language = concept.language;
        const myName = Names.concept(concept);
        const hasSuper = !!concept.base;
        const hasReferences = concept.implementedReferences().length > 0;
        const extendsClass = hasSuper ? Names.concept(concept.base.referred) : "MobxModelElementImpl";
        const isAbstract = concept.isAbstract;
        const isExpression = (concept instanceof FreBinaryExpressionConcept) || (concept instanceof FreExpressionConcept);
        const abstract = (concept.isAbstract ? "abstract" : "");
        const hasName = concept.implementedPrimProperties().some(p => p.name === "name");
        const implementsFre = (isExpression ? "FreExpressionNode" : (hasName ? "FreNamedNode" : "FreNode"));
        const needsObservable = concept.implementedPrimProperties().length > 0;
        const coreImports = ClassifierUtil.findMobxImportsForConcept(hasSuper, concept)
            .concat(implementsFre).concat(["FreUtils", "FreParseLocation", "matchElementList", "matchPrimitiveList", "matchReferenceList"]).concat(hasReferences ? (Names.FreNodeReference) : "");
        const metaType = Names.metaType(language);
        const modelImports = this.findModelImports(concept, myName, hasReferences);
        const intfaces = Array.from(
            new Set(
                concept.interfaces.map(i => Names.interface(i.referred))
            )
        );

        // Template starts here
        return `
            ${ConceptUtils.makeImportStatements(needsObservable, coreImports, modelImports)}

            /**
             * Class ${myName} is the implementation of the concept with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react 
             * to changes in the state of its properties.
             */
            export ${abstract} class ${myName} extends ${extendsClass} implements ${implementsFre}${intfaces.map(imp => `, ${imp}`).join("")}
            {
                ${(!isAbstract) ? `${ConceptUtils.makeStaticCreateMethod(concept, myName)}`
                : ""}
                            
                ${ConceptUtils.makeBasicProperties(metaType, myName, hasSuper)}
                ${concept.implementedPrimProperties().map(p => ConceptUtils.makePrimitiveProperty(p)).join("\n")}
                ${concept.implementedParts().map(p => ConceptUtils.makePartProperty(p)).join("\n")}
                ${concept.implementedReferences().map(p => ConceptUtils.makeReferenceProperty(p)).join("\n")}     
                              
                ${ConceptUtils.makeConstructor(hasSuper, concept.implementedProperties())}
                ${ConceptUtils.makeBasicMethods(hasSuper, metaType,false, false, isExpression, false)} 
                ${ConceptUtils.makeCopyMethod(concept, myName, concept.isAbstract)}
                ${ConceptUtils.makeMatchMethod(hasSuper, concept, myName)}    
                ${ConceptUtils.makeConvenienceMethods(concept.references())}                               
            }
        `;
    }

    // assumptions:
    // an expression is not a model
    private generateBinaryExpression(concept: FreBinaryExpressionConcept) {
        const language = concept.language;
        const myName = Names.concept(concept);
        const hasSuper = !!concept.base;
        const hasReferences = concept.implementedReferences().length > 0;
        const extendsClass = hasSuper ? Names.concept(concept.base.referred) : "MobxModelElementImpl";
        const isAbstract = concept.isAbstract;
        const baseExpressionName = Names.concept(GenerationUtil.findExpressionBase(concept));
        const abstract = concept.isAbstract ? "abstract" : "";
        const needsObservable = concept.implementedPrimProperties().length > 0;
        const coreImports = ClassifierUtil.findMobxImportsForConcept(hasSuper, concept).concat(["FreBinaryExpression", "FreParseLocation", "FreUtils"]);
        const metaType = Names.metaType(language);
        let modelImports = this.findModelImports(concept, myName, hasReferences);
        if (!modelImports.includes(baseExpressionName)) {
            modelImports = modelImports.concat(baseExpressionName);
        }
        const intfaces = Array.from(
            new Set(
                concept.interfaces.map(i => Names.interface(i.referred))
            )
        );

        // Template starts here
        return `
            ${ConceptUtils.makeImportStatements(needsObservable, coreImports, modelImports)}

            /**
             * Class ${myName} is the implementation of the binary expression concept with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react 
             * to changes in the state of its properties.
             */            
            export ${abstract} class ${myName} extends ${extendsClass} implements ${Names.FreBinaryExpression}${intfaces.map(imp => `, ${imp}`).join("")} {            
                ${(!isAbstract) ? `${ConceptUtils.makeStaticCreateMethod(concept, myName)}`
                : ""}
                            
                ${ConceptUtils.makeBasicProperties(metaType, myName, hasSuper)}
                ${concept.implementedPrimProperties().map(p => ConceptUtils.makePrimitiveProperty(p)).join("\n")}
                ${concept.implementedParts().map(p => ConceptUtils.makePartProperty(p)).join("\n")}
                ${concept.implementedReferences().map(p => ConceptUtils.makeReferenceProperty(p)).join("\n")}     
                              
                ${ConceptUtils.makeConstructor(hasSuper, concept.implementedProperties())}
                ${ConceptUtils.makeBasicMethods(hasSuper, metaType,false, false,true, true)}   
                ${ConceptUtils.makeCopyMethod(concept, myName, concept.isAbstract)}                
                
                /**
                 * Returns the priority of this expression instance.
                 * Used to balance the expression tree.
                 */ 
                frePriority(): number {
                    return ${concept.getPriority() ? concept.getPriority() : "-1"};
                }
                
                /**
                 * Returns the left element of this binary expression.
                 */ 
                public freLeft(): ${baseExpressionName} {
                    return this.left;
                }

                /**
                 * Returns the right element of this binary expression.
                 */                 
                public freRight(): ${baseExpressionName} {
                    return this.right;
                }

                /**
                 * Sets the left element of this binary expression.
                 */                 
                public freSetLeft(value: ${baseExpressionName}): void {
                    this.left = value;
                }

                /**
                 * Sets the right element of this binary expression.
                 */                 
                public freSetRight(value: ${baseExpressionName}): void {
                    this.right = value;
                }
            }
        `;
    }


// the folowing template is based on assumptions about a limited concept.
    // a limited does not have any non-prim properties
    // a limited does not have any references
    private generateLimited(concept: FreLimitedConcept): string {
        const language = concept.language;
        const myName = Names.concept(concept);
        const hasSuper = !!concept.base;
        const extendsClass = hasSuper ? Names.concept(concept.base.referred) : "MobxModelElementImpl";
        const abstract = (concept.isAbstract ? "abstract" : "");
        const needsObservable = concept.implementedPrimProperties().length > 0;
        const coreImports = ClassifierUtil.findMobxImportsForConcept(hasSuper, concept).concat([Names.FreNamedNode, Names.FreUtils, Names.FreParseLocation, "matchElementList", "matchPrimitiveList"]);
        const metaType = Names.metaType(language);
        const imports = this.findModelImports(concept, myName, false);
        const intfaces = Array.from(
            new Set(
                concept.interfaces.map(i => Names.interface(i.referred))
            )
        );

        // Template starts here
        return `
            ${ConceptUtils.makeImportStatements(needsObservable, coreImports, imports)}

            /**
             * Class ${myName} is the implementation of the limited concept with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react 
             * to changes in the state of its properties.
             */            
            export ${abstract} class ${myName} extends ${extendsClass} implements ${Names.FreNamedNode}${intfaces.map(imp => `, ${imp}`).join("")}
            {           
                ${(!concept.isAbstract) ? `${ConceptUtils.makeStaticCreateMethod(concept, myName)}`
                : ""}
             
                ${concept.instances.map(predef =>
                    `static ${predef.name}: ${myName};  // implementation of instance ${predef.name}`).join("\n")}
                     static $freANY : ${myName};        // default predefined instance
                            
                ${ConceptUtils.makeBasicProperties(metaType, myName, hasSuper)}
                ${concept.implementedPrimProperties().map(p => ConceptUtils.makePrimitiveProperty(p)).join("\n")}

                ${ConceptUtils.makeConstructor(hasSuper, concept.implementedProperties())}
                ${ConceptUtils.makeBasicMethods(hasSuper, metaType,false, false,false, false)}   
                ${ConceptUtils.makeCopyMethod(concept, myName, concept.isAbstract)}
                ${ConceptUtils.makeMatchMethod(hasSuper, concept, myName)}             
            }
                       
            // Because of mobx we need to generate the initialisations outside of the class,
            // otherwise the state of properties with primitive type will not be kept correctly. 
            ${concept.instances.map(predef =>
                `${myName}.${predef.name} = ${myName}.create({
                        ${predef.props.map(prop => `${prop.name}: ${this.createInstancePropValue(prop)}`).join(", ")}
                    });` ). join(" ")}`;
    }

    private findModelImports(concept: FreConcept, myName: string, hasReferences: boolean): string[] {
        return Array.from(
            new Set(
                concept.interfaces.map(i => Names.interface(i.referred))
                    .concat((concept.base ? Names.concept(concept.base.referred) : null))
                    .concat(concept.implementedParts().map(part => Names.classifier(part.type)))
                    .concat(concept.implementedReferences().map(part => Names.classifier(part.type)))
                    .concat(Names.metaType(concept.language))
                    .filter(name => !(name === myName))
                    .filter(r => (r !== null) && (r.length > 0))
            )
        );
    }

    private createInstancePropValue(property: FreInstanceProperty): string {
        const refProperty: FreProperty = property.property?.referred;
        if (!!refProperty && refProperty instanceof FrePrimitiveProperty) { // should always be the case
            const type: FreClassifier = refProperty.type;
            if (refProperty.isList) {
                return `[ ${property.valueList.map(value =>
                    `${(type === FrePrimitiveType.string || type === FrePrimitiveType.identifier) ? `"${value}"` : `${value}` }`
                ).join(", ")} ]`;
            } else {
                return `${(type === FrePrimitiveType.string || type === FrePrimitiveType.identifier) ? `"${property.value}"` : `${property.value}` }`;
            }
        }
        return ``;
    }
}
