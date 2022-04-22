import { Names, PROJECTITCORE, LANGUAGE_GEN_FOLDER } from "../../../utils";
import {
    PiLanguage,
    PiBinaryExpressionConcept,
    PiClassifier, PiProperty, PiPrimitiveType
} from "../../../languagedef/metalanguage";
import { Roles } from "../../../utils";
import {
    PiEditProjection,
    PiEditUnit,
    PiOptionalPropertyProjection
} from "../../metalanguage";

export class DefaultActionsTemplate {

    generate(language: PiLanguage, editorDef: PiEditUnit, relativePath: string): string {
        const modelImports: string[] = language.conceptsAndInterfaces().map(c => `${Names.classifier(c)}`)
            .concat(language.units.map(u => `${Names.classifier(u)}`));
        return `
            import * as Keys from "${PROJECTITCORE}";
            import {
                AFTER_BINARY_OPERATOR,
                BEFORE_BINARY_OPERATOR,
                Box,
                MetaKey,
                PiActions,
                PiCreateBinaryExpressionAction,
                PiCaret,
                PiCustomAction,
                PiEditor,
                PiElement,
                PiBinaryExpression,
                PiKey,
                PiLogger,
                PiTriggerType,
                PiUtils,
                AliasBox,
                OptionalBox,
                LEFT_MOST,
                RIGHT_MOST
            } from "${PROJECTITCORE}";
            
            import { PiElementReference, ${modelImports.join(", ") } } from "${relativePath}${LANGUAGE_GEN_FOLDER }";

             /**
             * This module implements the actions available to the user in the editor.
             * These are the default actions. They are merged with the default and 
             * custom editor parts in a three-way manner. For each modelelement, 
             * (1) if a custom build creator/behavior is present, this is used,
             * (2) if a creator/behavior based on the editor definition is present, this is used,
             * (3) if neither (1) nor (2) yields a result, the default is used.  
             */  
            export const BINARY_EXPRESSION_CREATORS: PiCreateBinaryExpressionAction[] = [
                ${language.concepts.filter(c => (c instanceof PiBinaryExpressionConcept) && !c.isAbstract).map(c =>
            `PiCreateBinaryExpressionAction.create({
                    trigger: "${editorDef.findExtrasForType(c).symbol}",
                    activeInBoxRoles: [
                        LEFT_MOST,
                        RIGHT_MOST,
                        BEFORE_BINARY_OPERATOR,
                        AFTER_BINARY_OPERATOR
                    ],
                    expressionBuilder: (box: Box, trigger: PiTriggerType, editor: PiEditor) => {
                        const parent = box.element;
                        const newExpression = new ${Names.concept(c)}();
                        parent[(box as AliasBox).propertyName] = newExpression;
                        return newExpression;
                    }
            })`
        )}
            ];
            
            export const CUSTOM_ACTIONS: PiCustomAction[] = [
                ${this.customActionsForOptional(language, editorDef)}
                ${this.customActionForParts(language, editorDef)}
                ${this.customActionForReferences(language, editorDef)}
            ];
            `;
        }

    customActionsForOptional(language: PiLanguage, editorDef: PiEditUnit): string {
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
                            const prop: PiProperty = item.property.referred;
                            const optionalPropertyName = prop.name;
                            // end change
                            let rolename: string = "unknown role";
                            if(prop.isPart) {
                                // TODO Check for lists (everywhere)
                                rolename = Roles.propertyRole(myClassifier.name, optionalPropertyName);
                            } else if (prop.isPrimitive) {
                                if( prop.type === PiPrimitiveType.number) {
                                    rolename = Roles.propertyRole(myClassifier.name, optionalPropertyName, "numberbox")
                                } else if( prop.type === PiPrimitiveType.string) {
                                    rolename = Roles.propertyRole(myClassifier.name, optionalPropertyName, "textbox")
                                } else if( prop.type === PiPrimitiveType.boolean) {
                                    rolename = Roles.propertyRole(myClassifier.name, optionalPropertyName, "booleanbox")
                                }
                            } else {
                                // reference
                                rolename = Roles.propertyRole(myClassifier.name, optionalPropertyName, "referencebox" );
                            }
                            result += `PiCustomAction.create(
                                    {
                                        trigger: "${firstLiteral === "" ? optionalPropertyName : firstLiteral}",
                                        activeInBoxRoles: ["optional-${optionalPropertyName}"],
                                        action: (box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
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

    customActionForReferences(language: PiLanguage, editorDef: PiEditUnit): string {
        let result = "";
        const allClassifiers: PiClassifier[] = [];
        allClassifiers.push(...language.units);
        allClassifiers.push(...language.concepts);
        allClassifiers.forEach(concept => concept.allReferences().filter(ref => ref.isList).forEach(reference => {
                const referredConcept = reference.type;
                const extras = editorDef.findExtrasForType(referredConcept);
                const trigger = (!!extras && !!extras.trigger) ? extras.trigger : reference.name;
                result += `PiCustomAction.create(
                {   // Action to insert new reference to a concept
                    activeInBoxRoles: ["${Roles.newConceptReferencePart(reference)}"],
                    trigger: "${trigger}",
                    action: (box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
                        const parent: ${Names.classifier(concept)} = box.element as ${Names.classifier(concept)};
                        const newBase: PiElementReference<${Names.classifier(referredConcept)}> = PiElementReference.create<${Names.classifier(referredConcept)}>("", null);
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

    customActionForParts(language: PiLanguage, editorDef: PiEditUnit): string {
        let result = "";
        // Nothing to do for the moment
        return result;
    }
}
