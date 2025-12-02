import { DummyNode } from './DummyNode.js';
import {
    AST,
    Box,
    FreEditor,
    FreEditorUtil,
    type FrePostAction,
    toFreKey,
    FreAction,
    ElementBox,
    notNullOrUndefined,
    FreLanguage,
    ListElementInfo,
    type FreNodeReference,
    type FreNamedNode
} from '@freon4dsl/core';
import {draggedElem, draggedFrom} from "../stores/AllStores.svelte";

// const LOGGER = new FreLogger('CommonFunctions').mute();

export const dummyBox = new ElementBox(new DummyNode('dummy'), 'box-role');

/**
 * This calculates the position of the context- or sub-menu, either on x-axis or y-axis
 * @param viewportSize
 * @param contentSize
 * @param mousePosition
 */
export function calculatePos(
    viewportSize: number,
    contentSize: number,
    mousePosition: number
): number {
    let result: number;
    // see if the menu will fit in the editor view, if not: position it left/up, not right/down of the mouse click
    if (viewportSize - mousePosition < contentSize) {
        result = mousePosition - contentSize;
    } else {
        result = mousePosition;
    }
    // if the result should be outside the editor view, then position it on the leftmost/uppermost point
    if (result < 0) {
        result = 0;
    }
    return result;
}

export function executeCustomKeyboardShortCut(
    event: KeyboardEvent,
    index: number,
    box: Box,
    editor: FreEditor
) {
    const cmd: FreAction = FreEditorUtil.findKeyboardShortcutAction(toFreKey(event), box, editor);
    if (cmd !== null) {
        let postAction: FrePostAction;
        AST.change(() => {
            // todo KeyboardEvent does not have an "action" prop, so what is happening here?
            const action = event['action' as keyof KeyboardEvent];
            if (notNullOrUndefined(action)) {
                // @ts-expect-error if present, action is callable
                action();
            }
            postAction = cmd.execute(box, toFreKey(event), editor, index);
        });
        // @ts-expect-error this causes no error, because of the if-stat check
        if (notNullOrUndefined(postAction)) {
            postAction();
        }
        // todo this method will stop the event from propagating, but does not prevent default!! Should it do so?
        event.stopPropagation();
    }
}

export function isOdd(n: number): boolean {
    return (n & 1) === 1;
}

// export function isEven(n: number): boolean {
//     return (n & 1) === 0;
// }

export function componentId(box: Box): string {
    return `${box?.node?.freId()}-${box?.role}`;
}

/**
 * Replace HTML tags and spaces with HTML Entities.
 * Used to make text containing these acceptable as HTML Text.
 * SPACE => @nbsp;
 * "<"   => &lt;
 */
export function replaceHTML(s: string): string {
    return s.replace(/\s/g, '&nbsp;').replace(/</, '&lt;');
}

export function rememberDraggedNode(componentId: string, listOrTableBox: Box, draggedElemBox: Box) {
    console.log(`rememberDraggedNode parentBox: ${listOrTableBox?.kind}, draggedElemBox: ${draggedElemBox.kind}`);
    let propertyDef = FreLanguage.getInstance().classifierProperty(listOrTableBox?.node.freLanguageConcept(), listOrTableBox?.propertyName);
    // If the draggedElemBox is a part, then its node is the list element that is being transferred.
    // But if it is a reference then its node is the parent of the reference, i.e. the complete list.
    // The same holds for primitive list elements. Therefore, we need to distinguish the following cases.
    if (propertyDef?.propertyKind === "part") {
        console.log(`DAD Part ${draggedElemBox.id} ${draggedElemBox.kind} ${draggedElemBox.node?.freLanguageConcept()} ${draggedElemBox.propertyName}`)
        draggedElem.value = new ListElementInfo(draggedElemBox.node, componentId);
    } else if (propertyDef?.propertyKind === "reference") {
        console.log(`DAD Other ${draggedElemBox.id} ${draggedElemBox.kind} ${draggedElemBox.node} ${draggedElemBox.propertyName}`)
        // @ts-ignore
        let theNode: FreNodeReference<FreNamedNode> = listOrTableBox.node[draggedElemBox.propertyName][draggedElemBox.propertyIndex] as FreNodeReference<FreNamedNode>
        draggedElem.value = new ListElementInfo(theNode, componentId);
    } else { // if ( propertyDef?.propertyKind === "primitive" )
        // todo implement this if we continue having lists of primitive values, and not comply to LionWeb
    }
    draggedFrom.value = componentId;
}

