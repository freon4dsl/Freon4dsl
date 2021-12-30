<script lang="ts">
    import RenderComponent from "./RenderComponent.svelte";
    import { onDestroy, onMount, afterUpdate } from "svelte";
    import { autorun } from "mobx";
    import { getRoot, OptionalBox, PiLogger } from "@projectit/core";
    import type { PiEditor } from "@projectit/core";
    import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER } from "./ChangeNotifier";

    export let optionalBox;//= new OptionalBox(null, "boxRole", null, null, null, "This is a box");
    export let editor: PiEditor;

    const LOGGER = new PiLogger("OptionalComponent");

    onDestroy(() => {
        LOGGER.log("DESTROY OPTIONAL COMPONENT ["+ optionalBox.id + "]")
    });

    let mustShow = false;
    let showByCondition = false;

    let element: HTMLDivElement =null;
    const setFocus = async (): Promise<void> => {
        FOCUS_LOGGER.log("OptionalComponent.setFocus on box " + optionalBox.role);
        if (mustShow || showByCondition) {
            optionalBox.box.firstEditableChild.setFocus();
        } else {
            optionalBox.whenNoShowingAlias.setFocus();
        }
    };

    onMount( () => {
        MOUNT_LOGGER.log("OptionalComponent onMount --------------------------------")
        optionalBox.setFocus = setFocus;
    });
    afterUpdate( () => {
        LOGGER.log("AfterUpdate " + optionalBox.$id + " :" + optionalBox.role + " mustshow: " + optionalBox.mustShow + " condition " + optionalBox.showByCondition + "  child " + optionalBox.box.element.piLanguageConcept() + ":" + optionalBox.box.kind + " : " + optionalBox.box.$id);
        LOGGER.log("   root " + getRoot(optionalBox).$id);
        if(optionalBox.box.kind === "HorizontalListBox") {
            optionalBox.box.children.forEach( child => {
                LOGGER.log("    child " + child.$id + " role " + child.role + " : " + child.kind);
            })
        }

        optionalBox.setFocus = setFocus;
    });

    let childBox ;

    autorun( () => {
        LOGGER.log("AUTO " + optionalBox.$id + " :" + optionalBox.role + " mustshow: " + optionalBox.mustShow + " condition " + optionalBox.showByCondition + "  child " + optionalBox.box.element.piLanguageConcept() + ":" + optionalBox.box.kind + " : " + optionalBox.box.$id);
        LOGGER.log("   root " + getRoot(optionalBox).$id);
        if(optionalBox.box.kind === "HorizontalListBox") {
            optionalBox.box.children.forEach( child => {
                LOGGER.log("    child " + child.$id + " role " + child.role + " : " + child.kind);
            })
        }
        mustShow = optionalBox.mustShow;
        childBox = optionalBox.box;
        showByCondition = optionalBox.showByCondition;
    });
</script>

<div class="optional"
     tabIndex={0}
     bind:this={element}
>
    {#if mustShow || showByCondition}
        <RenderComponent box={optionalBox.box} editor={editor} />
    {:else}
         <RenderComponent box={optionalBox.whenNoShowingAlias} editor={editor} />
    {/if}
</div>

<style>
    .optional:empty:before {
        content: attr(data-placeholdertext);
    }

    .optional {
        padding: 3px;
        white-space: normal;
        display: inline-block;
    }
</style>
