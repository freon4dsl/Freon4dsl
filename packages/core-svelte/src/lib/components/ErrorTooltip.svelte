<!-- Copied and adapted from https://svelte.dev/repl/dd6754a2ad0547c5b1c1ea37c0293fef?version=4.2.19 -->

<script lang="ts">
    import { viewport } from "$lib/components/svelte-utils/EditorViewportStore.js";
    import {Box} from "@freon4dsl/core";

    export let box: Box;
    export let hasErr: boolean = false;
    export let parentTop: number = 0;
    export let parentLeft: number = 0;
    let content: string[] = [];
    let isHovered: boolean = false;
    // position of error message(s)
    let top = 0;
    let left = 0;

    async function mouseOver(event: MouseEvent) {
        if (hasErr) {
            isHovered = true;
            // Get the position of the mouse relative to the editor view and - if applicable - to its ErrorMarker parent.
            // Because an ErrorMarker also has its 'position' set to something other than 'static', we need to take its position into account.
            left = event.pageX - $viewport.left - parentLeft + 5;
            top = event.pageY - $viewport.top - parentTop + 5;
            // console.log(`ErrorTooltip: left-top [${left}, ${top}] event [${event.pageX}, ${event.pageY}] parent [${parentLeft}, ${parentTop}] viewport [${$viewport.left}, ${$viewport.top}]`)
            content = box.errorMessages;
        }
    }
    function mouseMove(event: MouseEvent) {
        if (hasErr && isHovered) {
            // Get the position of the mouse relative to the editor view and - if applicable - to its ErrorMarker parent.
            // Because an ErrorMarker also has its 'position' set to something other than 'static'.
            left = event.pageX - $viewport.left - parentLeft + 5;
            top = event.pageY - $viewport.top - parentTop + 5;
        }
    }
    function mouseLeave() {
        isHovered = false;
    }

    // Empty function to avoid error: "Svelte: A11y: on:mouseover must be accompanied by on:focus"
    function onFocus() {
    }
</script>

<span role= "group"
     on:mouseover={mouseOver}
     on:mouseleave={mouseLeave}
     on:mousemove={mouseMove}
     on:focus={onFocus}
     >
    <slot />
</span>

{#if isHovered}
    <div
         style="top: {top}px; left: {left}px;"
         class="error-tooltip"
    >
        {#if content.length > 1}
            <ol class="error-tooltip-list-content">
                {#each content as item}
                    {#if item.length > 0}
                        <li>{item}</li>
                    {/if}
                {/each}
            </ol>
        {:else}
            <span class="error-tooltip-single-content">{content[0]} </span>
        {/if}
    </div>
{/if}
