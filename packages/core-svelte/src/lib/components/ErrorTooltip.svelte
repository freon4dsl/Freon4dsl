<!-- Copied and adapted from https://svelte.dev/repl/hello-world?version=4.2.19 -->

<script lang="ts">
    import { viewport } from "./svelte-utils/EditorViewportStore.js";

    export let content: string[] = [];
    export let hasErr: boolean = false;
    let isHovered: boolean = false;
    let x: number;
    let y: number;

    function mouseOver(event: MouseEvent) {
        if (hasErr) {
            isHovered = true;
            // get the position of the mouse relative to the editor view
            // console.log(`Postion: event.pageY ${event.pageY}, event.pageX ${event.pageX}, viewport.top ${$viewport.top}, viewport.left ${$viewport.left}`)
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

<span role= "group"
     on:mouseover={mouseOver}
     on:mouseleave={mouseLeave}
     on:mousemove={mouseMove}
     on:focus={onFocus}>
    <slot />
</span>

{#if isHovered}
    <div style="top: {y}px; left: {x}px; z-index: 95; position: absolute;" class="error-tooltip">
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
