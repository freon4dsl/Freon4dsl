<script lang="ts">
    import {
        ARROW_DOWN,
        ARROW_LEFT, ARROW_RIGHT,
        ARROW_UP,
        BACKSPACE, boxAbove, boxBelow,
        DELETE,
        Box,
        LabelBox,
        PiEditor,
        TAB, PiLogger
    } from "@projectit/core";
    import { autorun } from "mobx";
    import { afterUpdate, tick } from "svelte";

    // Parameters
    export let box: Box = new LabelBox(null, "DUMMY", "LABEL");
    export let editor: PiEditor ;

    let LOGGER = new PiLogger("SelectableComponent").mute();
    let isSelected: boolean = false;
    let className: string;
    let element: HTMLDivElement = null;

    const onClick = (event: MouseEvent) => {
        LOGGER.log("SelectableComponent.onClick:n "+ event);
        isSelected = !isSelected;

        if (box.selectable) {
            LOGGER.log("===> selected box " + box.role);
            editor.selectedBox = box;
            event.preventDefault();
            event.stopPropagation();
        }

    };

    afterUpdate ( async () => {
        LOGGER.log("!!!!! SelectableComponent.afterupdate, box="+ box);
        // await tick();
        if(element === null){
            return;
        }
        const rect: ClientRect = element.getBoundingClientRect();
        if(box !== null){
            box.actualX = rect.left;
            box.actualY = rect.top;
            box.actualHeight = rect.height;
            box.actualWidth = rect.width;
            LOGGER.log("   actual is "+ box.actualWidth)
        }
    });

    autorun( () => {
        isSelected = editor.selectedBox === box;
    })

    $: className = (isSelected ? "selectedComponent" : "unSelectedComponent");
</script>

<!-- NOTE The clientHeight binding is here to ensure that the afterUpdate is fired.
     If it isn't there, afterUpdate will never be fired.
-->
<div class={className}
     tabIndex={0}
     on:click={onClick}

     bind:clientHeight={box.actualHeight}
     bind:this={element} >
    <slot class="slot" editor={editor}/>
</div>

<style>
    .slot {
        display: inline;
    }
    .unSelectedComponent {
        background: transparent;
        border: 1px solid transparent;
        display: inline-block;
        vertical-align: middle;
    }

    .selectedComponent {
        height: 100%;
        background-color: var(--pi-selected-background-color);
        border: 1px solid darkblue;
        display: inline-block;
        vertical-align: middle;
        border-radius: 3px;
    }
</style>
