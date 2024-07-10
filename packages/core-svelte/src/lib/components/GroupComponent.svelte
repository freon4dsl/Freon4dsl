<svelte:options immutable={true}/>
<script lang="ts">
    /**
     * This component expands/collapses the child of its (Expandable)Box.
     * with non-editable text
     */
    import { onMount, afterUpdate } from "svelte";
    import { Box, FreLogger, GroupBox, FreEditor } from "@freon4dsl/core";
    import { componentId } from "./svelte-utils/index.js";
    import RenderComponent from "./RenderComponent.svelte";

    import { Button } from 'flowbite-svelte';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
    import { faChevronDown, faChevronUp, faPlus, faEllipsis } from '@fortawesome/free-solid-svg-icons';

    export let box: GroupBox;
    export let editor: FreEditor;

    const LOGGER = new FreLogger("GroupComponent");

    let id: string = !!box ? componentId(box) : 'group-for-unknown-box';
    let element: HTMLDivElement = null;
    let content: HTMLDivElement = null;
    let style: string;
    let cssClass: string;
    let label: string;
    let level: number;
    let child: Box;
    let isExpanded = false; 

    onMount( () => {
        if (!!box) {
            box.refreshComponent = refresh;
        }
    });

    afterUpdate( () => {
        if (!!box) {
            box.refreshComponent = refresh;
        }
    });

    const refresh = (why?: string) => {
        LOGGER.log("REFRESH GroupComponent (" + why + ")");
        if (!!box) {
            label = box.getLabel();
            style = box.cssStyle;
            cssClass = box.cssClass;
            child = box?.child;
        }
    };

    $: { // Evaluated and re-evaluated when the box changes.
        refresh("FROM component " + box?.id);
    }

    function toggleButton() {
        content.style.display = content.style.display === "block" ? "none" : "block";
        isExpanded = !isExpanded;
    }
</script>

<div bind:this={element} id="{id}" class="group {cssClass}" style="{style}">
    {#key isExpanded}
        <Button pill={true} class="w-7 h-7 p0" color="none" size="xs" on:click={toggleButton}>
            <FontAwesomeIcon class="w-3 h-3" icon={isExpanded ? faChevronUp : faChevronDown} />
        </Button>
    {/key}
    <span class="group-label">{label}</span>
    <Button pill={true} size="xs" class="w-7 h-7 p-0 button-transparent" outline>
        <FontAwesomeIcon class="w-3 h-3" icon={faPlus} />
    </Button>
    <Button pill={true} size="xs" class="w-7 h-7 p-0 button-transparent" outline>
        <FontAwesomeIcon class="w-3 h-3" icon={faEllipsis} />
    </Button> 
</div>
<div bind:this={content} style="display:none">
    <RenderComponent box={child} editor={editor}/>
</div>

<style>
    .group:empty:before {
        content: attr(data-placeholdertext);
        margin: var(--freon-group-component-margin, 1px);
        padding: var(--freon-group-component-padding, 1px);
        background-color: var(--freon-group-component-background-color, inherit);
    }
    .group {
        display: inline-block;
        height: 36px;
        background-color: var(--freon-group-background-color, inherit);
    }
    .group-label {
        color: var(--freon-group-component-color, inherit);
        font-style: var(--freon-group-component-font-style, inherit);
        font-weight: var(--freon-group-component-font-weight, normal);
        font-size: var(--freon-group-component-font-size, inherit);
        font-family: var(--freon-group-component-font-family, "inherit");
        padding: var(--freon-group-component-padding, 1px);
        margin: var(--freon-group-component-margin, 1px);
        white-space: normal;
    }
    .button-transparent {
        background-color: transparent !important;
        border-color: transparent !important;
    }
</style>
