<script>
	import { CloseButton } from "flowbite-svelte"
	import SearchResults from "$lib/main-app/SearchResults.svelte"
	import InterpreterResults from "$lib/main-app/InterpreterResults.svelte"
	import ValidationResults from '$lib/main-app/ValidationResults.svelte';
	import { infoPanelShown } from "$lib/stores/index.js"
	import { activeTab, errorTab, interpreterTab, searchTab } from "$lib/stores/InfoPanelStore.svelte.js"
</script>

<div id="infoPanel">
	<div class="flex flex-end p-0 m-0 w-full border-b border-light-base-300 dark:border-dark-base-800">
		<div class="font-semibold p-1">
			{#if activeTab.value === searchTab}
				Search results
			{:else if activeTab.value === errorTab}
				Errors found
			{:else if activeTab.value === interpreterTab}
				Interpreter results
			{/if}
		</div>
		<CloseButton onclick={() => (infoPanelShown.value = false)} class="dark:text-dark-base-50 ml-auto" />
	</div>
	{#if activeTab.value === searchTab}
		<SearchResults/>
	{:else if activeTab.value === errorTab}
		<ValidationResults/>
	{:else if activeTab.value === interpreterTab}
		<InterpreterResults/>
	{/if}
</div>
