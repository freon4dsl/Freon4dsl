<script lang="ts">
    /**
     * This component shows a complete projection, by displaying the rootbox of
     * the associated editor.
     */
    import {
        PiEditor,
        PiLogger,
        Box,
        ARROW_UP,
        ARROW_DOWN,
        TAB,
        BACKSPACE,
        ARROW_LEFT,
        DELETE,
        ARROW_RIGHT, ElementBox, isNullOrUndefined, isTableRowBox, isElementBox
    } from "@projectit/core";
    import RenderComponent from "./RenderComponent.svelte";
    import ContextMenu from "./ContextMenu.svelte";
    import { contextMenu, contextMenuVisible } from "./svelte-utils/ContextMenuStore";
    import { selectedBoxes } from "./svelte-utils/DropAndSelectStore";
    import { afterUpdate, onMount } from "svelte";
    import { viewport } from "./svelte-utils/EditorViewportStore";

    let LOGGER = new PiLogger("ProjectItComponent");//.mute();
    export let editor: PiEditor;
    let element: HTMLDivElement; // The current main element of this component.
    let rootBox: Box;
    let id: string;              // an id for the html element showing the rootBox
    id = !!rootBox ? rootBox.id : "projectit-component-with-unknown-box";

    function stopEvent(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    // todo tabbing etc. should take into account the projection. Currently, sometimes the selected element is not visible.
    const onKeyDown = (event: KeyboardEvent) => {
        console.log("ProjectItComponent onKeyDown: " + event.key + " ctrl: " + event.ctrlKey + " alt: " + event.altKey + " shift: " + event.shiftKey);
        // console.log('selected BEFORE: ' + editor.selectedBox.id + ' current focused element ' + document.activeElement.id);
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
        // todo check whether the following always (or never?) needs to be done
        // console.log('selected AFTER: ' + editor.selectedBox.id + ' current focused element ' + document.activeElement.id);
        // editor.selectedBox.setFocus();
        // $selectedBoxes = [editor.selectedBox];
        // event.stopPropagation(); // do not preventDefault, because this would keep printable chars to show in any input HTML element. TODO IS this true???
    };

    /**
     * Keep track of the scrolling position in the editor, so we know exactly where boxes are
     * in relationship with each other.
     */
    function onScroll() {
        // Hide any contextmenu upon scrolling, because its position will not be correct.
        $contextMenuVisible = false;
        // todo shouldn't we use a timeOut here, like below in the ResizeObserver?
        editor.scrollX = element.scrollLeft;
        editor.scrollY = element.scrollTop;
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

        // Observe the ProjectItComponent element.
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

    const refreshSelection = (why?: string) => {
        // console.log("setting selectedBox " + why);
        if (!isNullOrUndefined(editor.selectedBox) && !$selectedBoxes.includes(editor.selectedBox)) { // selection is no longer in sync with editor
            if (isTableRowBox(editor.selectedBox) || isElementBox(editor.selectedBox)) {
                // Because neither a TableRowBox nor an ElementBox has its own HTML equivalent,
                // its children are regarded to be selected.
                $selectedBoxes = getSelectableChildren(editor.selectedBox);
                $selectedBoxes.push(editor.selectedBox); // keep this one as well because of the test above
            } else {
                $selectedBoxes = [editor.selectedBox];
                // editor.selectedBox.setFocus(); is done by RenderComponent
            }
        }
    };

    function getSelectableChildren(box: Box): Box[] {
        const result: Box[] = [];
        for (const child of box.children) {
            if (isTableRowBox(child) || isElementBox(child)) {
                result.push(...getSelectableChildren(child));
            } else {
                result.push(child);
            }
        }
        return result;
    }

    const refreshRootBox = (why?: string) => {
        rootBox = editor.rootBox;
        LOGGER.log("REFRESH " + why + " ==================> ProjectItComponent with rootbox " + rootBox?.id);
    };

    refreshRootBox("Initialize ProjectItComponent");
    refreshSelection("Initialize ProjectItComponent");
</script>

<div class={"projectit"}
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
<ContextMenu bind:this={$contextMenu} items={[]} editor={editor}/>

<style>
    .projectit {
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
