import { Imports, Names } from "../../../utils/on-lang/index.js"
import {
    FreMetaPrimitiveProperty,
    FreMetaBinaryExpressionConcept,
    FreMetaExpressionConcept,
    FreMetaConcept,
    FreMetaLimitedConcept,
    FreMetaProperty,
    FreMetaInstanceProperty,
    FreMetaClassifier,
    FreMetaPrimitiveType,
    LangUtil,
} from "../../metalanguage/index.js";
import { ClassifierUtil } from "./ClassifierUtil.js";
import { ConceptUtils } from "./ConceptUtils.js"

export class ConceptTemplate {
    generateConcept(concept: FreMetaConcept): string {
        if (concept instanceof FreMetaLimitedConcept) {
            return this.generateLimited(concept);
        } else if (concept instanceof FreMetaBinaryExpressionConcept) {
            return this.generateBinaryExpression(concept);
        } else {
            return this.generateConceptPrivate(concept);
        }
    }

    private generateConceptPrivate(concept: FreMetaConcept): string {
        // const language = concept.language;
        const myName: string = Names.concept(concept);
        const hasSuper: boolean = !!concept.base;
        const hasReferences: boolean = concept.implementedReferences().length > 0;
        const extendsClass: string = hasSuper ? Names.concept(concept.base.referred) : "MobxModelElementImpl";
        const isAbstract: boolean = concept.isAbstract;
        const isExpression: boolean =
            concept instanceof FreMetaBinaryExpressionConcept || concept instanceof FreMetaExpressionConcept;
        const abstract: string = concept.isAbstract ? "abstract" : "";
        const hasName: boolean = concept.implementedPrimProperties().some((p) => p.name === "name");
        const implementsFre: string = isExpression ? Names.FreExpressionNode : hasName ? Names.FreNamedNode : Names.FreNode;
        const imports = new Imports()
        imports.core = ClassifierUtil.findMobxImportsForConcept(hasSuper, concept)
            .add(implementsFre)
            .add(Names.FreParseLocation).add(Names.notNullOrUndefined)
        if (hasReferences) {
            imports.core.add(Names.FreNodeReference)
        }
        if (concept.allProperties().length > 0) {
            imports.core.add("notNullOrUndefined")
        }
        imports.language = this.findModelImports(concept, myName);

        const metaType: string = Names.metaType();
        const interfaces: string[] = Array.from(new Set(concept.interfaces.map((i) => Names.interface(i.referred))));

        // Template starts here. Note that the imports are gathered during the generation, and added later.
        const result: string = `
            // TEMPLATE: ConceptTemplate.generateConceptPrivate
            ${hasSuper? "": 'import { makeObservable, action } from "mobx"'}

            /**
             * Class ${myName} is the implementation of the concept with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react
             * to the changes in the state of its properties.
             */
            export ${abstract} class ${myName} extends ${extendsClass} implements ${implementsFre}${interfaces.map((imp) => `, ${imp}`).join("")}
            {
                ${!isAbstract ? `${ConceptUtils.makeStaticCreateMethod(concept, myName)}` : ""}

                ${ConceptUtils.makeBasicProperties(metaType, myName, hasSuper)}
                ${concept
                    .implementedPrimProperties()
                    .map((p) => ConceptUtils.makePrimitiveProperty(p))
                    .join("\n")}
                ${concept
                    .implementedParts()
                    .map((p) => ConceptUtils.makePartProperty(p))
                    .join("\n")}
                ${concept
                    .implementedReferences()
                    .map((p) => ConceptUtils.makeReferenceProperty(p))
                    .join("\n")}

                ${ConceptUtils.makeConstructor(hasSuper, concept.implementedProperties(), imports)}
                ${ConceptUtils.makeBasicMethods(hasSuper, metaType, false, false, isExpression, false)}
                ${ConceptUtils.makeCopyMethod(concept, myName, concept.isAbstract)}
                ${ConceptUtils.makeMatchMethod(hasSuper, concept, myName, imports)}
                ${ConceptUtils.makeConvenienceMethods(concept.references())}
            }
        `;

        return `
            // TEMPLATE ConceptTemplate.generateConceptPrivate(...)
            ${imports.makeImports(concept.language)}

            ${result}`;
    }

