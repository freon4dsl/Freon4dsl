<script>
	import { Tabs, TabItem, CloseButton } from "flowbite-svelte"
	import SearchResults from "$lib/main-app/SearchResults.svelte"
	import ErrorList from "$lib/main-app/ErrorList.svelte"
	import InterpreterResults from "$lib/main-app/InterpreterResults.svelte"
	import { infoPanel } from "$lib/stores/index.js"
	import { activeTab, errorTab, interpreterTab, searchTab } from "$lib/stores/InfoPanelStore.svelte.js"
</script>

<div>
	<div class="flex items-end" >
		<CloseButton onclick={() => (infoPanel.value = false)} class="dark:text-white" />
	</div>
	<Tabs tabStyle="underline">
		<TabItem open={activeTab.value === searchTab} title="Search results">
			<SearchResults/>
		</TabItem>
		<TabItem open={activeTab.value === errorTab} title="Validation results">
			<ErrorList/>
		</TabItem>
		<TabItem open={activeTab.value === interpreterTab} title="Interpreter results">
			<InterpreterResults/>
		</TabItem>
	</Tabs>

</div>
