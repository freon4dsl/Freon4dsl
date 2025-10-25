<!-- The StatusBar presents info about the unit in the editor: name, whether there are errors, etc. -->

<script lang="ts">
    import { Box, isTextBox } from "@freon4dsl/core";
	import { selectedBoxes } from "@freon4dsl/core-svelte";
	import { editorInfo } from "$lib";
	import { ChevronRightOutline} from 'flowbite-svelte-icons';
    import { inDevelopment } from "../stores/WebappStores.svelte.js"

	let currentBox: Box = $derived(selectedBoxes.value[0]);
    
</script>

<span class="text-light-accent-800 dark:text-dark-accent-100 bg-light-base-50 dark:bg-dark-base-900 ">
{#if (inDevelopment.value)}
	<div class='text-xs ml-6'>
		{editorInfo.modelName}
		<ChevronRightOutline tabindex={-1} class="dots-menu2 text-light-base-700 ms-2 inline h-6 w-6"/>
		{editorInfo.currentUnit?.name ?? "<no unit>"}
		<ChevronRightOutline tabindex={-1} class="dots-menu2 text-light-base-700 ms-2 inline h-6 w-6"/>
		box: {currentBox?.role} {currentBox?.$id}
		<ChevronRightOutline tabindex={-1} class="dots-menu2 text-light-base-700 ms-2 inline h-6 w-6"/>
		kind: {currentBox?.kind}
		<ChevronRightOutline tabindex={-1} class="dots-menu2 text-light-base-700 ms-2 inline h-6 w-6"/>
		elem: {currentBox?.node?.freId()} - {currentBox?.node?.freLanguageConcept()}
		<ChevronRightOutline tabindex={-1} class="dots-menu2 text-light-base-700 ms-2 inline h-6 w-6"/>
		"{(isTextBox(currentBox) ? currentBox.getText() : "NotTextBox")}"
	</div>
{/if}
</span>

