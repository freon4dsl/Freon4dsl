<script lang="ts">
    import RenderComponent from "./RenderComponent.svelte";
    import { onDestroy, onMount, afterUpdate } from "svelte";
    import { autorun } from "mobx";
    import { getRoot, OptionalBox, PiLogger, type PiEditor } from "@projectit/core";

    export let box: OptionalBox;
    export let editor: PiEditor;

    const LOGGER = new PiLogger("OptionalComponent"); //.mute();
    let id: string;                             // an id for the html element showing the optional
    id = !!box ? box.id : 'optional-with-unknown-box';
    let mustShow = false;
    let showByCondition = false;

    const setFocus = async (): Promise<void> => {
        LOGGER.log("OptionalComponent.setFocus on box " + box.role);
        if (mustShow || showByCondition) {
            box.firstEditableChild.setFocus();
        } else {
            box.placeholder.setFocus();
        }
    };

    onMount( () => {
        // LOGGER.log("onMount")
        // Overwrite the setFocus method of the box, in order to handle focus correctly.
        box.setFocus = setFocus;
        mustShow = box.mustShow;
        showByCondition = box.showByCondition;
    });

    autorun( () => {
        mustShow = box.mustShow;
        showByCondition = box.showByCondition;
    });

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
