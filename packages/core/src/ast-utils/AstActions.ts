import type { FreModelUnit, FreNode, FreOwnerDescriptor } from "../ast/index.js"
import type { FreDelta } from "../change-manager/index.js"
import { FREON } from "../environment/CoreConfig.js"
import { FreErrorSeverity } from "../validator/index.js"
import { type Box, type FreEditor, isActionBox, isListBox } from "../editor/index.js"
import { FreLanguage } from "../language/index.js"
import { FreLogger } from "../logging/index.js"
import { runInAction } from "mobx"
import { notNullOrUndefined } from "../util/index.js"
import type { LionWebJsonChunk } from "@lionweb/json"
import { FreLionWebSerializer } from "../storage/index.js"
import { FreLanguageEnvironment } from "../environment/index.js"
import { isLionWebJsonChunk } from "../storage/utils/index.js"
import { FreLionWebDeserializer } from "../storage/index.js"

const LOGGER = new FreLogger("AstActions") // .mute();

// The web prefix marks the representation as a web custom clipboard format.
const FREON_WEB_CLIPBOARD_TYPE = "web application/vnd.freon.node+json"
const FREON_MIME_TYPE = "application/vnd.freon.node+json"

export class AstActions {
    private static instance: AstActions | null = null
    private editor: FreEditor
    private isCopying: boolean = false

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

    async cut() {
        LOGGER.log("cut called")
        const tobecut: FreNode = this.editor.selectedElement
        if (!!tobecut) {
            this.deleteElement(tobecut)
            this.editor.copiedElement = tobecut
            const copiedElement = this.editor.copiedElement

            if (notNullOrUndefined(copiedElement)) {
                const jsonObject: LionWebJsonChunk = FreLionWebSerializer.getInstance().serializeFreNodeToChunk(copiedElement)
                const plainText = FreLanguageEnvironment.getInstance().writer.writeToString(copiedElement)
                await this.copyLionWebChunkToClipboard(jsonObject, plainText)
            }
        } else {
            this.editor.setUserMessage("Nothing selected", FreErrorSeverity.Warning)
        }
    }

    async copy() {
        LOGGER.log("copy called")
        const tobecopied: FreNode = this.editor.selectedElement
        if (!!tobecopied) {
            runInAction(() => {
                this.editor.copiedElement = tobecopied.copy()
            })
            const copiedElement = this.editor.copiedElement

            if (notNullOrUndefined(copiedElement)) {
                const jsonObject: LionWebJsonChunk = FreLionWebSerializer.getInstance().serializeFreNodeToChunk(copiedElement)
                console.log(`copied copied: '${JSON.stringify(jsonObject)}'`)
                const plainText = FreLanguageEnvironment.getInstance().writer.writeToString(copiedElement)
                await this.copyLionWebChunkToClipboard(jsonObject, plainText)
            }
        } else {
            this.editor.setUserMessage("Nothing selected", FreErrorSeverity.Warning)
        }
    }

