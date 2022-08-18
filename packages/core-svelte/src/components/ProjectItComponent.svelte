<script lang="ts">
    /**
     * This component is the main component in the complete editor.
     * It renders the rootbox of the PiEditor.
     */
    import {
        PiEditor,
        PiLogger,
        Box,
        KEY_ARROW_UP,
        KEY_ARROW_DOWN,
        KEY_TAB,
        KEY_BACKSPACE,
        KEY_ARROW_LEFT,
        KEY_DELETE,
        KEY_ARROW_RIGHT
    } from "@projectit/core";
    import { autorun } from "mobx";
    import { AUTO_LOGGER } from "./ChangeNotifier";
    import RenderComponent from "./RenderComponent.svelte";

    export let editor: PiEditor;
    let LOGGER = new PiLogger("ProjectItComponent").mute();
    let element: HTMLDivElement;
    let rootBox: Box;
    // let id: string = `${box.element.piId()}-${box.role}`; // TODO add id

    /**
     * Helper function: stop the event from propagating and executing its default action
     * @param event
     */
    function stopEvent(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Handles key storkes that are avialable everywhere in the editor.
     * @param event
     */
    const onKeyDown = (event: KeyboardEvent) => {
        LOGGER.log("onKeyDown: " + event.key + " ctrl: " + event.ctrlKey + " alt: " + event.altKey);
        // event.persist();
        if (event.ctrlKey || event.altKey) {
            switch (event.key) {
                case KEY_ARROW_UP:
                    editor.selectParentBox();
                    event.preventDefault();
                    break;
                case KEY_ARROW_DOWN:
                    editor.selectFirstLeafChildBox();
                    event.preventDefault();
                    break;
            }
        } else if (event.shiftKey) {
            switch (event.key) {
                case KEY_TAB:
                    editor.selectPreviousLeaf();
                    event.preventDefault();
                    break;
            }
        } else if (event.altKey) {
            // All alt keys here
        } else {
            // No meta key pressed
            switch (event.key) {
                case KEY_BACKSPACE:
                case KEY_ARROW_LEFT:
                    editor.selectPreviousLeaf();
                    stopEvent(event)
                    break;
                case KEY_DELETE:
                    editor.deleteBox(editor.selectedBox);
                    stopEvent(event);
                    break;
                case KEY_TAB:
                case KEY_ARROW_RIGHT:
                    editor.selectNextLeaf();
                    stopEvent(event);
                    break;
                case KEY_ARROW_DOWN:
                    editor.selectBoxUnder();
                    stopEvent(event);
                    break;
                case KEY_ARROW_UP:
                    editor.selectBoxAbove();
                    stopEvent(event);
                    break;
            }
        }
        event.stopPropagation();
    };

    autorun(() => {
        AUTO_LOGGER.log("==================> ProjectItComponent")
        rootBox = editor.rootBox;
    });

    /**
     * Keep track of the scrolling position in the editor, so we know exactly where boxes are
     * in relationship with each other.
     */
    function onScroll() {
        editor.scrollX = element.scrollLeft;
        editor.scrollY = element.scrollTop;
    }
</script>

<div class={"projectit"}
     tabIndex={0}
     on:keydown={onKeyDown}
     on:scroll={onScroll}
     bind:this={element}
>
    <RenderComponent editor={editor}
                     box={rootBox}
    />
</div>
<!-- 	tabIndex="0" is needed for the keydown event to function!!!	 -->

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
