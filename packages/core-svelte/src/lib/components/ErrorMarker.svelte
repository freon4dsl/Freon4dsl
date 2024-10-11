<script lang="ts">
	import {afterUpdate, onMount, tick} from "svelte";
	import ErrorTooltip from "$lib/components/ErrorTooltip.svelte";
	import {viewport} from "$lib/components/svelte-utils/index.js";
	import {Box} from "@freon4dsl/core";

	export let box: Box;
    export let element;
    let content;
    let top = 10;
    let height = 8;

    async function calcPos() {
        await tick();
        if (!!element) {
            let elementRect = element.getBoundingClientRect();
            if (!!elementRect) {
                // console.log(`ErrorMarker top ${elementRect.top} bottom ${elementRect.bottom} height ${elementRect.height} viewport.top ${$viewport.top}`)
				// get the position of the element relative to the editor view
                top = elementRect.top - $viewport.top;
            } else {
                console.log("No bounding rect")
            }
        } else {
            console.log("NO element")
        }
    }

	onMount(() => {
		calcPos();
		content = box.errorMessages;
	})
	afterUpdate( () => {
		calcPos();
		content = box.errorMessages;
	})

	function ignore(m: MouseEvent)  {
		m.stopPropagation()
		m.preventDefault()
	}

	// todo Calculate parentLeft, or change it to parentRight. At the moment we assume that the ErrorMarker is at the left border of the FreonComponent.
</script>

<span on:click={ignore} class="error-positioning" style="top: {top}px; height: {height}px;">
	<ErrorTooltip {box} hasErr={true} parentTop={top} parentLeft={2}>
		<span class="error-marker" style="height: {height}px;">&nbsp</span>
	</ErrorTooltip>
</span>
