<script>
	import {afterUpdate, onMount, tick} from "svelte";
	import ErrorTooltip from "$lib/components/ErrorTooltip.svelte";
	import {viewport} from "$lib/components/svelte-utils/index.js";

	// todo export let box => get top and content from box
    export let element;
    export let content;
    let innerTop = 10;
    let innerHeight = 8;

    async function calcPos() {
        await tick();
        if (!!element) {
            let elementRect = element.getBoundingClientRect();
            if (!!elementRect) {
                // console.log(`ErrorMarker top ${elementRect.top} bottom ${elementRect.bottom} height ${elementRect.height} viewport.top ${$viewport.top}`)
				// get the position of the element relative to the editor view
                innerTop = elementRect.top - $viewport.top;
            } else {
                console.log("No bounding rect")
            }
        } else {
            console.log("NO element")
        }
    }

	onMount(() => {
		calcPos();
	})
	afterUpdate( () => {
		calcPos()
	})

	// todo Calculate parentLeft. At the moment we assume that the ErrorMarker is at the left border of the FreonComponent.
</script>

<span class="error-positioning" style="top: {innerTop}px; height: {innerHeight}px;">
	<ErrorTooltip {content} hasErr={true} parentTop={innerTop} parentLeft={2}>
		<span class="error-marker" style="height: {innerHeight}px;">&nbsp</span>
	</ErrorTooltip>
</span>
