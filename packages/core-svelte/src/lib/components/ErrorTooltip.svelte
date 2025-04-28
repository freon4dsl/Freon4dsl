<!-- Copied and adapted from https://svelte.dev/repl/dd6754a2ad0547c5b1c1ea37c0293fef?version=4.2.19 -->

<script lang="ts">
    import { Box } from '@freon4dsl/core';
    import type {ErrorProps} from "$lib";

    let { editor, box, hasErr, parentLeft, parentTop, children }: ErrorProps<Box> = $props();

    let content: string[] = $state([]);
    let isHovered: boolean = $state(false);

    // position of error message(s)
    let top = $state(0);
    let left = $state(0);

    async function mouseOver(event: MouseEvent) {
        if (hasErr) {
            isHovered = true;
            // Get the position of the mouse relative to the editor view and - if applicable - to its ErrorMarker parent.
            // Because an ErrorMarker also has its 'position' set to something other than 'static', we need to take its position into account.
            const rect = editor.getClientRectangle();
            left = event.pageX - rect.x - parentLeft + 5;
            top = event.pageY - rect.y - parentTop + 5;
            // console.log(`ErrorTooltip: left-top [${left}, ${top}] event [${event.pageX}, ${event.pageY}] parent [${parentLeft}, ${parentTop}] viewport [${$viewport.left}, ${$viewport.top}]`)
            content = box.errorMessages;
        }
    }
    function mouseMove(event: MouseEvent) {
        if (hasErr && isHovered) {
            // Get the position of the mouse relative to the editor view and - if applicable - to its ErrorMarker parent.
            // Because an ErrorMarker also has its 'position' set to something other than 'static'.
            const rect = editor.getClientRectangle();
            left = event.pageX - rect.x - parentLeft + 5;
            top = event.pageY - rect.y - parentTop + 5;
        }
    }
    function mouseLeave() {
        isHovered = false;
    }

    // Empty function to avoid error: "Svelte: A11y: on:mouseover must be accompanied by on:focus"
    function onFocus() {}
</script>

<span
    role="group"
    onmouseover={mouseOver}
    onmouseleave={mouseLeave}
    onmousemove={mouseMove}
    onfocus={onFocus}
>
    {@render children()}
</span>

{#if isHovered}
    <div style="top: {top}px; left: {left}px;" class="error-tooltip">
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
