<!-- adjusted from https://github.com/sveltejs/svelte-repl/blob/master/src/SplitPane.svelte -->
<script lang="ts">
    // todo comment on changes
    // import { createEventDispatcher, onMount } from 'svelte';
    // const dispatch = createEventDispatcher();

    export let type = 'vertical'; /* difference with original */
    export let pos = 50;
    export let fixed = false;
    export let buffer = 42;
    export let min = 10; /* difference with original */
    export let max = 100; /* difference with original */
    let w;
    let h;
    let wa;  /* width of pane A */ /* difference with original */
    let ha;  /* height of pane A */ /* difference with original */
    let wb;  /* width of pane B */ /* difference with original */
    let hb;  /* height of pane B */ /* difference with original */
    $: h = ha + hb; /* difference with original */
    $: w = wa + wb; /* difference with original */
    $: size = type === 'vertical' ? h : w;
    $: min = 100 * (buffer / size);
    $: max = 100 - min;
    $: pos = clamp(pos, min, max);
    let container: HTMLElement;
    let dragging = false;

    /* difference with original */
    /**
     * Clamp `num` to the range `[min, max]`
     * copied from https://github.com/Rich-Harris/yootils/blob/master/src/number/clamp.js
     * @param {number} num
     * @param {number} min
     * @param {number} max
     */
    function clamp(num, min, max) {
        return num < min ? min : num > max ? max : num;
    }

    function setPos(event) {
        const { top, left } = container.getBoundingClientRect();
        const px = type === 'vertical'
            ? (event.clientY - top)
            : (event.clientX - left);
        pos = 100 * px / size;
        // dispatch('change');
    }
    function setTouchPos(event) {
        const { top, left } = container.getBoundingClientRect();
        const px = type === 'vertical'
            ? (event.touches[0].clientY - top)
            : (event.touches[0].clientX - left);
        pos = 100 * px / size;
        // dispatch('change');
    }
    function drag(node, callback) {
        const mousedown = event => {
            if (event.which !== 1) return;
            event.preventDefault();
            dragging = true;
            const onmouseup = () => {
                dragging = false;
                window.removeEventListener('mousemove', callback, false);
                window.removeEventListener('mouseup', onmouseup, false);
            };
            window.addEventListener('mousemove', callback, false);
            window.addEventListener('mouseup', onmouseup, false);
        }
        node.addEventListener('mousedown', mousedown, false);
        return {
            destroy() {
                node.removeEventListener('mousedown', mousedown, false);
            }
        };
    }
    function touchDrag(node, callback) {
        const touchdown = event => {
            if (event.targetTouches.length > 1) return;
            event.preventDefault();
            dragging = true;
            const ontouchend = () => {
                dragging = false;
                window.removeEventListener('touchmove', callback, false);
                window.removeEventListener('touchend', ontouchend, false);
            };
            window.addEventListener('touchmove', callback, false);
            window.addEventListener('touchend', ontouchend, false);
        }
        node.addEventListener('touchstart', touchdown, false);
        return {
            destroy() {
                node.removeEventListener('touchstart', touchdown, false);
            }
        };
    }
    $: side = type === 'horizontal' ? 'left' : 'top';
    $: dimension = type === 'horizontal' ? 'width' : 'height';
    $: topB = type === 'horizontal' ? wa : ha; /* difference with original */
</script>

<style>
    .container {
        position: relative;
        width: calc(100vw);
        height: calc(100vh - 96px); /* minus 96px, because this is the height of the top-app-bar plus the status-bar plus padding round main frame (48 + 24 + 1 * 10) TODO change this comment */
        min-height: 400px;
    }
    .pane {
        position:absolute;
        float: left;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
    }
    .mousecatcher {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,.01);
    }
    .divider {
        position: absolute;
        z-index: 3;  /* z-index of dialog is 7, and of menu it is 8, this one must be lower. Only the value '3' seems to work. */
        display: none;
    }
    .divider::after {
        content: '';
        position: absolute;
        background-color: var(--freon-colors-slider, black);         /* difference with original */
    }
    .horizontal {
        padding: 0 8px;
        width: 0;
        height: 100%;
        cursor: ew-resize;
    }
    .horizontal::after {
        left: 8px;
        top: 0;
        width: 1px;
        height: 100%;
    }
    .vertical {
        padding: 8px 0;
        width: 100%;
        height: 0;
        cursor: ns-resize;
    }
    .vertical::after {
        top: 8px;
        left: 0;
        width: 100%;
        height: 1px;
    }
    .left, .right, .divider {
        display: block;
    }
    .left, .right {
        height: 100%;
        float: left;
    }
</style>

<!-- we use offsetWidth and offsetHeight instead of clientWidth and clientHeight, because these include any scrollbars -->
<div class="container" bind:this={container} >
    <div class="pane" style="{dimension}: {pos}%; top: 0px;" bind:offsetWidth={wa} bind:offsetHeight={ha}>
        <slot name="a"></slot>
    </div>

    <div class="pane" style="{dimension}: {100 - (pos)}%; top:{ topB}px; overflow: auto;" bind:offsetWidth={wb} bind:offsetHeight={hb}>
        <slot name="b"></slot>
    </div>

    {#if !fixed}
        <div class="{type} divider" style="{side}: calc({pos}% - 8px)" use:drag={setPos} use:touchDrag={setTouchPos}></div>
    {/if}
</div>

{#if dragging}
    <div class="mousecatcher"></div>
{/if}
