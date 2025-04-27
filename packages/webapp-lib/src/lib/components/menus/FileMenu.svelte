<div
		class={Object.keys(anchorClasses).join(' ')}
		use:Anchor={{addClass: addClass, removeClass: removeClass}}
		bind:this={anchor}
>
	<Button variant="raised" onclick={() => menu.setOpen(true)}>
		<Label>File</Label>
	</Button>
	<Menu bind:this={menu}
		  anchor={false}
		  bind:anchorElement={anchor}
		  anchorCorner="BOTTOM_LEFT"
	>
		<List>
			{#each menuItems as item (item.id)}
				<Item onSMUIAction={() => (handleClick(item.id))} disabled={WebappConfigurator.getInstance().isDemo}>
					<Text>{item.title}</Text>
				</Item>
				{#if item.id === 2}
				<Separator />
				{/if}
			{/each}
		</List>
	</Menu>
</div>

<!-- `file_selector` is a hidden element to be able to show a file selection browser -->
<!-- The `multiple` attribute lets users select multiple files. -->
<!-- The `accept` attribute sets the file extensions that are allowed.  -->
<input class:file_selector bind:this={file_selector} {...file_selector_props} onchange={process_files}>

<script lang="ts">
	import {isNullOrUndefined, type FreUnitIdentifier} from "@freon4dsl/core";
	import MenuComponentDev from "@smui/menu";
	import Menu from '@smui/menu';
	import List, { Item, Separator, Text } from '@smui/list';
	import Button, { Label } from '@smui/button';
	import { Anchor } from '@smui/menu-surface';
	import { currentModelName, currentUnit, unitNames } from "../stores/ModelStore.svelte";
	import { MenuItem } from "../ts-utils/MenuItem.js";
	import { fileExtensions } from "../stores/LanguageStore.svelte";
	import { deleteModelDialogVisible, newUnitDialogVisible, openModelDialogVisible } from "../stores/DialogStore.svelte";
	import { setUserMessage } from "../stores/UserMessageStore.svelte";
	import { modelNames } from "../stores/ServerStore.svelte";
	import { EditorState } from "$lib/language/EditorState";
	import { ImportExportHandler } from "$lib/language/ImportExportHandler";
	import {WebappConfigurator} from "$lib";

	// variables for the file import
	let file_selector: HTMLElement;
	let file_extensions = `${fileExtensions.list.map(entry => `${entry}`).join(", ")}`;
	let file_selector_props = {
		type: "file",
		multiple: true,
		accept: file_extensions,
	};

	let menu: MenuComponentDev;

	// following is used to position the menu
	let anchor: HTMLDivElement;
	let anchorClasses: { [k: string]: boolean } = {};

	const addClass = (className: string) => {
		if (!anchorClasses[className]) {
			anchorClasses[className] = true;
		}
	}
	const removeClass = (className: string) => {
		if (anchorClasses[className]) {
			delete anchorClasses[className];
			anchorClasses = anchorClasses;
		}
	}

	// when a menu-item is clicked, this function is executed
    const handleClick = (id: number) => {
        // find the item that was clicked
        let menuItem = menuItems.find(item => item.id === id);
        // perform the action associated with the menu item
		if (!isNullOrUndefined(menuItem)) {
			menuItem.action(id);
		}
    };

    // new model menuitem
    const changeModel = async () => {
		// console.log("FileMenu.changeModel");
        // get list of models from server
        const names = await WebappConfigurator.getInstance().serverCommunication!.loadModelList()
		if (names && names.length > 0) {
			modelNames.list = names;
		} else {
			modelNames.list = [];
		}
		openModelDialogVisible.value = true;
    }

    // new unit menuitem
    const newUnit = async () => {
		// console.log("FileMenu.newUnit");
		if (!!currentModelName.value && currentModelName.value.length > 0) {
			// get list of units from server, because new unit may not have the same name as an existing one
			const names: FreUnitIdentifier[] = await EditorState.getInstance().modelStore!.getUnitIdentifiers();
			if (names) {
				// list may be empty => this is the first unit to be stored
				unitNames.ids = names;
			} else {
				unitNames.ids = [];
			}
			newUnitDialogVisible.value = true;
		} else {
			setUserMessage("Please, select or create a model first.");
		}
    }

    // save unit menuitem
    const saveUnit = () => {
        // console.log("FileMenu.saveUnit: " + currentUnit.id);
		if (currentUnit.id) {
			EditorState.getInstance().saveCurrentUnit();
			setUserMessage(`Unit '${currentUnit.id.name}' saved.`);
		} else {
			setUserMessage('No current unit.')
		}
    }

    // delete model menuitem
    const deleteModel = async () => {
        // console.log("FileMenu.deleteModel");
        // get list of models from server
		const names = await WebappConfigurator.getInstance().serverCommunication!.loadModelList()
		// if list not empty, show dialog
		if (names.length > 0) {
			modelNames.list = names;
			deleteModelDialogVisible.value = true;
			// console.log("dialog visible is true")
		}
    }

    // import model unit menuitem
    const importUnit = () => {
        // open the file browse dialog
        file_selector.click();
    }

	// <html>Svelte: Type '(event: MouseEvent) =&gt; void' is not assignable to type 'ChangeEventHandler&lt;HTMLInputElement&gt;'.<br/>Types of parameters 'event' and 'event' are incompatible.<br/>Type 'Event &amp; { currentTarget: EventTarget &amp; HTMLInputElement; }' is missing the following properties from type 'MouseEvent': altKey, button, buttons, clientX, and 21 more.
    const process_files = (event: Event & { currentTarget: EventTarget & HTMLInputElement; }) => {
		const input = event.target as HTMLInputElement
        const fileList: FileList | null = input.files;
		if (!isNullOrUndefined(fileList)) {
			new ImportExportHandler().importUnits(fileList);
		}
    }

	let menuItems: MenuItem[] = [
		{title: "New or Open Model", action: changeModel, id: 1},
		{title: 'Delete Model', action: deleteModel, id: 2},
		{title: 'New Unit', action: newUnit, id: 3},
		{title: 'Save Current Unit', action: saveUnit, id: 4},
		{title: 'Import Unit(s)...', action: importUnit, id: 5},
	];
</script>

<style>
	.file_selector {
		display:none;
	}
</style>
