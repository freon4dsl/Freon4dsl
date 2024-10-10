<svelte:options immutable={true}/>
<script lang="ts">
    import { OPTIONAL_LOGGER } from "$lib/components/ComponentLoggers.js";

    /**
     * This component display an optional part. It either shows the content of the
     * corresponding OptionalBox, or its placeholder.
     */
    import RenderComponent from "./RenderComponent.svelte";
    import { onMount, afterUpdate } from "svelte";
    import { OptionalBox2, FreLogger, type FreEditor, Box } from "@freon4dsl/core";
    import { componentId } from "./svelte-utils/index.js";

    export let box: OptionalBox2;
    export let editor: FreEditor;

    const LOGGER = OPTIONAL_LOGGER
    let id: string;                             // an id for the html element showing the optional
    id = !!box ? componentId(box) : 'optional2-for-unknown-box';
    let childBox: Box;
    let optionalBox: Box;
    let mustShow = false;
    let showByCondition = false;
    let contentComponent: RenderComponent;
    let placeholderComponent: RenderComponent;

    const refresh = (why?: string): void => {
        LOGGER.log("REFRESH OptionalBox2: " + why);
        mustShow = box.mustShow;
        showByCondition = box.condition();
        childBox = box.content;
        optionalBox = box.placeholder;
    };

    async function setFocus(): Promise<void> {
        LOGGER.log("setFocus on box " + box.role);
        if (mustShow || showByCondition && !!contentComponent) {
            box.content.firstEditableChild.setFocus();
        } else if (!!placeholderComponent) {
            box.placeholder.setFocus();
        } else {
            console.error("OptionalComponent2 " + id + " has no elements to put focus on");
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

<span class="optional-component-new"
      id="{id}"
>
    {#if mustShow || showByCondition}
        <span class="optional-component-show">
            <RenderComponent box={childBox} editor={editor} bind:this={contentComponent}/>
        </span>
    {:else}
        <span class="optional-component-hide">
            <RenderComponent box={optionalBox} editor={editor} bind:this={placeholderComponent}/>
        </span>
    {/if}
</span>

