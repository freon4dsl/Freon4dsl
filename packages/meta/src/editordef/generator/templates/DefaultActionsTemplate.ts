import { Names, PROJECTITCORE, LANGUAGE_GEN_FOLDER } from "../../../utils";
import {
    FreLanguage,
    FreBinaryExpressionConcept,
    FreClassifier, FreProperty, FrePrimitiveType
} from "../../../languagedef/metalanguage";
import { Roles } from "../../../utils";
import {
    PiEditProjection,
    PiEditUnit,
    PiOptionalPropertyProjection
} from "../../metalanguage";

export class DefaultActionsTemplate {

    generate(language: FreLanguage, editorDef: PiEditUnit, relativePath: string): string {
        const modelImports: string[] = language.conceptsAndInterfaces().map(c => `${Names.classifier(c)}`)
            .concat(language.units.map(u => `${Names.classifier(u)}`));
        return `
            import * as Keys from "${PROJECTITCORE}";
            import {
                AFTER_BINARY_OPERATOR,
                BEFORE_BINARY_OPERATOR,
                Box,
                MetaKey,
                ${Names.PiActions},
                ${Names.FreCreateBinaryExpressionAction},
                FreCaret,
                ${Names.FreCustomAction},
                ${Names.PiEditor},
                ${Names.PiElement},
                ${Names.PiBinaryExpression},
                FreKey,
                FreLogger,
                ${Names.FreTriggerType},
                ActionBox,
                OptionalBox,
                ${Names.PiElementReference},
                LEFT_MOST,
                RIGHT_MOST
            } from "${PROJECTITCORE}";
            
            import { ${modelImports.join(", ") } } from "${relativePath}${LANGUAGE_GEN_FOLDER }";

             /**
             * This module implements the actions available to the user in the editor.
             * These are the default actions. They are merged with the default and 
             * custom editor parts in a three-way manner. For each modelelement, 
             * (1) if a custom build creator/behavior is present, this is used,
             * (2) if a creator/behavior based on the editor definition is present, this is used,
             * (3) if neither (1) nor (2) yields a result, the default is used.  
             */  
            export const BINARY_EXPRESSION_CREATORS: ${Names.FreCreateBinaryExpressionAction}[] = [
                ${language.concepts.filter(c => (c instanceof FreBinaryExpressionConcept) && !c.isAbstract).map(c =>
            `${Names.FreCreateBinaryExpressionAction}.create({
                    trigger: "${editorDef.findExtrasForType(c).symbol}",
                    activeInBoxRoles: [
                        LEFT_MOST,
                        RIGHT_MOST,
                        BEFORE_BINARY_OPERATOR,
                        AFTER_BINARY_OPERATOR
                    ],
                    expressionBuilder: (box: Box, trigger: ${Names.FreTriggerType}, editor: ${Names.PiEditor}) => {
                        const parent = box.element;
                        const newExpression = new ${Names.concept(c)}();
                        parent[(box as ActionBox).propertyName] = newExpression;
                        return newExpression;
                    }
            })`
        )}
            ];
            
            export const CUSTOM_ACTIONS: ${Names.FreCustomAction}[] = [
                ${this.customActionsForOptional(language, editorDef)}
                ${this.customActionForParts(language, editorDef)}
                ${this.customActionForReferences(language, editorDef)}
            ];
            `;
        }

    customActionsForOptional(language: FreLanguage, editorDef: PiEditUnit): string {
        let result: string = "";
        editorDef.getDefaultProjectiongroup().projections.forEach( projection => {
            if (!!projection && projection instanceof PiEditProjection) {
                projection.lines.forEach(line => {
                    line.items.forEach(item => {
                        if (item instanceof PiOptionalPropertyProjection) {
                            const firstLiteral: string = item.firstLiteral();
                            const myClassifier = projection.classifier.referred;
                            // TODO check this change
                            // const propertyProjection: PiEditPropertyProjection = item.findPropertyProjection();
                            // const optionalPropertyName = (propertyProjection === undefined ? "UNKNOWN" : propertyProjection.property.name);
                            // console.log("Looking for [" + optionalPropertyName + "] in [" + myClassifier.name + "]")
                            // const prop: PiProperty = myClassifier.allProperties().find(prop => prop.name === optionalPropertyName);
                            const prop: FreProperty = item.property.referred;
                            const optionalPropertyName = prop.name;
                            // end change
                            let rolename: string = "unknown role";
                            if(prop.isPart) {
                                // TODO Check for lists (everywhere)
                                rolename = Roles.propertyRole(myClassifier.name, optionalPropertyName);
                            } else if (prop.isPrimitive) {
                                if( prop.type === FrePrimitiveType.number) {
                                    rolename = Roles.propertyRole(myClassifier.name, optionalPropertyName, "numberbox")
                                } else if( prop.type === FrePrimitiveType.string) {
                                    rolename = Roles.propertyRole(myClassifier.name, optionalPropertyName, "textbox")
                                } else if( prop.type === FrePrimitiveType.boolean) {
                                    rolename = Roles.propertyRole(myClassifier.name, optionalPropertyName, "booleanbox")
                                }
                            } else {
                                // reference
                                rolename = Roles.propertyRole(myClassifier.name, optionalPropertyName, "referencebox" );
                            }
                            result += `${Names.FreCustomAction}.create(
                                    {
                                        trigger: "${firstLiteral === "" ? optionalPropertyName : firstLiteral}",
                                        activeInBoxRoles: ["optional-${optionalPropertyName}"],
                                        action: (box: Box, trigger: ${Names.FreTriggerType}, ed: ${Names.PiEditor}): ${Names.PiElement} | null => {
                                            ((box.parent) as OptionalBox).mustShow = true;
                                            return box.element;
                                        },
                                        boxRoleToSelect: "${rolename}"
                                    })`;
                            result += ","
                        }
                    });
                });
            }
        });
        return result;
    }

    customActionForReferences(language: FreLanguage, editorDef: PiEditUnit): string {
        let result = "";
        const allClassifiers: FreClassifier[] = [];
        allClassifiers.push(...language.units);
        allClassifiers.push(...language.concepts);
        allClassifiers.forEach(concept => concept.allReferences().filter(ref => ref.isList).forEach(reference => {
                const referredConcept = reference.type;
                const extras = editorDef.findExtrasForType(referredConcept);
                const trigger = (!!extras && !!extras.trigger) ? extras.trigger : reference.name;
                result += `${Names.FreCustomAction}.create(
                {   // Action to insert new reference to a concept
                    activeInBoxRoles: ["${Roles.newConceptReferencePart(reference)}"],
                    trigger: "${trigger}",
                    action: (box: Box, trigger: ${Names.FreTriggerType}, ed: ${Names.PiEditor}): ${Names.PiElement} | null => {
                        const parent: ${Names.classifier(concept)} = box.element as ${Names.classifier(concept)};
                        const newBase: ${Names.PiElementReference}<${Names.classifier(referredConcept)}> = ${Names.PiElementReference}.create<${Names.classifier(referredConcept)}>("", null);
                        parent.${reference.name}.push(newBase);
                        return newBase.referred;
                    }
                })
                `;
                result += ",";
            })
        );
        return result;
    }

    customActionForParts(language: FreLanguage, editorDef: PiEditUnit): string {
        let result = "";
        // Nothing to do for the moment
        return result;
    }
}
