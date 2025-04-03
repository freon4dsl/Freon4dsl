<script lang="ts">
	import { Dropdown, DropdownItem, NavLi } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import type { MenuItem } from '$lib/ts-utils/MenuItem.js';
	import {dialogs} from "$lib";

	const runInterpreter = (id: number) => {
		console.log('runInterpreter ' + id);
	};
	const validate = (id: number) => {
		console.log('validate ' + id);
	};
	const selectViews = () => {
		dialogs.selectViewsDialogVisible = true;
	};

	let menuItems: MenuItem[] = [
		{ title: 'Run Validator', action: validate, id: 1 },
		{ title: 'Run Interpreter', action: runInterpreter, id: 2 },
		{ title: 'Select views', action: selectViews, id: 3 }
	];
</script>

<NavLi class="cursor-pointer"
	>Tools<ChevronDownOutline class="text-primary-800 ms-2 inline h-6 w-6 dark:text-primary-50" /></NavLi
>
<Dropdown class="z-20 w-44">
	{#each menuItems as item, index}
		<DropdownItem onclick={() => item.action(index)}>
			{item.title}
		</DropdownItem>
	{/each}
</Dropdown>
