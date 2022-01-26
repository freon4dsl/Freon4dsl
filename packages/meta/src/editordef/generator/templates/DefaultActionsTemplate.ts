import { Names, PROJECTITCORE, LANGUAGE_GEN_FOLDER } from "../../../utils";
import {
    PiLanguage,
    PiBinaryExpressionConcept,
    PiConcept,
    PiClassifier, PiProperty, PiPrimitiveType
} from "../../../languagedef/metalanguage";
import { Roles, LangUtil } from "../../../utils";
import { PiEditConcept, PiEditPropertyProjection, PiEditSubProjection, PiEditUnit } from "../../metalanguage";

export class DefaultActionsTemplate {

    // TODO generate the correct class comment for DefaultActions
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
             * This module implements all default actions for the editor.
             * These default actions are merged with custom actions.
             */ 
            export const BINARY_EXPRESSION_CREATORS: PiCreateBinaryExpressionAction[] = [
                ${language.concepts.filter(c => (c instanceof PiBinaryExpressionConcept) && !c.isAbstract).map(c =>
            `PiCreateBinaryExpressionAction.create({
                    trigger: "${editorDef.findConceptEditor(c).symbol}",
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
        editorDef.conceptEditors.forEach( ce => {
            if (!!ce.projection) {
                ce.projection.lines.forEach(line => {
                    line.items.forEach(item => {
                        if (item instanceof PiEditSubProjection) {
                            if (item.optional) {
                                const firstLiteral: string = item.firstLiteral();
                                const propertyProjection: PiEditPropertyProjection = item.optionalProperty();
                                const optionalPropertyName = (propertyProjection === undefined ? "UNKNOWN" : propertyProjection.propertyName());
                                console.log("Looking for [" + optionalPropertyName + "] in [" + ce.concept.referred.name + "]")
                                const prop: PiProperty =ce.concept.referred.allProperties().find(prop => prop.name === optionalPropertyName);
                                let rolename: string = "unknown role";
                                if(prop.isPart) {
                                    // TODO Check for lists (everywhere)
                                    rolename = Roles.propertyRole(ce.concept.name, optionalPropertyName);
                                } else if (prop.isPrimitive) {
                                    if( prop.type.referred === PiPrimitiveType.number) {
                                        rolename = Roles.propertyRole(ce.concept.name, optionalPropertyName, "numberbox")
                                    } else if( prop.type.referred === PiPrimitiveType.string) {
                                        rolename = Roles.propertyRole(ce.concept.name, optionalPropertyName, "textbox")
                                    } else if( prop.type.referred === PiPrimitiveType.boolean) {
                                        rolename = Roles.propertyRole(ce.concept.name, optionalPropertyName, "booleanbox")
                                    }
                                } else {
                                    // reference
                                    rolename = Roles.propertyRole(ce.concept.name, optionalPropertyName, "referencebox" );
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
                const referredConcept = reference.type.referred;
                const conceptEditor = editorDef.findConceptEditor(referredConcept);
                const trigger = (!!conceptEditor && !!conceptEditor.trigger) ? conceptEditor.trigger : reference.name;
                result += `PiCustomAction.create(
                {   // Action to insert new reference to a concept
                    activeInBoxRoles: ["${Roles.newConceptReferencePart(reference)}"],
                    trigger: "${trigger}",
                    action: (box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
                        const parent: ${Names.classifier(concept)} = box.element as ${Names.classifier(concept)};
                        const newBase: PiElementReference<${Names.classifier(referredConcept)}> = PiElementReference.create<${Names.classifier(referredConcept)}>("", null);
                        parent.${reference.name}.push(newBase);
                        return newBase.referred;
                    },
                    boxRoleToSelect: "${this.cursorLocation(editorDef, concept)}"  /* CURSOR 1 */
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

    cursorLocation(editorDef: PiEditUnit, c: PiClassifier) {
        const projection = editorDef.findConceptEditor(c).projection;
        if (!!projection) {
            return projection.cursorLocation();
        } else {
            if (c instanceof PiBinaryExpressionConcept) {
                return Names.PI_BINARY_EXPRESSION_LEFT;
            }
        }
        return "===== " + c.name + " =====";
    }
}
