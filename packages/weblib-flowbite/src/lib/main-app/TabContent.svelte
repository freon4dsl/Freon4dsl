<script lang="ts">
	import EditorPart from '$lib/main-app/EditorPart.svelte';
	import InfoPanel from '$lib/main-app/InfoPanel.svelte';
	import { infoPanelShown } from '$lib/stores';

</script>

<div id="tab-content" class="flex w-auto h-full grid-rows-[auto,1fr] col-span-2 ">
	{#if infoPanelShown.value}
		<div id='scroll-container-editor' class="flex-grow-1 h-[80vh] w-[70vw] relative top-0 overflow-y-auto border-1">
			<EditorPart />
		</div>
		<div id='scroll-container-info'
				 class="flex-grow-1 h-[80vh] w-[30vw] relative top-0 overflow-y-auto border-1 max-w-[40rem]
			bg-light-base-50 dark:bg-dark-base-800 text-light-base-500 dark:text-dark-base-400 border
			border-light-base-200 dark:border-dark-base-700 divide-y divide-gray-200 dark:divide-gray-600">
			<InfoPanel />
		</div>
	{:else}
		<div id='scroll-container' class="flex-grow-1 h-[80vh] w-full relative top-0 overflow-y-auto border-1 ">
			<EditorPart />
		</div>
	{/if}
</div>
