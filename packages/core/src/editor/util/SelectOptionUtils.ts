import { FREON } from "../../environment/index.js"
import {
    type Box,
    type FreEditor,
    type FreAction,
    type FrePostAction,
    type SelectOption,
    FreCreatePartAction,
    FreCustomAction,
    type FreTriggerType,
    type OptionalBox,
    type ActionBox
} from "../index.js"
import { FreLogger } from "../../logging/index.js";
import { notNullOrUndefined } from "../../util/index.js"
import {
    FreLanguage,
    type FreLanguageClassifier,
    type FreLanguageConcept,
    type FreLanguageProperty
} from "../../language/index.js"
import { type FreNode, FreNodeReference } from "../../ast/index.js"
import { runInAction } from "mobx"

const LOGGER: FreLogger = new FreLogger("SelectOptionUtils");

export enum BehaviorExecutionResult {
    NULL,
    EXECUTED,
    PARTIAL_MATCH,
    NO_MATCH,
}

/**
 * We know the action to be executed, so just do it.
 * @param action
 * @param box
 * @param label
 * @param editor
 */
export function executeSingleBehavior(
    action: FreAction,
    box: Box,
    label: string,
    editor: FreEditor,
): BehaviorExecutionResult {
    LOGGER.log(`Enter executeSingleBehavior label [${label}] refshortcut [${action.referenceShortcut}]`);
    let execresult: FrePostAction;

    const index = -1; // todo get the correct index
    FREON.astChanger.change(() => {
        execresult = action.execute(box, label, editor, index)
    })
    if (!!execresult) {
        execresult();
    }
    return BehaviorExecutionResult.EXECUTED;
}

export function createOptions(editor: FreEditor, node: FreNode, box: ActionBox, conceptOfContent: string): SelectOption[] {
    const result: SelectOption[] = []
    if (notNullOrUndefined(box.propertyName) && notNullOrUndefined(conceptOfContent)) {
        LOGGER.log(`  has property ${box.propertyName} and concept ${conceptOfContent}`)
        // If the box has a property and concept name, then this can be used to create element of the
        // concept type and its subtypes or implementors.
        return optionsForSubsOrImplementors(node, box, editor, conceptOfContent)
    } else if (notNullOrUndefined(box.propertyName)) {
        // Only has a property name, so it is a reference property. NB. check this
        const propDef: FreLanguageProperty = FreLanguage.getInstance().classifierProperty(node.freLanguageConcept(), box.propertyName)
        LOGGER.log(`parent: ${node.freLanguageConcept()} prop ${propDef.name} kind: ${propDef?.propertyKind}`)
        addReferences(node, propDef, result, editor)
    }
    return result
}

function optionsForSubsOrImplementors(node: FreNode, box: OptionalBox | ActionBox, editor: FreEditor, conceptOfContent: string): SelectOption[] {
    LOGGER.log(`addSubsOrImplementors ${node.freLanguageConcept()}`)
    const result: SelectOption[] = []
    const clsOtIntf: FreLanguageClassifier = FreLanguage.getInstance().classifier(conceptOfContent)
    clsOtIntf.subConceptNames.concat(conceptOfContent).forEach((creatableConceptname: string) => {
        const creatableConcept: FreLanguageConcept = FreLanguage.getInstance().concept(creatableConceptname)
        LOGGER.log(` creatableConcept: ${creatableConcept?.typeName}`)
        if (notNullOrUndefined(creatableConcept) && !creatableConcept.isAbstract) {
            if (notNullOrUndefined(creatableConcept.referenceShortcut)) {
                addReferenceShortcuts(creatableConcept as FreLanguageConcept, result, editor, node, box)
            } else {
                result.push(getCreateElementOption(box.propertyName, creatableConceptname, creatableConcept as FreLanguageConcept))
            }
        }
    })
    return result
}

