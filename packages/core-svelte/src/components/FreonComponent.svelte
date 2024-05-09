<script lang="ts">
    /**
     * This component shows a complete projection, by displaying the rootbox of
     * the associated editor.
     */
    import {
        FreEditor,
        FreLogger,
        Box,
        ARROW_UP,
        ARROW_DOWN,
        TAB,
        BACKSPACE,
        ARROW_LEFT,
        DELETE,
        ENTER,
        ARROW_RIGHT, isNullOrUndefined, isTableRowBox, isElementBox,
    } from "@freon4dsl/core";
    import RenderComponent from "./RenderComponent.svelte";
    import ContextMenu from "./ContextMenu.svelte";
    import { afterUpdate, onMount, tick } from "svelte";
    import { contextMenu, contextMenuVisible, selectedBoxes, viewport, componentId } from "./svelte-utils";

    let LOGGER = new FreLogger("FreonComponent");//.mute();
    export let editor: FreEditor;
    let element: HTMLDivElement; // The current main element of this component.
    let rootBox: Box;
    let id: string;              // an id for the html element showing the rootBox
    id = !!rootBox ? componentId(rootBox) : "freon-component-with-unknown-box";

    function stopEvent(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    const onKeyDown = (event: KeyboardEvent) => {
        LOGGER.log("FreonComponent onKeyDown: " + event.key + " ctrl: " + event.ctrlKey + " alt: " + event.altKey + " shift: " + event.shiftKey);
        if (event.ctrlKey || event.altKey) {
            switch (event.key) {
                case ARROW_UP:
                    editor.selectParent();
                    stopEvent(event);
                    break;
                case ARROW_DOWN:
                    editor.selectFirstLeafChildBox();
                    stopEvent(event);
                    break;
            }
        } else if (event.shiftKey) {
            switch (event.key) {
                case TAB:
                    editor.selectPreviousLeaf();
                    stopEvent(event);
                    break;
            }
        } else if (event.altKey) {
            // All alt keys here
        } else {
            // No meta key pressed
            switch (event.key) {
                case BACKSPACE:
                case ARROW_LEFT:
                    editor.selectPreviousLeaf();
                    stopEvent(event);
                    break;
                case DELETE:
                    editor.deleteBox(editor.selectedBox);
                    stopEvent(event);
                    break;
                case TAB:
                case ENTER:
                case ARROW_RIGHT:
                    editor.selectNextLeaf();
                    stopEvent(event);
                    break;
                case ARROW_DOWN:
                    editor.selectBoxBelow(editor.selectedBox);
                    stopEvent(event);
                    break;
                case ARROW_UP:
                    LOGGER.log("Up: " + editor.selectedBox.role);
                    editor.selectBoxAbove(editor.selectedBox);
                    stopEvent(event);
                    break;
            }
        }
    };

    /**
     * Keep track of the scrolling position in the editor, so we know exactly where boxes are
     * in relationship with each other.
     */
    function onScroll() {
        // Hide any contextmenu upon scrolling, because its position will not be correct.
        $contextMenuVisible = false;
        // we use a timeOut here, like below in the ResizeObserver, to improve performance
        setTimeout(() => {
            editor.scrollX = element.scrollLeft;
            editor.scrollY = element.scrollTop;
        }, 400); // Might use another value for the delay, but this seems ok.
    }

    onMount(() => {
        // We keep track of the size of the editor component, to be able to position any context menu correctly.
        // For this we use a ResizeObserver.

        // Define the observer and its callback.
        const resizeObserver = new ResizeObserver(entries => {
            // Hide any contextmenu upon resize, because its position will not be correct.
            $contextMenuVisible = false;
            // Use a timeOut to improve performance, otherwise every slight change will activate this function.
            setTimeout(() => {
                // We're only watching one element, this is the first of the entries.
                const entry = entries.at(0);
                // Get the element's size.
                // Note that entry.contentRect gives slightly different results to entry.target.getBoundingClientRect().
                // A: I have no idea why.
                let rect = entry.target.getBoundingClientRect();
                $viewport.setSizes(rect.height, rect.width, rect.top, rect.left);
            }, 400); // Might use another value for the delay, but this seems ok.
        });

        // Observe the FreonComponent element.
        resizeObserver.observe(element);
        editor.refreshComponentSelection = refreshSelection
        editor.refreshComponentRootBox= refreshRootBox;

        // This callback cleans up the observer.
        return () => resizeObserver.unobserve(element);
    });

    afterUpdate( () => {
        editor.refreshComponentSelection = refreshSelection
        editor.refreshComponentRootBox= refreshRootBox;
    } );

    const refreshSelection = async  (why?: string) => {
        LOGGER.log("FreonComponent.refreshSelection: " + why + " editor selectedBox is " + editor?.selectedBox?.kind);
        if (!isNullOrUndefined(editor.selectedBox) && !$selectedBoxes.includes(editor.selectedBox)) { // selection is no longer in sync with editor
            await tick();
            $selectedBoxes = getSelectableChildren(editor.selectedBox);
            editor.selectedBox.setFocus();
        }
    };

    function getSelectableChildren(box: Box): Box[] {
        const result: Box[] = [];
        // Because neither a TableRowBox nor an ElementBox has its own HTML equivalent,
        // its children are regarded to be selected.
        if (isTableRowBox(box) ) {
            for (const child of box.children) {
                result.push(...getSelectableChildren(child));
            }
        } else if (isElementBox(box)) {
            result.push(...getSelectableChildren(box.content));
        } else {
            result.push(box);
        }
        return result;
    }

    const refreshRootBox = (why?: string) => {
        rootBox = editor.rootBox;
        LOGGER.log("REFRESH " + why + " ==================> FreonComponent with rootbox " + rootBox?.id);
    };

    refreshRootBox("Initialize FreonComponent");
    refreshSelection("Initialize FreonComponent");
</script>

<div class={"freon"}
     on:keydown={onKeyDown}
     on:scroll={onScroll}
     bind:this={element}
     id="{id}"
>
    <RenderComponent editor={editor}
                     box={rootBox}
    />
</div>
<!-- Here the only instance of ContextMenu is defined -->
<!-- TODO make some default items for the context menu -->
<!--<ContextMenu bind:this={$contextMenu} items={[]} editor={editor}/>-->

<style>
    .freon {
        height: 100%;
        width: 100%;
        overflow-x: auto;
        font-size: var(--freon-editor-component-font-size, 14px);
        font-style: var(--freon-editor-component-font-style, italic);
        font-weight: var(--freon-editor-component-font-weight, normal);
        font-family: var(--freon-editor-component-font-family, "Arial");
        color: var(--freon-editor-component-color, darkblue);
        background-color: var(--freon-editor-component-background-color, white);
        margin: var(--freon-editor-component-margin, 1px);
        padding: var(--freon-editor-component-padding, 1px);

    }
</style>
