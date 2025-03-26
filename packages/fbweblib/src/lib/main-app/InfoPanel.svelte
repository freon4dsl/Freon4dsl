<script>
	import { Tabs, TabItem } from 'flowbite-svelte';
	import SearchResults from "$lib/main-app/SearchResults.svelte"
	import ErrorList from "$lib/main-app/ErrorList.svelte"
	import TreeUser from "$lib/tree/TreeUser.svelte"
</script>

<Tabs tabStyle="underline">
	<TabItem open title="Search results">
		<SearchResults/>
	</TabItem>
	<TabItem title="Errors">
		<ErrorList/>
	</TabItem>
	<TabItem title="Tree">
		<TreeUser/>
	</TabItem>
	<TabItem title="Settings">
		<p class="text-sm text-gray-500 dark:text-gray-400">
			<b>Settings:</b>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
		</p>
	</TabItem>
	<TabItem title="Users">
		<p class="text-sm text-gray-500 dark:text-gray-400">
			<b>Users:</b>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
		</p>
	</TabItem>
	<TabItem disabled>
		<span slot="title" class="text-gray-400 dark:text-gray-500">Disabled</span>
		<p class="text-sm text-gray-500 dark:text-gray-400">
			<b>Disabled:</b>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
		</p>
	</TabItem>
</Tabs>
