<script lang="ts">
    import {
        ARROW_DOWN,
        ARROW_LEFT, ARROW_RIGHT,
        ARROW_UP,
        BACKSPACE, boxAbove, boxBelow,
        DELETE,
        PiEditor,
        TAB, PiLogger, Box
    } from "@projectit/core";
    import { autorun } from "mobx";
    import RenderComponent from "./RenderComponent.svelte";

    let LOGGER = new PiLogger("ProjectItComponent").mute();
    export let editor: PiEditor;

    function eventHandled(e: KeyboardEvent) {
        e.preventDefault();
        e.stopPropagation();
    }

    const onKeyDown = async (event: KeyboardEvent) => {
        LOGGER.log("onKeyDown: " + event.key);
        // event.persist();
        if (event.ctrlKey) {
            switch (event.keyCode) {
                case ARROW_UP:
                    editor.selectParentBox();
                    eventHandled(event);
                    break;
                case ARROW_DOWN:
                    editor.selectFirstLeafChildBox();
                    eventHandled(event);
                    break;
            }
        } else if (event.shiftKey) {
            switch (event.keyCode) {
                case TAB:
                    await editor.selectPreviousLeaf();
                    eventHandled(event);
                    break;
            }
        } else if (event.altKey) {
            // All alt keys here
        } else {
            switch (event.keyCode) {
                case BACKSPACE:
                case ARROW_LEFT:
                    await editor.selectPreviousLeaf();
                    // TODO this.eventHandled(event);
                    break;
                case DELETE:
                    editor.deleteBox(editor.selectedBox);
                    break;
                case TAB:
                case ARROW_RIGHT:
                    editor.selectNextLeaf();
                    // TODO this.eventHandled(event);
                    break;
                case ARROW_DOWN:
                    LOGGER.log("Down: " + editor.selectedBox.role);
                    const down = boxBelow(editor.selectedBox);
                    if (down !== null) {
                        editor.selectBoxNew(down);
                    }
                    break;
                case ARROW_UP:
                    LOGGER.log("Up: " + editor.selectedBox.role);
                    const up = boxAbove(editor.selectedBox);
                    if (up !== null) {
                        editor.selectBoxNew(up);
                    }
                    break;
            }
        }
        event.stopPropagation();
    };

    let rootBox: Box;
    autorun( () => {
        rootBox = editor.rootBox;
    });

</script>

<!-- The clientHeight bindiong is here to ensure that the afterUpdate is fired.
     If it isn't there, afterUpdate will never be fired.
-->
<div class={"projectit"}
     tabIndex={0}
     on:keydown={onKeyDown}
>
    <RenderComponent editor={editor}
                     box={rootBox}
    />
</div>

<style>
    .projectit {
        height: 100%;
        font-size: 14px;
        width: 100%;
        color: var(--pi-darkblue);
        overflow-x: auto;
        background: var(--pi-editor-background);
        background-color: var(--pi-editor-background);
    }

    input, button, select, textarea {
        font-family: inherit;
        font-size: inherit;
        -webkit-padding: 0.4em 0;
        padding: 0.4em;
        margin: 0 0 0.5em 0;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 2px;
    }

    input:disabled {
        color: #ccc;
    }

    button {
        color: #333;
        background-color: #f4f4f4;
        outline: none;
    }

    button:disabled {
        color: #999;
    }

    button:not(:disabled):active {
        background-color: #ddd;
    }

    button:focus {
        border-color: #666;
    }
    .grid {
        display: inline-grid;
        grid-gap: 10px;
        align-items: center;
        align-content: center;
        justify-items: stretch;
    }

    .gridcell {
        padding: 4px;
        border-left: lightgrey;
        border-left-style: solid;
        border-left-width: 1px;
        border-right: lightgrey;
        border-right-style: solid;
        border-right-width: 1px;
        border-bottom: lightgrey;
        border-bottom-style: solid;
        border-bottom-width: 1px;
    }



</style>
