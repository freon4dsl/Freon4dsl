<script>
	import { Tabs, TabItem, CloseButton } from "flowbite-svelte"
	import SearchResults from "$lib/main-app/SearchResults.svelte"
	import ErrorList from "$lib/main-app/ErrorList.svelte"
	import TreeUser from "$lib/tree/TreeUser.svelte"
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
	<TabItem open={activeTab.value === errorTab} title="Errors">
		<ErrorList/>
	</TabItem>
	<TabItem open={activeTab.value === interpreterTab} title="Interpreter results">
		<TreeUser/>
	</TabItem>
<!--	<TabItem title="Settings">-->
<!--		<p class="text-sm text-gray-500 dark:text-gray-400">-->
<!--			<b>Settings:</b>-->
<!--			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.-->
<!--		</p>-->
<!--	</TabItem>-->
<!--	<TabItem title="Users">-->
<!--		<p class="text-sm text-gray-500 dark:text-gray-400">-->
<!--			<b>Users:</b>-->
<!--			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.-->
<!--		</p>-->
<!--	</TabItem>-->
<!--	<TabItem disabled>-->
<!--		<span slot="title" class="text-gray-400 dark:text-gray-500">Disabled</span>-->
<!--		<p class="text-sm text-gray-500 dark:text-gray-400">-->
<!--			<b>Disabled:</b>-->
<!--			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.-->
<!--		</p>-->
<!--	</TabItem>-->
</Tabs>

</div>
