<script lang="ts">
	import { Dropdown, DropdownDivider, DropdownItem, NavLi } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import type { MenuItem } from '$lib/ts-utils/MenuItem.js';

	const undo = (id: number) => {
		console.log('undo ' + id);
	};
	const redo = (id: number) => {
		console.log('redo ' + id);
	};
	const cut = (id: number) => {
		console.log('cut ' + id);
	};
	const copy = (id: number) => {
		console.log('copy ' + id);
	};
	const paste = (id: number) => {
		console.log('paste ' + id);
	};
	const findNamedElement = (id: number) => {
		console.log('findNamedElement ' + id);
	};
	const findStructureElement = (id: number) => {
		console.log('findStructureElement ' + id);
	};
	const findText = (id: number) => {
		console.log('findText ' + id);
	};

	let menuItems: MenuItem[] = [
		{ title: 'Undo', action: undo, id: 1 },
		{ title: 'Redo', action: redo, id: 2 },
		{ title: 'Cut', action: cut, id: 3 },
		{ title: 'Copy', action: copy, id: 4 },
		{ title: 'Paste', action: paste, id: 5 },
		{ title: 'Find Named Element', action: findNamedElement, id: 6 },
		{ title: 'Find Structure Element', action: findStructureElement, id: 7 },
		{ title: 'Find Text', action: findText, id: 8 },
	];
</script>

<NavLi class="cursor-pointer"
	>Edit<ChevronDownOutline class="text-primary-800 ms-2 inline h-6 w-6 dark:text-primary-50" /></NavLi
>
<Dropdown class="z-20 w-44">
	{#each menuItems as item, index}
		<DropdownItem onclick={() => item.action(index)}>
			{item.title}
		</DropdownItem>
		{#if item.id === 2 || item.id === 5 }
			<DropdownDivider />
		{/if}
	{/each}
</Dropdown>
