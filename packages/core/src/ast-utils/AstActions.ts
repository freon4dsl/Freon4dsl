import type { FreModelUnit, FreNode, FreOwnerDescriptor } from "../ast/index.js"
import type { FreDelta } from "../change-manager/index.js"
import { FREON } from "../environment/CoreConfig.js"
import { FreErrorSeverity } from "../validator/index.js"
import { type Box, type FreEditor, isActionBox, isActionTextBox, isListBox } from "../editor/index.js"
import { FreLanguage } from "../language/index.js"
import { FreLogger } from "../logging/index.js"
import { runInAction } from "mobx"

const LOGGER = new FreLogger("AstActions") // .mute();

export class AstActions {
    private static instance: AstActions | null = null
    private editor: FreEditor

    static getInstance(editor: FreEditor): AstActions {
        if (AstActions.instance === null) {
            AstActions.instance = new AstActions()
        }
        AstActions.instance.editor = editor
        return AstActions.instance
    }

    redo(): FreDelta | undefined {
        if (this.editor.rootElement?.freIsUnit()) {
            const unitInEditor = this.editor.rootElement as FreModelUnit
            LOGGER.log(`redo called: '${FREON.astChanger.nextRedoAsText(unitInEditor)}' currentunit '${unitInEditor?.name}'`)
            if (!!unitInEditor) {
                const delta = FREON.astChanger.redo(unitInEditor)
                return delta
            }
        }
        return undefined
    }

    undo(): FreDelta | undefined {
        if (this.editor.rootElement?.freIsUnit()) {
            const unitInEditor = this.editor.rootElement as FreModelUnit
            LOGGER.log(`undo called: '${FREON.astChanger.nextUndoAsText(unitInEditor)}' currentunit '${unitInEditor?.name}'`)
            if (!!unitInEditor) {
                const delta = FREON.astChanger.undo(unitInEditor)
                return delta
            }
        }
        return undefined
    }

    cut() {
        LOGGER.log("cut called")
        const tobecut: FreNode = this.editor.selectedElement
        if (!!tobecut) {
            this.deleteElement(tobecut)
            this.editor.copiedElement = tobecut
            // console.log("element " + this.editor.copiedElement.freId() + " is stored ");
        } else {
            this.editor.setUserMessage("Nothing selected", FreErrorSeverity.Warning)
        }
    }

    copy() {
        LOGGER.log("copy called")
        const tobecopied: FreNode = this.editor.selectedElement
        if (!!tobecopied) {
            runInAction(() => {
                this.editor.copiedElement = tobecopied.copy()
            })
            // console.log("element " + this.editor.copiedElement.freId() + " is stored ");
        } else {
            this.editor.setUserMessage("Nothing selected", FreErrorSeverity.Warning)
        }
    }

    paste() {
        LOGGER.log("paste called")
        const tobepasted = this.editor.copiedElement
        if (!!tobepasted) {
            const currentSelection: Box = this.editor.selectedBox
            const element: FreNode = currentSelection.node
            if (!!currentSelection) {
                if (isActionTextBox(currentSelection)) {
                    if (isActionBox(currentSelection.parent)) {
                        if (FreLanguage.getInstance().metaConformsToType(tobepasted, currentSelection.parent.conceptName)) {
                            // allow subtypes
                            // console.log("found text box for " + currentSelection.parent.conceptName + ", " + currentSelection.parent.propertyName);
                            this.pasteInElement(element, currentSelection.parent.propertyName)
                        } else {
                            this.editor.setUserMessage("Cannot paste a " + tobepasted.freLanguageConcept() + " here.", FreErrorSeverity.Warning)
                        }
                    }
                } else {
                    // Walk up the box tree to find a ListBox ancestor
                    const listBox = this.findListBoxAncestor(currentSelection);
                    if (listBox) {
                        if (FreLanguage.getInstance().metaConformsToType(tobepasted, element.freLanguageConcept())) {
                            // allow subtypes
                            this.pasteInElement(
                                element.freOwnerDescriptor().owner,
                                listBox.propertyName,
                                element.freOwnerDescriptor().propertyIndex + 1,
                            )
                        } else {
                            this.editor.setUserMessage("Cannot paste a " + tobepasted.freLanguageConcept() + " here.", FreErrorSeverity.Warning)
                        }
                    } else {
                        this.editor.setUserMessage("Cannot paste a " + tobepasted.freLanguageConcept() + " here.", FreErrorSeverity.Warning)
                    }
                }
            } else {
                this.editor.setUserMessage("Cannot paste a " + tobepasted.freLanguageConcept() + " here.", FreErrorSeverity.Warning)
            }
        } else {
            this.editor.setUserMessage("Nothing to be pasted", FreErrorSeverity.Warning)
            return
        }
    }

    deleteElement(tobeDeleted: FreNode) {
        if (!!tobeDeleted) {
            // find the owner of the element to be deleted and remove the element there
            const owner: FreNode = tobeDeleted.freOwner()
            const desc: FreOwnerDescriptor = tobeDeleted.freOwnerDescriptor()
            if (!!desc) {
                // console.log("deleting " + desc.propertyName + "[" + desc.propertyIndex + "]");
                if (desc.propertyIndex !== null && desc.propertyIndex !== undefined && desc.propertyIndex >= 0) {
                    const propList = owner[desc.propertyName]
                    if (Array.isArray(propList) && propList.length > desc.propertyIndex) {
                        FREON.astChanger.change(() => propList.splice(desc.propertyIndex, 1))
                    }
                } else {
                    FREON.astChanger.change(() => (owner[desc.propertyName] = null))
                }
            } else {
                console.error("deleting of " + tobeDeleted.freId() + " not succeeded, because owner descriptor is empty.")
            }
        }
    }

    private findListBoxAncestor(box: Box): Box | null {
        let current: Box | null = box.parent;
        while (current) {
            if (isListBox(current)) {
                return current;
            }
            current = current.parent;
        }
        return null;
    }

    private pasteInElement(element: FreNode, propertyName: string, index?: number) {
        const property = element[propertyName]
        const toBePastedIn: FreNode = this.editor.copiedElement
        runInAction(() => {
            this.editor.copiedElement = toBePastedIn.copy()
        })
        if (Array.isArray(property)) {
            // console.log('List before: [' + property.map(x => x.freId()).join(', ') + ']');
            FREON.astChanger.change(() => {
                if (index !== null && index !== undefined && index > 0) {
                    property.splice(index, 0, toBePastedIn)
                } else {
                    property.push(toBePastedIn)
                }
            })
            // console.log('List after: [' + property.map(x => x.freId()).join(', ') + ']');
        } else {
            // console.log('property ' + propertyName + ' is no list');
            FREON.astChanger.change(() => (element[propertyName] = toBePastedIn))
        }
    }
}
