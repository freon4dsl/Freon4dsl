<script lang="ts">
	import EditorPart from '$lib/main-app/EditorPart.svelte';
	import InfoPanel from '$lib/main-app/InfoPanel.svelte';
	import { infoPanelShown } from '$lib/stores';

</script>

<div class="flex w-auto h-full grid-rows-[auto,1fr] col-span-2 ">
	{#if infoPanelShown.value}
		<div class="flex-grow-1 h-[88vh] w-[80vw] relative top-0 overflow-y-auto border-1">
			<EditorPart />
		</div>
		<div
			class="flex-grow-1 h-[88vh] w-[20vw] relative top-0 overflow-y-auto border-1 max-w-[25rem] bg-white dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400 border border-secondary-200 dark:border-secondary-700 divide-y divide-gray-200 dark:divide-gray-600">
			<InfoPanel />
		</div>
	{:else}
		<div class="flex-grow-1 h-[88vh] w-full relative top-0 overflow-y-auto border-1 ">
			<EditorPart />
		</div>
	{/if}
</div>
