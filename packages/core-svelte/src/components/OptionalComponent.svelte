<script lang="ts">
    /**
     * This component display an optional part. It either shows the content of the
     * corresponding OptionalBox, or its placeholder.
     */
    import RenderComponent from "./RenderComponent.svelte";
    import { onDestroy, onMount, afterUpdate } from "svelte";
    import { autorun } from "mobx";
    import { getRoot, OptionalBox, PiLogger, type PiEditor } from "@projectit/core";

    export let box: OptionalBox;
    export let editor: PiEditor;

    const LOGGER = new PiLogger("OptionalComponent"); //.mute();
    let id: string;                             // an id for the html element showing the optional
    id = !!box ? box.id : "optional-with-unknown-box";
    let mustShow = false;
    let showByCondition = false;
    let contentComponent;
    let placeholderComponent;

    const setFocus = async (): Promise<void> => {
        LOGGER.log("OptionalComponent.setFocus on box " + box.role);
        if (mustShow || showByCondition && !!contentComponent) {
            box.content.setFocus();
        } else if (!!placeholderComponent) {
            box.placeholder.setFocus();
        } else {
            console.error("OptionalComponent " + id + " has no elements to put focus on");
        }
    };

    onMount(() => {
        // LOGGER.log("onMount")
        // Overwrite the setFocus method of the box, in order to handle focus correctly.
        box.setFocus = setFocus;
        mustShow = box.mustShow;
        showByCondition = box.showByCondition;
    });

    autorun(() => {
        // todo should setFocus be here as well?
        mustShow = box.mustShow;
        showByCondition = box.showByCondition;
    });

</script>

<span class="optional"
      id="{id}"
>
    {#if mustShow || showByCondition}
        <RenderComponent box={box.content} editor={editor} bind:this={contentComponent}/>
    {:else}
        <RenderComponent box={box.placeholder} editor={editor} bind:this={placeholderComponent}/>
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
