<script>
	import { CloseButton } from "flowbite-svelte"
	import SearchResults from "$lib/main-app/infopanel/SearchResults.svelte"
	import InterpreterResults from "$lib/main-app/infopanel/InterpreterResults.svelte"
	import ValidationResults from '$lib/main-app/infopanel/ValidationResults.svelte';
	import { deltaTab, infoPanelShown, searchText } from "$lib/stores/index.js"
	import { activeTab, errorTab, interpreterTab, searchTab } from "$lib/stores/InfoPanelStore.svelte.js"
	import DeltaResults from "$lib/main-app/infopanel/DeltaResults.svelte"
</script>

<div id="infoPanel" class="freon-infopanel">
	<div class="freon-infopanel-header">
		<div class="freon-infopanel-title">
			{#if activeTab.value === searchTab}
				Search results for "{searchText.value}"
			{:else if activeTab.value === errorTab}
				Errors found
			{:else if activeTab.value === interpreterTab}
				Interpreter results
			{:else if activeTab.value === deltaTab}
				Processed LionWeb Deltas
			{/if}
		</div>

		<CloseButton
			onclick={() => (infoPanelShown.value = false)}
			class="freon-infopanel-close ml-auto"
		/>
	</div>

	<div class="freon-infopanel-content">
		{#if activeTab.value === searchTab}
			<SearchResults />
		{:else if activeTab.value === errorTab}
			<ValidationResults />
		{:else if activeTab.value === interpreterTab}
			<InterpreterResults />
		{:else if activeTab.value === deltaTab}
			<DeltaResults />
		{/if}
	</div>
</div>
