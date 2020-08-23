import { flatten } from "lodash";
import { Names, PROJECTITCORE, LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiLanguage, PiBinaryExpressionConcept, PiExpressionConcept, PiConcept, PiLangUtil, PiClassifier } from "../../../languagedef/metalanguage";
import { Roles } from "../../../utils/Roles";
import { PiEditUnit } from "../../metalanguage";

export class DefaultActionsTemplate {

    // TODO generate the correct class comment for DefaultActions
    generate(language: PiLanguage, editorDef: PiEditUnit, relativePath: string): string {
        return `
            import * as Keys from "${PROJECTITCORE}";
            import {
                AFTER_BINARY_OPERATOR,
                BEFORE_BINARY_OPERATOR,
                Box,
                KeyboardShortcutBehavior,
                MetaKey,
                PiActions,
                PiBinaryExpressionCreator,
                PiCaret,
                PiCustomBehavior,
                PiEditor,
                PiElement,
                PiExpressionCreator,
                PiBinaryExpression,
                PiKey,
                PiLogger,
                PiTriggerType,
                PiUtils,
                AliasBox,
                LEFT_MOST,
                RIGHT_MOST
            } from "${PROJECTITCORE}";
            
            import { PiElementReference, ${language.concepts.map(c => `${Names.concept(c)}`).join(", ") } } from "${relativePath}${LANGUAGE_GEN_FOLDER }";

             /**
             * This module implements ... TODO.
             * These custom build additions are merged with the default and definition-based editor parts 
             * in a three-way manner. For each modelelement, 
             * (1) if a custom build creator/behavior is present, this is used,
             * (2) if a creator/behavior based on the editor definition is present, this is used,
             * (3) if neither (1) nor (2) yields a result, the default is used.  
             */ 
            export const EXPRESSION_CREATORS: PiExpressionCreator[] = [
                ${language.concepts.filter(c => c instanceof PiExpressionConcept && !(c instanceof PiBinaryExpressionConcept) && !c.isAbstract).map(c =>
            `{
                    trigger: ${c.triggerIsRegExp ? `/${editorDef.findConceptEditor(c).trigger}/` : `"${editorDef.findConceptEditor(c).trigger}"`},
                    activeInBoxRoles: [
                        "PiBinaryExpression-left", "PiBinaryExpression-right"
                    ],
                    expressionBuilder: (box: Box, trigger: PiTriggerType, editor: PiEditor) => {
                        const parent = box.element;
                        const newExpression = new ${Names.concept(c)}();
                        parent[(box as AliasBox).propertyName] = newExpression;
                        return newExpression;
                    },
                    boxRoleToSelect: "${editorDef.findConceptEditor(c).projection.cursorLocation()}" /* CURSOR  0 */
            }`
        )}
            ];

            export const BINARY_EXPRESSION_CREATORS: PiBinaryExpressionCreator[] = [
                ${language.concepts.filter(c => (c instanceof PiBinaryExpressionConcept) && !c.isAbstract).map(c =>
            `{
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
            }`
        )}
            ];
            
            export const CUSTOM_BEHAVIORS: PiCustomBehavior[] = [
                ${this.customActionForParts(language, editorDef)}
            ];
            
            export const KEYBOARD: KeyboardShortcutBehavior[] = [
                ${flatten(language.concepts.map(c => c.allParts())).filter(p => p.isList).map(part => {
                    const parentConcept = part.owningConcept;
                    const partConcept = part.type.referred;
                    // TODO add keyboard shortcut
                    return `
                    // {
                    //     activeInBoxRoles: ["new-${part.name}"],
                    //     trigger: { meta: MetaKey.None, keyCode: Keys.ENTER},
                    //     action: (box: Box, trigger: PiTriggerType, ed: PiEditor): Promise< PiElement> => {
                    //         var parent: ${Names.classifier(parentConcept)} = box.element as ${Names.classifier(parentConcept)};
                    //         const new${part.name}: ${Names.classifier(partConcept)} = new ${Names.classifier(partConcept)}();
                    //         parent.${part.name}.push(new${part.name});
                    //         return Promise.resolve(new${part.name});
                    //     },
                    //     boxRoleToSelect: "${part.name}-name"
                    // }`;
                 }).join(",")}
            ];
            `;
        }

    customActionForReferences(language: PiLanguage, editorDef: PiEditUnit): string {
        let result = "";
        language.concepts.forEach(concept => concept.allReferences().filter(ref => ref.isList).forEach(reference => {
                const referredConcept = reference.type.referred;
                const conceptEditor = editorDef.findConceptEditor(referredConcept);
                const trigger = !!conceptEditor.trigger ? conceptEditor.trigger : reference.name;
                result += `
                {
                    activeInBoxRoles: ["${Roles.newPart(reference)}"],
                    trigger: "${trigger}",
                    action: (box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
                        const parent: ${Names.classifier(concept)} = box.element as ${Names.classifier(concept)};
                        const newBase: PiElementReference< ${Names.classifier(referredConcept)}> = PiElementReference.createNamed("", null);
                        parent.${reference.name}.push(newBase);
                        return newBase;
                    },
                    boxRoleToSelect: "${this.cursorLocation(editorDef, concept)}"  /* CURSOR 1 */
                }
                `;
                result += ",";
            })
        );
        return result;
    }

    customActionForParts(language: PiLanguage, editorDef: PiEditUnit): string {
        let result = "";
        const behaviorMap = new ActionMap();
        let behaviorDescriptor: BehaviorDescription[] = [];
        // All listy properties
        language.concepts.forEach(concept => concept.allParts().filter(ref => ref.isList).forEach(part => {
            const childConcept = part.type.referred;
            // const trigger = !!conceptEditor.trigger ? conceptEditor.trigger : part.unitName
            result += `${PiLangUtil.subConceptsIncludingSelf(childConcept).filter(cls => !cls.isAbstract).map(subClass => `
                    {
                        activeInBoxRoles: ["${Roles.newConceptPart(concept, part)}"],
                        trigger: "${editorDef.findConceptEditor(subClass).trigger}",  // for Concept part
                        action: (box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
                            const parent = box.element;
                            const newExpression = new ${Names.concept(subClass)}();
                            parent[(box as AliasBox).propertyName].push(newExpression);
                            return newExpression;
                        },
                        boxRoleToSelect: "${this.cursorLocation(editorDef, subClass)}" /* CURSOR 2 */
                    },`).join("\n")}
                    `;
            })
        );
        // All NON listy properties
        language.concepts.forEach(concept => concept.allParts().filter(ref => !ref.isList).forEach(part => {
                const childClassifier = part.type.referred;
                if (childClassifier instanceof PiConcept) {
                    PiLangUtil.subConceptsIncludingSelf(childClassifier).filter(cls => !cls.isAbstract).forEach(subClass => {
                        behaviorMap.createOrAdd(subClass,
                            {
                                    activeInBoxRoles: [`${Roles.newConceptPart(concept, part)}`],
                                    trigger: `${editorDef.findConceptEditor(subClass).trigger}`,  // for single Concept part
                                    action: `(box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
                                                    const parent = box.element;
                                                    const newExpression = new ${Names.concept(subClass)}();
                                                    parent[(box as AliasBox).propertyName] = newExpression;
                                                    return newExpression;
                                              }`,
                                    boxRoleToSelect: `${this.cursorLocation(editorDef, subClass)}` /* CURSOR 4  ${subClass.name} */
                                }
                        );
                    });
                }
            }));
        for (const elem of behaviorMap.map.values()) {
            console.log("FOUND "+ elem.trigger + " roles: " + elem.activeInBoxRoles.length + " ==> " + elem.activeInBoxRoles);
            result += `
                    {
                        activeInBoxRoles: [${elem.activeInBoxRoles.map(role => `"${role}"`).join(",")}],
                        trigger: "${elem.trigger}",  // for single Concept part
                        action: ${elem.action},
                        boxRoleToSelect: "${elem.boxRoleToSelect}" /* CURSOR 4 */
                    },
                    `;
        }

        return result;
    }

    cursorLocation(editorDef: PiEditUnit, c: PiConcept) {
        const projection = editorDef.findConceptEditor(c).projection;
        if (!!projection) {
            if (c.name === "DemoEntity") {
                // console.log("DemoEntity cursorLocation: " + projection.cursorLocation());
                // console.log(projection.toString());
            }
            return projection.cursorLocation();
        } else {
            if (c instanceof PiBinaryExpressionConcept) {
                return "PiBinaryExpression-left";
            }
        }
        return "===== " + c.name + " =====";
    }
}

class BehaviorDescription {
    activeInBoxRoles: string[];
    trigger: string;
    action: string;
    boxRoleToSelect: string;
}

/**
 * Keeps a map of all actions, ensuring that identical actions with different triggers are joined.
 */
class ActionMap {
    map: Map<string, BehaviorDescription> = new Map<string, BehaviorDescription>();

    createOrAdd(classifier: PiClassifier, bd: BehaviorDescription): void {
        let found: BehaviorDescription = this.map.get(classifier.name);
        if( !!found){
            found.activeInBoxRoles = found.activeInBoxRoles.concat(...bd.activeInBoxRoles);
        } else {
            this.map.set(classifier.name, bd)
        }
    }
}
