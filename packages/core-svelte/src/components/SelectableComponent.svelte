<script lang="ts">
// Since Svelte does not support inheritance, but in stead only uses composition,
// any component that can be selected is surrounded by this component.
// This component takes care of handling mouse clicks and adjusts the styling
// when its slot component is (un)selected. Also, the dimensions of the slot
// component are calculated after each update.

    import {
        Box,
        LabelBox,
        PiEditor,
        PiLogger
    } from "@projectit/core";
    import { autorun } from "mobx";
    import { afterUpdate } from "svelte";
    import { AUTO_LOGGER } from "./ChangeNotifier";

    // Parameters
    export let box: Box;
    export let editor: PiEditor;

    let LOGGER = new PiLogger("SelectableComponent").mute();

    let isSelected: boolean = false;
    let className: string;
    let element: HTMLDivElement = null;
    let id: string = `selectable-${box.element.piId()}-${box.role}`;

    const onClick = (event: MouseEvent) => {
        LOGGER.log("SelectableComponent.onClick: " + event + " for box " + box.role);
        isSelected = !isSelected;

        if (box.selectable) {
            LOGGER.log("       ===> selected box " + box.role);
            editor.selectedBox = box;
            event.preventDefault();
            event.stopPropagation();
        }
    };

    afterUpdate( () => {
        LOGGER.log("!!!!! SelectableComponent.afterupdate for box " + box.role + " element " + box.element.piId());
        if (element === null) {
            return;
        }
        const rect: DOMRect = element.getBoundingClientRect();
        if (box !== null && box !== undefined) {
            box.actualX = rect.left;
            box.actualY = rect.top;
            box.actualHeight = rect.height;
            box.actualWidth = rect.width;
            // XLOGGER.log("   actual is (" + Math.round(box.actualX) + ", " + Math.round(box.actualY) + ")");
        }

        if (isSelected) {
            // console.log("     setting focus from afterupdate to box " + box.role);
            box.setFocus();
        }
    });

    autorun(() => {
        AUTO_LOGGER.log("SelectableComponent for box: " + box.role);
        isSelected = editor?.selectedBox === box;
        className = (isSelected ? "selectedComponent" : "unSelectedComponent");
        if (isSelected) {
            // console.log("     setting focus from AUTO  to box " + box.role);
            box.setFocus();
        }
    });
</script>

<!-- NOTE The clientHeight binding is here to ensure that the afterUpdate is fired.
     If it isn't there, afterUpdate will never be fired.
-->
<div class={className}
     tabIndex={0}
     on:click={onClick}
     bind:clientHeight={box.actualHeight}
     bind:this={element}
     id="{id}"
>
    <slot class="slot" editor={editor} />
</div>

<style>
    .slot {
        display: inline;
    }

    .unSelectedComponent {
        background: transparent;
        border: none;
        display: inline-block;
        vertical-align: middle;
    }

    .selectedComponent {
        background-color: var(--freon-selected-background-color, rgba(211, 227, 253, 255));
        outline-color: var(--freon-selected-outline-color, darkblue);
        outline-style: var(--freon-selected-outline-style, solid);
        outline-width: var(--freon-selected-outline-width, 1px);
        box-sizing: border-box;
        display: inline-block;
        vertical-align: middle;
        /*border-radius: 3px;*/
    }
</style>
