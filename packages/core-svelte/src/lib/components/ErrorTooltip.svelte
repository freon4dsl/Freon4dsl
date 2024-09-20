<!-- Copied and adapted from https://svelte.dev/repl/hello-world?version=4.2.19 -->

<script lang="ts">
    import { viewport } from "./svelte-utils/EditorViewportStore.js";

    export let content: string[] = [];
    export let hasErr: boolean = false;
    let isHovered: boolean = false;
    let x: number;
    let y: number;

    function mouseOver(event: MouseEvent) {
        // todo adjust height for header
        if (hasErr) {
            isHovered = true;
            // get the position of the mouse relative to the editor view
            x = event.pageX - $viewport.left + 5;
            y = event.pageY - $viewport.top + 5;
        }
    }
    function mouseMove(event: MouseEvent) {
        if (hasErr) {
            // get the position of the mouse relative to the editor view
            x = event.pageX - $viewport.left + 5;
            y = event.pageY - $viewport.top + 5;
        }
    }
    function mouseLeave() {
        isHovered = false;
    }
    function onFocus() {
    }
</script>

<div role= "group"
     on:mouseover={mouseOver}
     on:mouseleave={mouseLeave}
     on:mousemove={mouseMove}
     on:focus={onFocus}>
    <slot />
</div>

{#if isHovered}
    <div style="top: {y}px; left: {x}px;" class="error-tooltip">
        {#if content.length > 1}
            <ul class="error-tooltip-list">
                {#each content as item}
                    {#if item.length > 0}
                        <li>{item}</li>
                    {/if}
                {/each}
            </ul>
        {:else}
            {content[0]}
        {/if}

    </div>
{/if}