export function createOptionsForOptional(editor: FreEditor, node: FreNode, box: OptionalBox, propDef: FreLanguageProperty): SelectOption[] {
    LOGGER.log(`createOptionsForOptional: ${node.freLanguageConcept()} ${propDef.type}`)
    const result: SelectOption[] = []
    // NB propDef === 'primitive' is handled in the OptionalBox
    if (propDef.propertyKind === 'part') {
        // find all possible subclasses/implementors of the type of the property
        return optionsForSubsOrImplementors(node, box, editor, propDef.type)
    } else if (propDef.propertyKind === 'reference') {
        // find all possible referable nodes
        addReferences(node, propDef, result, editor)
    }
    return result
}

/**
 * Get all referable element for the reference shortcut of concept
 * @param concept The concept with the referenceShortcut
 * @param result  The array where the resulting actions should be added to
 * @param editor  The editor context
 * @param node
 * @param box
 */
function addReferenceShortcuts(concept: FreLanguageConcept, result: SelectOption[], editor: FreEditor, node: FreNode, box: Box): void {
    LOGGER.log("addReferenceShortcuts")
    // Create the new element for this behavior inside a dummy and then point the owner to the
    // current element ('box').  This way the new element is not part of the model and will not trigger mobx
    // reactions. But the scoper can be used to find available references, because the scoper only
    // needs the owner.
    const self: Box = box;
    runInAction(() => {
        const newNode = concept.constructor();
        newNode["$$owner"] = node;
        result.push(
            ...editor.environment.scoper
                .getVisibleNodes(newNode, concept.referenceShortcut.conceptName)
                .filter((node) => !!node.name && node.name !== "")
                .map((node) => ({
                    id: concept.trigger + "-" + node.name,
                    label: node.name,
                    description: "create " + concept.referenceShortcut.conceptName,
                    action: new FreCreatePartAction({
                        referenceShortcut: {
                            propertyName: concept.referenceShortcut.propertyName,
                            conceptName: concept.referenceShortcut.conceptName,
                        },
                        propertyName: self.propertyName,
                        conceptName: concept.typeName,
                    }),
                })),
        );
    });
}

/**
 * Get all referable elements for the property
 * @param parentNode
 * @param property
 * @param result  The array where the resulting actions should be added to
 * @param editor  The editor context
 * @private
 */
function addReferences(
    parentNode: FreNode,
    property: FreLanguageProperty,
    result: SelectOption[],
    editor: FreEditor,
) {
    // Create the new element for this behavior inside a dummy and then point the owner to the
    // current element.  This way the new element is not part of the model and will not trigger mobx
    // reactions. But the scoper can be used to find available references, because the scoper only
    // needs the owner.
    LOGGER.log("addReferences: " + parentNode.freLanguageConcept() + " property " + property.name);
    const propType: string = property.type;
    // const self: ActionBox = this;
    runInAction(() => {
        // const newElement = concept.constructor();
        // newElement["$$owner"] = this.element;
        result.push(
            ...editor.environment.scoper
                .getVisibleNodes(parentNode, propType)
                .filter((node) => !!node.name && node.name !== "")
                .map((node) => ({
                    id: parentNode.freLanguageConcept() + "-" + node.name,
                    label: node.name,
                    description: "create ref to " + propType,
                    action: FreCustomAction.create({
                        activeInBoxRoles: [],
                        // @ts-ignore
                        action: (box: Box, trigger: FreTriggerType, ed: FreEditor): FreNode | null => {
                            if (property.isList){
                                parentNode[property.name].push(FreNodeReference.create(node.name, propType))
                            } else {
                                parentNode[property.name] = FreNodeReference.create(node.name, propType)
                            }
                            return null;
                        },
                        boxRoleToSelect: "REFERENCE"
                    }),
                })),
        );
    });
}

function getCreateElementOption(
    propertyName: string,
    conceptName: string,
    concept: FreLanguageConcept,
): SelectOption {
    LOGGER.log("createElementAction property: " + propertyName + " concept " + conceptName);
    return {
        id: conceptName,
        label: concept.trigger,
        action: new FreCreatePartAction({
            propertyName: propertyName,
            conceptName: conceptName,
        }),
        description: "action auto",
    };
}

