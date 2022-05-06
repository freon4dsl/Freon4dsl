<div style="min-width: 50px;">
	<Button on:click={() => menu.setOpen(true)}>
		<Label>File</Label>
	</Button>
	<Menu bind:this={menu}>
		<List>
			{#each menuItems as item (item.id)}
				<Item on:SMUI:action={() => (handleClick(item.id))}>
					<Text>{item.title}</Text>
				</Item>
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
	import List, { Item, Text } from '@smui/list';
	import Button, { Label } from '@smui/button';
	import { currentUnitName } from "../../stores/ModelStore.ts";
	import { MenuItem } from "../../ts-utils/MenuItem";
	import { fileExtensions } from "../../stores/LanguageStore";
	import { deleteModelDialogVisible, openModelDialogVisible } from "../../stores/DialogStore";

	// variables for the file import
	let file_selector;
	let file_extensions = `${$fileExtensions.map(entry => `${entry}`).join(", ")}`;
	let file_selector_props = {
		type: "file",
		multiple: true,
		accept: file_extensions,
	};

	let menu: MenuComponentDev;
	let clicked = 'nothing yet';

	// when a menu-item is clicked, this function is executed
    const handleClick = (id: number) => {
        // find the item that was clicked
        let menuItem = menuItems.find(item => item.id === id);
        // perform the action associated with the menu item
        menuItem.action(id);
    };

    // new model menuitem
    const changeModel = () => {
		console.log("FileMenu.changeModel");
        // get list of models from server
        // serverCommunication.loadModelList((names: string[]) => {
        //     if (names.length > 0) {
        //         $modelNames = names;
        //     }
            $openModelDialogVisible = true;
        // });
    }

    // new unit menuitem
    const newUnit = () => {
		console.log("FileMenu.newUnit");
        // get list of units from server, because new unit may not have the same name as an existing one
        // serverCommunication.loadUnitList($currentModelName, (names: string[]) => {
        //     // list may be empty => this is the first unit to be stored
        //     $unitNames = names;
        //     $newUnitDialogVisible = true;
        // });
    }

    // save unit menuitem
    const saveUnit = () => {
        console.log("FileMenu.saveUnit: " + $currentUnitName);
        // EditorCommunication.getInstance().saveCurrentUnit();
    }

    // delete model menuitem
    const deleteModel = () => {
        console.log("FileMenu.deleteModel");
        // get list of models from server
        // serverCommunication.loadModelList((names: string[]) => {
        //     // if list not empty, show dialog
        //     if (names.length > 0) {
        //         $modelNames = names;
                $deleteModelDialogVisible = true;
        //         // console.log("dialog visible is true")
        //     }
        // });
    }

    // import model unit menuitem
    const importUnit = () => {
        // open the file browse dialog
        file_selector.click();
    }

    const process_files = (event) => {
        const fileList: FileList = event.target.files;
        let text: string[] = [];
		for (let file of fileList) {
			text.push(file.name);
		}
        console.log("Files to import: " + text.map(f => f).join(", "))
        // const reader = new FileReader();
        // todo check whether the name of the unit already exists in the model
        // for (let file of fileList) {
        //     // todo async: wait for file to be uploaded before starting next
        //     // todo do something with progress indicator
        //     // reader.addEventListener('progress', (event) => {
        //     //     if (event.loaded && event.total) {
        //     //         const percent = (event.loaded / event.total) * 100;
        //     //         console.log(`Progress: ${Math.round(percent)}`);
        //     //     }
        //     // });
        //     // to check whether the file is recognisable as a model unit, we examine the file extension
        //     const extension: string = file.name.split(".").pop();
        //     let metaType: string = metaTypeForExtension(extension);
        //     // if the right extension has been found, continue
        //     if (metaType.length > 0) {
        //         reader.readAsText(file);
        //         reader.onload = function() {
        //             const text = reader.result;
        //             if (typeof text == "string") {
        //                 try {
        //                     EditorCommunication.getInstance().unitFromFile(reader.result as string, metaType);
        //                 } catch (e) {
        //                     setUserMessage(`${e.message}`);
        //                 }
        //             }
        //         };
        //         reader.onerror = function() {
        //             setUserMessage(reader.error.message);
        //         };
        //     } else {
        //         setUserMessage(`File ${file.name} does not have the right (extension) type.
        //          Found: ${extension}, expected one of: ${allExtensionsToString()}.`);
        //     }
        // }
    }

	let menuItems: MenuItem[] = [
		{title: "New or Open Model", action: changeModel, id: 1},
		{title: 'New Unit', action: newUnit, id: 3},
		{title: 'Save Current Unit', action: saveUnit, id: 5},
		{title: 'Delete Model', action: deleteModel, id: 6},
		{title: '(Experimental) Import Unit(s)...', action: importUnit, id: 7},
	];
</script>

<style>
	.file_selector {
		display:none;
	}
</style>
