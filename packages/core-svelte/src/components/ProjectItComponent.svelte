<script lang="ts">
    import { onMount } from "svelte";
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
        ARROW_RIGHT
    } from "@projectit/core";
    import { autorun } from "mobx";
    import RenderComponent from "./RenderComponent.svelte";
    import ContextMenu from "./ContextMenu.svelte";
    import { contextMenuVisible, contextMenu } from "./svelte-utils/ContextMenuStore.js";
    import {viewport} from "./svelte-utils/EditorViewportStore";

    let LOGGER = new PiLogger("ProjectItComponent"); //.mute();
    export let editor: PiEditor;
    // TODO add id
    // let id: string = `${box.element.piId()}-${box.role}`;
    let element: HTMLDivElement; // The current main element of this component.
    let rootBox: Box;

    function stopEvent(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    const onKeyDown = (event: KeyboardEvent) => {
        console.log("ProjectItComponent onKeyDown: " + event.key + " ctrl: " + event.ctrlKey + " alt: " + event.altKey);
        // event.persist();
        if (event.ctrlKey || event.altKey) {
            switch (event.key) {
                case ARROW_UP:
                    editor.selectParentBox();
                    event.preventDefault();
                    break;
                case ARROW_DOWN:
                    editor.selectFirstLeafChildBox();
                    event.preventDefault();
                    break;
            }
        } else if (event.shiftKey) {
            switch (event.key) {
                case TAB:
                    editor.selectPreviousLeaf();
                    event.preventDefault();
                    break;
            }
        } else if (event.altKey) {
            // All alt keys here
        } else {
            // No meta key pressed
            // todo adjust to multiple selections
            switch (event.key) {
                case BACKSPACE:
                case ARROW_LEFT:
                    editor.selectPreviousLeaf();
                    stopEvent(event)
                    break;
                case DELETE:
                    console.log('ProjectItComponent DELETE')
                    editor.deleteBox(editor.selectedBox);
                    stopEvent(event);
                    break;
                case TAB:
                case ARROW_RIGHT:
                    editor.selectNextLeaf();
                    stopEvent(event);
                    break;
                case ARROW_DOWN:
                    const down = editor.boxBelow(editor.selectedBox);
                    LOGGER.log("!!!!!!! Select down box " + down?.role);
                    if (down !== null && down !== undefined) {
                        editor.selectBoxNew(down);
                    }
                    stopEvent(event);
                    break;
                case ARROW_UP:
                    LOGGER.log("Up: " + editor.selectedBox.role);
                    const up = editor.boxAbove(editor.selectedBox);
                    if (up !== null) {
                        editor.selectBoxNew(up);
                    }
                    stopEvent(event);
                    break;
            }
        }
        event.stopPropagation();
    };

    autorun(() => {
        rootBox = editor.rootBox;
    });

    /**
     * Keep track of the scrolling position in the editor, so we know exactly where boxes are
     * in relationship with each other.
     */
    function onScroll() {
        // Hide any contextmenu upon scrolling, because its position will not be correct.
        $contextMenuVisible = false;
        // todo should we use a timeOut here?
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
                // But I have no idea why.
                let rect = entry.target.getBoundingClientRect();
                $viewport.setSizes(rect.height, rect.width, rect.top, rect.left);
            }, 400); // Might use another value for the delay, but this seems ok.
        });

        // Observe the ProjectItComponent element.
        resizeObserver.observe(element);

        // This callback cleans up the observer.
        return () => resizeObserver.unobserve(element);
    });
</script>


<div class={"projectit"}
     on:keydown={onKeyDown}
     on:scroll={onScroll}
     bind:this={element}
>
    <RenderComponent editor={editor}
                     box={rootBox}
    />
</div>
<!-- Here the only instance of ContextMenu is defined -->
<!-- TODO make some default items for the context menu -->
<ContextMenu bind:this={$contextMenu} items={[]}/>


<style>
    .projectit {
        height: 100%;
        width: 100%;
        font-size: var(--freon-editor-component-font-size, 14px);
        font-style: var(--freon-editor-component-font-style, italic);
        font-weight: var(--freon-editor-component-font-weight, normal);
        font-family: var(--freon-editor-component-font-family, "Arial");
        color: var(--freon-editor-component-color, darkblue);
        background-color: var(--freon-editor-component-background-color, white);
        margin: var(--freon-editor-component-margin, 1px);
        padding: var(--freon-editor-component-padding, 1px);
        box-sizing: border-box;
        position: relative;
        overflow: auto;
        /* show a box shadow similar to the one for the info panel */
        box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2),0 1px 1px 0 rgba(0, 0, 0, 0.14),0 1px 3px 0 rgba(0,0,0,.12);
        border-radius: 4px;
        /* end box shadow */
    }
</style>