    async paste() {
        LOGGER.log("paste called")
        let toBePasted: FreNode = this.editor.copiedElement.copy()
        const jsonObject = await this.readLionWebChunkFromClipboard()
        console.log("toBePasted from editor: ", toBePasted.freId())

        if (notNullOrUndefined(jsonObject)) {
            const nodeFound: FreNode | null = FreLionWebDeserializer.getInstance().deserializeFreNode(jsonObject)
            if (notNullOrUndefined(nodeFound)) {
                console.log("Found nodes in structured clipboard data:", FreLanguageEnvironment.getInstance().writer.writeToString(nodeFound))
                // Avoid possible ID clashes by pasting a copy.
                toBePasted = nodeFound.copy()
                console.log("toBePasted JSON:", toBePasted.freId())
            }
        }

        if (notNullOrUndefined(toBePasted)) {
            const currentSelection: Box = this.editor.selectedBox
            const element: FreNode = currentSelection.node
            if (notNullOrUndefined(currentSelection)) {
                if (isActionBox(currentSelection)) {
                    if (FreLanguage.getInstance().metaConformsToType(toBePasted, currentSelection.conceptName)) {
                        // allow subtypes
                        // console.log("found text box for " + currentSelection.parent.conceptName + ", " + currentSelection.parent.propertyName);
                        this.pasteInElement(element, toBePasted, currentSelection.propertyName)
                    } else {
                        this.editor.setUserMessage("Cannot paste a " + toBePasted.freLanguageConcept() + " here.", FreErrorSeverity.Warning)
                    }
                } else {
                    // Walk up the box tree to find a ListBox ancestor
                    const listBox = this.findListBoxAncestor(currentSelection)
                    if (listBox) {
                        if (FreLanguage.getInstance().metaConformsToType(toBePasted, element.freLanguageConcept())) {
                            // allow subtypes
                            this.pasteInElement(element.freOwnerDescriptor().owner, toBePasted, listBox.propertyName, element.freOwnerDescriptor().propertyIndex + 1)
                        } else {
                            this.editor.setUserMessage("Cannot paste a " + toBePasted.freLanguageConcept() + " here.", FreErrorSeverity.Warning)
                        }
                    } else {
                        this.editor.setUserMessage("Cannot paste a " + toBePasted.freLanguageConcept() + " here.", FreErrorSeverity.Warning)
                    }
                }
            } else {
                this.editor.setUserMessage("Cannot paste a " + toBePasted.freLanguageConcept() + " here.", FreErrorSeverity.Warning)
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

    private async copyLionWebChunkToClipboard(jsonObject: LionWebJsonChunk, plainText: string): Promise<void> {
        const canWriteClipboard: boolean =
            // eslint-disable-next-line n/no-unsupported-features/node-builtins
            typeof navigator !== "undefined" && typeof ClipboardItem !== "undefined" && isSecureContext && !!navigator.clipboard?.write

        if (!canWriteClipboard) {
            this.editor.setUserMessage("Structured clipboard access is not available here. The node remains available inside Freon.", FreErrorSeverity.Warning)
            return
        }

        if (this.isCopying) {
            return
        }

        try {
            this.isCopying = true

            const normalizedPlainText = plainText.replace(/\r\n?/g, "\n")
            const jsonText = JSON.stringify(jsonObject)

            const clipboardData: Record<string, Blob> = {
                "text/plain": new Blob([normalizedPlainText], { type: "text/plain" }),
            }
            const freonType = FREON_WEB_CLIPBOARD_TYPE

            // EditorRequestsHandler.FREON_NODE_CLIPBOARD_TYPE is a web custom clipboard format.
            // ClipboardItem.supports() can test whether the browser accepts it.
            if (typeof ClipboardItem.supports !== "function" || ClipboardItem.supports(freonType)) {
                clipboardData[freonType] = new Blob([jsonText], { type: FREON_MIME_TYPE })
            }

            // eslint-disable-next-line n/no-unsupported-features/node-builtins
            await navigator.clipboard.write([new ClipboardItem(clipboardData)])
        } catch {
            this.editor.setUserMessage("Clipboard write was blocked. The node remains available inside Freon.", FreErrorSeverity.Warning)
        } finally {
            this.isCopying = false
        }
    }

    private async readLionWebChunkFromClipboard(): Promise<LionWebJsonChunk | undefined> {
        // eslint-disable-next-line n/no-unsupported-features/node-builtins
        const canReadClipboard: boolean = typeof navigator !== "undefined" && isSecureContext && !!navigator.clipboard?.read

        if (!canReadClipboard) {
            return undefined
        }

        try {
            // eslint-disable-next-line n/no-unsupported-features/node-builtins
            const clipboardItems = await navigator.clipboard.read()

            for (const clipboardItem of clipboardItems) {
                if (!clipboardItem.types.includes(FREON_WEB_CLIPBOARD_TYPE)) {
                    continue
                }

                const jsonBlob: Blob = await clipboardItem.getType(FREON_WEB_CLIPBOARD_TYPE)

                const jsonText: string = await jsonBlob.text()
                const jsonValue: unknown = JSON.parse(jsonText)
                if (!isLionWebJsonChunk(jsonValue)) {
                    console.warn("Structured clipboard data is not a valid LionWebJsonChunk.", jsonValue)
                    return undefined
                }
                return JSON.parse(jsonText) as LionWebJsonChunk
            }
        } catch (error) {
            console.warn("Could not read structured Freon data from clipboard.", error)
        }

        return undefined
    }

    private findListBoxAncestor(box: Box): Box | null {
        let current: Box | null = box.parent
        while (current) {
            if (isListBox(current)) {
                return current
            }
            current = current.parent
        }
        return null
    }

    private pasteInElement(parentNode: FreNode, toBePastedIn: FreNode, propertyName: string, index?: number) {
        const property = parentNode[propertyName]
        // Keep an in-memory copy as well
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
            FREON.astChanger.change(() => (parentNode[propertyName] = toBePastedIn))
        }
    }
}
