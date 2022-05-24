<div
		class={Object.keys(anchorClasses).join(' ')}
		use:Anchor={{addClass: addClass, removeClass: removeClass}}
		bind:this={anchor}
>
	<Button variant="raised" on:click={() => menu.setOpen(true)}>
		<Label>File</Label>
	</Button>
	<Menu bind:this={menu}
		  anchor={false}
		  bind:anchorElement={anchor}
		  anchorCorner="BOTTOM_LEFT"
	>
		<List>
			{#each menuItems as item (item.id)}
				<Item on:SMUI:action={() => (handleClick(item.id))}>
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
<input class:file_selector bind:this={file_selector} {...file_selector_props} on:change={process_files}>

<script lang="ts">
	import type { MenuComponentDev } from '@smui/menu';
	import Menu from '@smui/menu';
	import List, { Item, Separator, Text } from '@smui/list';
	import Button, { Label } from '@smui/button';
	import { Anchor } from '@smui/menu-surface';
	import { currentModelName, currentUnitName, unitNames } from "../stores/ModelStore";
	import { MenuItem } from "../ts-utils/MenuItem";
	import { fileExtensions } from "../stores/LanguageStore";
	import { deleteModelDialogVisible, newUnitDialogVisible, openModelDialogVisible } from "../stores/DialogStore";
	import { setUserMessage } from "../stores/UserMessageStore";
	import { serverCommunication } from "../../config/WebappConfiguration";
	import { modelNames } from "../stores/ServerStore";
	import { EditorState } from "../../language/EditorState";
	import { ImportExportHandler } from "../../language/ImportExportHandler";

	// variables for the file import
	let file_selector: HTMLElement;
	let file_extensions = `${$fileExtensions.map(entry => `${entry}`).join(", ")}`;
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
        menuItem.action(id);
    };

    // new model menuitem
    const changeModel = () => {
		// console.log("FileMenu.changeModel");
        // get list of models from server
        serverCommunication.loadModelList((names: string[]) => {
            if (names.length > 0) {
                $modelNames = names;
            }
            $openModelDialogVisible = true;
        });
    }

    // new unit menuitem
    const newUnit = () => {
		// console.log("FileMenu.newUnit");
		if (!!$currentModelName && $currentModelName.length > 0) {
			// get list of units from server, because new unit may not have the same name as an existing one
			serverCommunication.loadUnitList($currentModelName, (names: string[]) => {
				// list may be empty => this is the first unit to be stored
				$unitNames = names;
				$newUnitDialogVisible = true;
			});
		} else {
			setUserMessage("Please, select or create a model first.");
		}
    }

    // save unit menuitem
    const saveUnit = () => {
        // console.log("FileMenu.saveUnit: " + $currentUnitName);
        EditorState.getInstance().saveCurrentUnit();
		setUserMessage(`Unit '${$currentUnitName}' saved.`);
    }

    // delete model menuitem
    const deleteModel = () => {
        // console.log("FileMenu.deleteModel");
        // get list of models from server
        serverCommunication.loadModelList((names: string[]) => {
            // if list not empty, show dialog
            if (names.length > 0) {
                $modelNames = names;
                $deleteModelDialogVisible = true;
                // console.log("dialog visible is true")
            }
        });
    }

    // import model unit menuitem
    const importUnit = () => {
        // open the file browse dialog
        file_selector.click();
    }

    const process_files = (event) => {
        const fileList: FileList = event.target.files;
        new ImportExportHandler().importUnits(fileList);
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
