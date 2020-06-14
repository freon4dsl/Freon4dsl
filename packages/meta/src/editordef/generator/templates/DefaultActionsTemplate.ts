import { flatten } from "lodash";
import { Names, PathProvider, PROJECTITCORE, LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiLanguageUnit, PiBinaryExpressionConcept, PiExpressionConcept, PiConcept } from "../../../languagedef/metalanguage/PiLanguage";
import { Roles } from "../../../utils/Roles";
import { DefEditorLanguage } from "../../metalanguage";
import { PiLangUtil } from "../../../languagedef/metalanguage/PiLangUtil";

export class DefaultActionsTemplate {
    constructor() {
    }

    // TODO generate the correct class comment for DefaultActions
    generate(language: PiLanguageUnit, editorDef: DefEditorLanguage, relativePath: string): string {
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
                    //         const new${part.name}: ${Names.concept(partConcept)} = new ${Names.concept(partConcept)}();
                    //         parent.${part.name}.push(new${part.name});
                    //         return Promise.resolve(new${part.name});
                    //     },
                    //     boxRoleToSelect: "${part.name}-name"
                    // }`;
                 }).join(",")}
            ];
            `;
        }

    customActionForReferences(language: PiLanguageUnit, editorDef: DefEditorLanguage): string {
        let result = "";
        language.concepts.forEach(concept => concept.allReferences().filter(ref => ref.isList).forEach(reference => {
                const referredConcept = reference.type.referred;
                const conceptEditor = editorDef.findConceptEditor(referredConcept);
                const trigger = !!conceptEditor.trigger ? conceptEditor.trigger : reference.name
                result += `
                {
                    activeInBoxRoles: ["${Roles.newPart(reference)}"],
                    trigger: "${trigger}",
                    action: (box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
                        const parent: ${Names.classifier(concept)} = box.element as ${Names.classifier(concept)};
                        const newBase: PiElementReference< ${Names.concept(referredConcept)}> = PiElementReference.createNamed("", null);
                        parent.${reference.name}.push(newBase);
                        return newBase;
                    },
                    boxRoleToSelect: "${this.cursorLocation(editorDef,concept)}"  /* CURSOR 1 */
                }
                `
                result +=",";
            })
        );
        return result;
    }

    customActionForParts(language: PiLanguageUnit, editorDef: DefEditorLanguage): string {
        let result = "";
        language.concepts.forEach(concept => concept.allParts().filter(ref => ref.isList).forEach(part => {
            const childConcept = part.type.referred;
            // const trigger = !!conceptEditor.trigger ? conceptEditor.trigger : part.name
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
                    },`).join(",\n")}
                    `
            if (childConcept instanceof PiConcept) {
                const conceptEditor = editorDef.findConceptEditor(childConcept);
            } else { // TODO child is PiInterface
                result += `${PiLangUtil.subConceptsIncludingSelf(childConcept).filter(cls => !cls.isAbstract).map(subClass => `
                   {
                        activeInBoxRoles: ["${Roles.newConceptPart(concept, part)}"],
                        trigger: "${editorDef.findConceptEditor(subClass).trigger}", // for Interface part
                        action: (box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
                            const parent = box.element;
                            const newExpression = new ${Names.concept(subClass)}();
                            parent[(box as AliasBox).propertyName].push(newExpression);
                            return newExpression;

                        },
                        boxRoleToSelect: "${this.cursorLocation(editorDef, subClass)}" /* CURSOR 3 */
                    },`).join(",\n")}
                    `
                }
            })
        );
        language.concepts.forEach(concept => concept.allParts().filter(ref => !ref.isList).forEach(part => {
                const childConcept = part.type.referred;
                if (childConcept instanceof PiConcept) {
                    const conceptEditor = editorDef.findConceptEditor(childConcept);
                    result += `${PiLangUtil.subConceptsIncludingSelf(childConcept).filter(cls => !cls.isAbstract).map(subClass => `
                    {
                        activeInBoxRoles: ["${Roles.newConceptPart(concept, part)}"],
                        trigger: "${editorDef.findConceptEditor(subClass).trigger}",  // for single Concept part
                        action: (box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
                            const parent = box.element;
                            const newExpression = new ${Names.concept(subClass)}();
                            parent[(box as AliasBox).propertyName] = newExpression;
                            return newExpression;
                        },
                        boxRoleToSelect: "${this.cursorLocation(editorDef, subClass)}" /* CURSOR 4  ${subClass.name} */
                    },`).join(",\n")}
                    `
                }
            })
        );
        return result;
    }

    cursorLocation(editorDef: DefEditorLanguage, c: PiConcept) {
        const projection = editorDef.findConceptEditor(c).projection;
        if (!!projection) {
            if (c.name === "DemoEntity") {
                console.log("DemoEntity cursorLocation: " + projection.cursorLocation());
                console.log(projection.toString());
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

