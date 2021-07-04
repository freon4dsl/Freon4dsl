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
                        await editor.selectBox(down);
                    }
                    break;
                case ARROW_UP:
                    LOGGER.log("Up: " + editor.selectedBox.role);
                    const up = boxAbove(editor.selectedBox);
                    if (up !== null) {
                        editor.selectBox(up);
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
        color: black;
        overflow-x: auto;
    }


</style>
