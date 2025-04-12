<!-- The StatusBar presents info about the unit in the editor: name, whether there are errors, etc. -->

<script lang="ts">
    import { Box, isTextBox } from "@freon4dsl/core";
	import { selectedBoxes } from "@freon4dsl/core-svelte";
	import { editorInfo } from "$lib";
	import { ChevronRightOutline} from 'flowbite-svelte-icons';

	let currentBox: Box = $derived(selectedBoxes.value[0]);
</script>

<span class="dark:bg-dark-base-300 bg-light-base-100">
	<div class='text-sm ml-2'>
		{editorInfo.modelName}
		<ChevronRightOutline class="dots-menu2 text-light-base-700 ms-2 inline h-6 w-6"/>
		{editorInfo.currentUnit?.name ?? "<no unit>"}
		<ChevronRightOutline class="dots-menu2 text-light-base-700 ms-2 inline h-6 w-6"/>
		box: {currentBox?.role} {currentBox?.$id}
		<ChevronRightOutline class="dots-menu2 text-light-base-700 ms-2 inline h-6 w-6"/>
		kind: {currentBox?.kind}
		<ChevronRightOutline class="dots-menu2 text-light-base-700 ms-2 inline h-6 w-6"/>
		elem: {currentBox?.node?.freId()} - {currentBox?.node?.freLanguageConcept()}
		<ChevronRightOutline class="dots-menu2 text-light-base-700 ms-2 inline h-6 w-6"/>
		"{(isTextBox(currentBox) ? currentBox.getText() : "NotTextBox")}"
	</div>
</span>

