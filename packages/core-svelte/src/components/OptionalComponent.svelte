<script lang="ts">
    import RenderComponent from "./RenderComponent.svelte";
    import { onDestroy, onMount, afterUpdate } from "svelte";
    import { autorun } from "mobx";
    import { getRoot, OptionalBox, PiLogger, type PiEditor } from "@projectit/core";
    import { FOCUS_LOGGER, MOUNT_LOGGER } from "./ChangeNotifier";

    export let optionalBox: OptionalBox;//= new OptionalBox(null, "boxRole", null, null, null, "This is a box");
    export let editor: PiEditor;

    const LOGGER = new PiLogger("OptionalComponent").mute();
    let id: string = `${optionalBox.element.piId()}-${optionalBox.role}`;
    let childBox ;
    let mustShow = optionalBox.mustShow;
    let showByCondition = false;
    let element: HTMLDivElement = null;

    onDestroy(() => {
        LOGGER.log("DESTROY OPTIONAL COMPONENT ["+ optionalBox.id + "]")
    });

    function refresh() : void  {
        console.log("DIRTY OptionalBox");
        mustShow = optionalBox.mustShow;
        childBox = optionalBox.box;
    }

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
        optionalBox.refreshComponent = refresh;
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
        optionalBox.refreshComponent = refresh;
    });

    // autorun( () => {
        // LOGGER.log("AUTO " + optionalBox.$id + " :" + optionalBox.role + " mustshow: " + optionalBox.mustShow + " condition " + optionalBox.showByCondition + "  child " + optionalBox.box.element.piLanguageConcept() + ":" + optionalBox.box.kind + " : " + optionalBox.box.$id);
        // LOGGER.log("   root " + getRoot(optionalBox).$id);
        // if(optionalBox.box.kind === "HorizontalListBox") {
        //     optionalBox.box.children.forEach( child => {
        //         LOGGER.log("    child " + child.$id + " role " + child.role + " : " + child.kind);
        //     })
        // }
        // mustShow = optionalBox.mustShow;
        // childBox = optionalBox.box;
        // showByCondition = optionalBox.showByCondition;
    // });
</script>

<div class="optional"
     tabIndex={0}
     bind:this={element}
     id="{id}"
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
