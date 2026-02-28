<script lang="ts">
	import EditorPart from '$lib/main-app/EditorPart.svelte';
	import InfoPanel from '$lib/main-app/InfoPanel.svelte';
	import { infoPanelShown } from '$lib/stores';

</script>

<div id="tab-content" class="flex w-auto flex-1 min-h-0 bg-light-base-50 dark:bg-dark-base-900 dark:text-dark-base-50">
	{#if infoPanelShown.value}
		<div id="scroll-container-editor"
			 class="box-border flex flex-col flex-1 min-h-0 w-[70vw] overflow-y-auto border border-light-freon-200 dark:border-dark-freon-200">
			<EditorPart />
		</div>

		<div id="scroll-container-info"
			 class="box-border flex flex-col min-h-0 w-[30vw] overflow-y-auto border max-w-160
                bg-light-base-50 dark:bg-dark-base-800 text-light-base-500 dark:text-dark-base-400
                border-light-base-200 dark:border-dark-base-700 divide-y divide-gray-200 dark:divide-gray-600">
			<InfoPanel />
		</div>
	{:else}
		<div id="scroll-container"
			 class="box-border flex flex-col flex-1 min-h-0 w-full overflow-y-auto border border-light-freon-200 dark:border-dark-freon-200">
			<EditorPart />
		</div>
	{/if}
</div>