    private generateBinaryExpression(concept: FreMetaBinaryExpressionConcept) {
        const myName = Names.concept(concept);
        const hasSuper = !!concept.base;
        const extendsClass = hasSuper ? Names.concept(concept.base.referred) : "MobxModelElementImpl";
        const isAbstract = concept.isAbstract;
        const baseExpressionName = Names.concept(LangUtil.findExpressionBase(concept));
        const abstract = concept.isAbstract ? "abstract" : "";
        const imports = new Imports()
        imports.core = ClassifierUtil.findMobxImportsForConcept(hasSuper, concept)
                .add(Names.FreBinaryExpression)
                .add(Names.FreParseLocation)
								.add(Names.notNullOrUndefined)
        imports.language = this.findModelImports(concept, myName).add(baseExpressionName);
        const metaType = Names.metaType();
        const intfaces = Array.from(new Set(concept.interfaces.map((i) => Names.interface(i.referred))));

        // Template starts here. Note that the imports are gathered during the generation, and added later.
        const result: string = `
            // TEMPLATE: ConceptTemplate.generateBinaryExpression
            ${hasSuper? "": 'import { makeObservable, action } from "mobx"'}
            
            /**
             * Class ${myName} is the implementation of the binary expression concept with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react
             * to any changes in the state of its properties.
             */
            export ${abstract} class ${myName} extends ${extendsClass} implements ${Names.FreBinaryExpression}${intfaces.map((imp) => `, ${imp}`).join("")} {
                ${!isAbstract ? `${ConceptUtils.makeStaticCreateMethod(concept, myName)}` : ""}

                ${ConceptUtils.makeBasicProperties(metaType, myName, hasSuper)}
                ${concept
                    .implementedPrimProperties()
                    .map((p) => ConceptUtils.makePrimitiveProperty(p))
                    .join("\n")}
                ${concept
                    .implementedParts()
                    .map((p) => ConceptUtils.makePartProperty(p))
                    .join("\n")}
                ${concept
                    .implementedReferences()
                    .map((p) => ConceptUtils.makeReferenceProperty(p))
                    .join("\n")}

                ${ConceptUtils.makeConstructor(hasSuper, concept.implementedProperties(), imports)}
                ${ConceptUtils.makeBasicMethods(hasSuper, metaType, false, false, true, true)}
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

        return `
            ${imports.makeImports(concept.language)}

            ${result}`;
    }

    // the following template is based on assumptions about a limited concept.
    // a limited does not have any non-prim properties
    // a limited does not have any references
    private generateLimited(concept: FreMetaLimitedConcept): string {
        const myName: string = Names.concept(concept);
        const hasSuper: boolean = !!concept.base;
        const extendsClass: string = hasSuper ? Names.concept(concept.base.referred) : "MobxModelElementImpl";
        const abstract: string = concept.isAbstract ? "abstract" : "";
        const imports = new Imports()
        imports.core = ClassifierUtil.findMobxImportsForConcept(hasSuper, concept)
            .add(Names.FreNamedNode)
            .add(Names.FreParseLocation)
            .add(Names.notNullOrUndefined)
        imports.language = this.findModelImports(concept, myName);
        const metaType: string = Names.metaType();
        const intfaces: string[] = Array.from(new Set(concept.interfaces.map((i) => Names.interface(i.referred))));

        // Template starts here. Note that the imports are gathered during the generation, and added later.
        const result: string = `
            // TEMPLATE: ConceptTemplate.generateLimited
            import { runInAction ${hasSuper ? "" : ", makeObservable, action"} } from "mobx"
            /**
             * Class ${myName} is the implementation of the limited concept with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react
             * to any changes in the state of its properties.
             */
            export ${abstract} class ${myName} extends ${extendsClass} implements ${Names.FreNamedNode}${intfaces.map((imp) => `, ${imp}`).join("")}
            {
                ${!concept.isAbstract ? `${ConceptUtils.makeStaticCreateMethod(concept, myName)}` : ""}

                ${concept.instances
            .map((predef) => `static ${predef.name}: ${myName};  // implementation of instance ${predef.name}`)
            .join("\n")}
                     static $freANY : ${myName};        // default predefined instance

                ${ConceptUtils.makeBasicProperties(metaType, myName, hasSuper)}
                ${concept
            .implementedPrimProperties()
            .map((p) => ConceptUtils.makePrimitiveProperty(p))
            .join("\n")}

                ${ConceptUtils.makeConstructor(hasSuper, concept.implementedProperties(), imports)}
                ${ConceptUtils.makeBasicMethods(hasSuper, metaType, false, false, false, false)}
                ${ConceptUtils.makeCopyMethod(concept, myName, concept.isAbstract)}
                ${ConceptUtils.makeMatchMethod(hasSuper, concept, myName, imports)}
            }

            // Because of mobx we need to generate the initialisations outside of the class,
            // otherwise the state of properties with primitive type will not be kept correctly.
            runInAction( () => {
                ${concept.instances
                .map(
                    (predef) =>
                        `${myName}.${predef.name} = ${myName}.create({
                                ${predef.props.map((prop) => `${prop.name}: ${this.createInstancePropValue(prop)}`).join(", ")}
                            });`,
                )
                .join(" ")}
            })`;
        return `
            ${imports.makeImports(concept.language)}

            ${result}`;
    }

    private findModelImports(concept: FreMetaConcept, myName: string): Set<string> {
        return new Set<string>(
                concept.interfaces
                    .map((i) => Names.interface(i.referred))
                    .concat(concept.base ? Names.concept(concept.base.referred) : "")
                    .concat(concept.implementedParts().map((part) => Names.classifier(part.type)))
                    .concat(concept.implementedReferences().map((part) => Names.classifier(part.type)))
                    // .concat(Names.metaType(concept.language))
                    .filter((name) => !(name === myName))
                    .filter((r) => r !== null && r.length > 0)
                    .concat(concept.allSingleNonOptionalPartsInitializers().map((pi) => Names.concept(pi.concept)))
            );
    }

    private createInstancePropValue(property: FreMetaInstanceProperty): string {
        const refProperty: FreMetaProperty = property.property?.referred;
        if (!!refProperty && refProperty instanceof FreMetaPrimitiveProperty) {
            // should always be the case
            const type: FreMetaClassifier = refProperty.type;
            if (refProperty.isList) {
                return `[ ${property.valueList
                    .map(
                        (value) =>
                            `${type === FreMetaPrimitiveType.string || type === FreMetaPrimitiveType.identifier ? `"${value}"` : `${value}`}`,
                    )
                    .join(", ")} ]`;
            } else {
                return `${type === FreMetaPrimitiveType.string || type === FreMetaPrimitiveType.identifier ? `"${property.value}"` : `${property.value}`}`;
            }
        }
        return ``;
    }
}
