<script lang="ts">
    import {type FreComponentProps, RenderComponent} from "../index.js";
    import { type FragmentBox} from "@freon4dsl/core";
    import ArrowForward from "./images/ArrowForward.svelte";

    let { editor, box }: FreComponentProps<FragmentBox> = $props();

    let isExpanded: boolean = $state(false);
    let contentStyle: string = $state("display: none");

    $effect(() =>{
        if (box!!) {
            // isExpanded = box.isExpanded;
            contentStyle = isExpanded ? "display:block;" : "display:none;";
        }
    })
    function toggleExpanded() {
        isExpanded = !isExpanded;
        contentStyle = isExpanded ? "display:block;" : "display:none;";
    }
</script>

<span class="expandable-component {box.cssClass}">
    {#key isExpanded}
        <button class="expandable-button" onclick={toggleExpanded}>
            <ArrowForward />
        </button>
    {/key}
    {#key contentStyle}
        <div style={contentStyle}>
            <RenderComponent box={box.childBox} {editor} />
        </div>
    {/key}
</span>

<!--   todo move this style to freon.css as soon as this component is available through the .edit file -->
<style>
    .expandable-component {
        display: flex;
    }
</style>
