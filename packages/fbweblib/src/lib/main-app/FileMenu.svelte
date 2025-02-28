<script lang="ts">
	import { Button, Dropdown, DropdownDivider, DropdownItem, NavLi } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import type { MenuItem } from '$lib/ts-utils/MenuItem.js';
	// import { currentUnitName } from '$lib/stores/ModelStore.js';

	// new model menuitem
	const changeModel = async (id: number) => {
		console.log('FileMenu.changeModel');
		// get list of models from server
		// const names = await WebappConfigurator.getInstance().serverCommunication.loadModelList()
		// if (names && names.length > 0) {
		//     $modelNames = names;
		// } else {
		//     $modelNames = [];
		// }
		// $openModelDialogVisible = true;
	};

	// new unit menuitem
	const newUnit = async (id: number) => {
		console.log('FileMenu.newUnit');
		// if (!!$currentModelName && $currentModelName.length > 0) {
		//     // get list of units from server, because new unit may not have the same name as an existing one
		//     const names: ModelUnitIdentifier[] = await WebappConfigurator.getInstance().serverCommunication.loadUnitList($currentModelName);
		//     if (names) {
		//         // list may be empty => this is the first unit to be stored
		//         $unitNames = names;
		//     } else {
		//         $unitNames = [];
		//     }
		//     $newUnitDialogVisible = true;
		// } else {
		//     setUserMessage("Please, select or create a model first.");
		// }
	};

	// save unit menuitem
	const saveUnit = (id: number) => {
		console.log('FileMenu.saveUnit: '); // + $currentUnitName);
		// if ($currentUnitName) {
		//     // EditorState.getInstance().saveCurrentUnit();
		//     // setUserMessage(`Unit '${$currentUnitName.name}' saved.`);
		// } else {
		//     // setUserMessage('No current unit.')
		// }
	};

	// delete model menuitem
	const deleteModel = async (id: number) => {
		console.log('FileMenu.deleteModel');
		// get list of models from server
		// const names = await WebappConfigurator.getInstance().serverCommunication.loadModelList()
		// // if list not empty, show dialog
		// if (names.length > 0) {
		//     $modelNames = names;
		//     $deleteModelDialogVisible = true;
		//     // console.log("dialog visible is true")
		// }
	};

	// import model unit menuitem
	const importUnit = (id: number) => {
		console.log('FileMenu.importUnit');
		// open the file browse dialog
		// file_selector.click();
	};

	let menuItems: MenuItem[] = [
		{ title: 'New or Open Model', action: changeModel, id: 1 },
		{ title: 'Delete Model', action: deleteModel, id: 2 },
		{ title: 'New Unit', action: newUnit, id: 3 },
		{ title: 'Save Current Unit', action: saveUnit, id: 4 },
		{ title: 'Import Unit(s)...', action: importUnit, id: 5 }
	];
</script>

<NavLi class="cursor-pointer"
	>File<ChevronDownOutline class="text-primary-800 ms-2 inline h-6 w-6 dark:text-white" /></NavLi
>
<Dropdown class="z-20 w-44">
	{#each menuItems as item, index}
		<DropdownItem onclick={() => item.action(index)}>
			{item.title}
		</DropdownItem>
		{#if item.id === 2}
			<DropdownDivider />
		{/if}
	{/each}
</Dropdown>
