<script lang="ts">
    import RenderComponent from "./RenderComponent.svelte";
    import { onDestroy, onMount, afterUpdate } from "svelte";
    import { autorun } from "mobx";
    import { getRoot, OptionalBox, PiLogger, type PiEditor } from "@projectit/core";
    import {componentId} from "./svelte-utils";

    export let box: OptionalBox;
    export let editor: PiEditor;

    const LOGGER = new PiLogger("OptionalComponent").mute();
    let id: string;                             // an id for the html element showing the optional
    id = !!box ? componentId(box) : 'optional-with-unknown-box';
    let mustShow = false;
    let showByCondition = false;

    const setFocus = async (): Promise<void> => {
        LOGGER.log("OptionalComponent.setFocus on box " + box.role);
        // if (mustShow || showByCondition) {
        //     box.firstEditableChild.setFocus();
        // } else {
        //     box.whenNoShowingAlias.setFocus();
        // }
    };

    onMount( () => {
        // MOUNT_LOGGER.log("OptionalComponent onMount --------------------------------")
        box.setFocus = setFocus;
        mustShow = box.mustShow;
        showByCondition = box.showByCondition;
    });

    // afterUpdate( () => {
    //     LOGGER.log("AfterUpdate " + box.$id + " :" + box.role + " mustshow: " + box.mustShow + " condition " + box.showByCondition + "  child " + box.box.element.piLanguageConcept() + ":" + box.box.kind + " : " + box.box.$id);
    //     LOGGER.log("   root " + getRoot(box).$id);
    //     if(box.box.kind === "HorizontalListBox") {
    //         box.box.children.forEach(child => {
    //             LOGGER.log("    child " + child.$id + " role " + child.role + " : " + child.kind);
    //         })
    //     }
    //     box.setFocus = setFocus;
    // });

    // autorun( () => {
    //     LOGGER.log("AUTO " + box.$id + " :" + box.role + " mustshow: " + box.mustShow + " condition " + box.showByCondition + "  child " + box.box.element.piLanguageConcept() + ":" + box.box.kind + " : " + box.box.$id);
    //     LOGGER.log("   root " + getRoot(box).$id);
    //     if(box.box.kind === "HorizontalListBox") {
    //         box.box.children.forEach(child => {
    //             LOGGER.log("    child " + child.$id + " role " + child.role + " : " + child.kind);
    //         })
    //     }
    //     mustShow = box.mustShow;
    //     childBox = box.box;
    //     showByCondition = box.showByCondition;
    // });
</script>

<span class="optional"
     id="{id}"
>
    {#if mustShow || showByCondition}
        <RenderComponent box={box.content} editor={editor} />
    {:else}
        <RenderComponent box={box.placeholder} editor={editor} />
    {/if}
</span>

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
