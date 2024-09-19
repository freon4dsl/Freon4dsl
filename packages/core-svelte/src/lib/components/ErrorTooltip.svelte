<!-- Copied and adapted from https://svelte.dev/repl/hello-world?version=4.2.19 -->

<script lang="ts">
    export let content: string = '';
    export let hasErr: boolean = false;
    let isHovered: boolean = false;
    let x: number;
    let y: number;

    function mouseOver(event: MouseEvent) {
        // todo adjust height for header
        if (hasErr) {
            isHovered = true;
            x = event.pageX + 5;
            y = event.pageY + 5;
        }
    }
    function mouseMove(event: MouseEvent) {
        if (hasErr) {
            x = event.pageX + 5;
            y = event.pageY + 5;
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
    <div style="top: {y}px; left: {x}px;" class="tooltip">{content}</div>
{/if}

<style>
    .tooltip {
        border: 1px solid #ddd;
        box-shadow: 1px 1px 1px #ddd;
        background: white;
        border-radius: 4px;
        padding: 4px;
        position: absolute;
    }
</style>
