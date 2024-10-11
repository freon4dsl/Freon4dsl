<svelte:options immutable={true}/>
<script lang="ts">
    import { OPTIONAL_LOGGER } from "$lib/components/ComponentLoggers.js";

    /**
     * This component display an optional part. It either shows the content of the
     * corresponding OptionalBox, or its placeholder.
     */
    import RenderComponent from "./RenderComponent.svelte";
    import { onMount, afterUpdate } from "svelte";
    import { OptionalBox, FreLogger, type FreEditor, Box } from "@freon4dsl/core";
    import { componentId } from "./svelte-utils/index.js";

    export let box: OptionalBox;
    export let editor: FreEditor;

    const LOGGER = OPTIONAL_LOGGER
    let id: string;                             // an id for the html element showing the optional
    id = !!box ? componentId(box) : 'optional-for-unknown-box';
    let childBox: Box;
    let mustShow = false;
    let showByCondition = false;
    let contentComponent: RenderComponent;
    let placeholderComponent: RenderComponent;

    const refresh = (why?: string): void => {
        LOGGER.log("REFRESH OptionalBox: " + why);
        mustShow = box.mustShow;
        showByCondition = box.condition();
        childBox = box.content;
    };

    async function setFocus(): Promise<void> {
        LOGGER.log("OptionalComponent.setFocus on box " + box.role);
        if (mustShow || showByCondition && !!contentComponent) {
            box.content.firstEditableChild.setFocus();
        } else if (!!placeholderComponent) {
            box.placeholder.setFocus();
        } else {
            console.error("OptionalComponent " + id + " has no elements to put focus on");
        }
    }

    onMount( () => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    afterUpdate( () => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    $: { // Evaluated and re-evaluated when the box changes.
        refresh(box?.$id);
    }
</script>

<span class="optional-component"
      id="{id}"
>
    {#if mustShow || showByCondition}
        <RenderComponent box={childBox} editor={editor} bind:this={contentComponent}/>
    {:else}
        <RenderComponent box={box.placeholder} editor={editor} bind:this={placeholderComponent}/>
    {/if}
</span>

