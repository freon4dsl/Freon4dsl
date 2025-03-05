<script lang="ts">
    import {Dropdown, DropdownDivider, DropdownItem, NavLi} from 'flowbite-svelte';
    import {ChevronDownOutline} from 'flowbite-svelte-icons';
    import type {MenuItem} from '$lib/ts-utils/MenuItem.js';
    import {WebappConfigurator} from "$lib/language";
    import {editorInfo, serverInfo} from "$lib/stores/ModelInfo.svelte";
    import {dialogs, langInfo} from "$lib/stores";
    import {setUserMessage} from "$lib/stores/UserMessageStore.svelte";
    import {isNullOrUndefined} from "@freon4dsl/core";
    import {ImportExportHandler} from "$lib/language/ImportExportHandler";

    // variables for the file import
    let file_selector: HTMLInputElement;
    let file_extensions = `${langInfo.fileExtensions.map(entry => `${entry}`).join(", ")}`;
    // The `multiple` attribute lets users select multiple files.
    // The `accept` attribute sets the file extensions that are allowed.
    let file_selector_props = {
        type: "file",
        multiple: true,
        accept: file_extensions,
    };

    // new model menuitem
    const changeModel = async () => {
        console.log('FileMenu.changeModel');
        // get list of models from server
        const names = await WebappConfigurator.getInstance().serverEnv?.loadModelList();
        if (names && names.length > 0) {
            serverInfo.allModelNames = names;
        } else {
            serverInfo.allModelNames = [];
        }
        dialogs.openModelDialogVisible = true;
    };

    // new unit menuitem
    const newUnit = async () => {
        console.log('FileMenu.newUnit');
        if (!!editorInfo.modelName && editorInfo.modelName.length > 0) {
            // get list of units from server, because new unit may not have the same name as an existing one
            await WebappConfigurator.getInstance().updateUnitList();
            dialogs.newUnitDialogVisible = true;
        } else {
            setUserMessage("Please, select or create a model first.");
        }
    };

    // save unit menuitem
    const saveUnit = (id: number) => {
        console.log('FileMenu.saveUnit: ' + id); // + $currentUnitName);
        if (editorInfo.currentUnit) {
            WebappConfigurator.getInstance().saveUnit(editorInfo.currentUnit);
            setUserMessage(`Unit '${editorInfo.currentUnit.name}' saved.`);
        } else {
            setUserMessage('No current unit.')
        }
    };

    // delete model menuitem
    const deleteModel = async (id: number) => {
        console.log('FileMenu.deleteModel ' + id);
        // get list of models from server
        const names = await WebappConfigurator.getInstance().serverEnv?.loadModelList();
        if (names && names.length > 0) {
        // if list not empty, show dialog
            serverInfo.allModelNames = names;
            dialogs.deleteModelDialogVisible = true;
        }
    };

    // import model unit menuitem
    const importUnit = (id: number) => {
        console.log('FileMenu.importUnit ' + id);
        // open the file browse dialog
        file_selector.click();
    };

    // <html>Svelte: Type '(event: MouseEvent) =&gt; void' is not assignable to type 'ChangeEventHandler&lt;HTMLInputElement&gt;'.<br/>Types of parameters 'event' and 'event' are incompatible.<br/>Type 'Event &amp; { currentTarget: EventTarget &amp; HTMLInputElement; }' is missing the following properties from type 'MouseEvent': altKey, button, buttons, clientX, and 21 more.
    const process_files = (event: Event & { currentTarget: EventTarget & HTMLInputElement; }) => {
        const input = event.target as HTMLInputElement
        const fileList: FileList | null = input.files;
        if (!isNullOrUndefined(fileList)) {
            new ImportExportHandler().importUnits(fileList);
        }
    }

    let menuItems: MenuItem[] = [
        {title: 'New or Open Model', action: changeModel, id: 1},
        {title: 'Delete Model', action: deleteModel, id: 2},
        {title: 'New or Open Unit', action: newUnit, id: 3},
        {title: 'Save Current Unit', action: saveUnit, id: 4},
        {title: 'Import Unit(s)...', action: importUnit, id: 5}
    ];
</script>


<!-- `file_selector` is a hidden element to be able to show a file selection browser -->
<input class:file_selector bind:this={file_selector} {...file_selector_props} onchange={process_files}>

<NavLi class="cursor-pointer"
>File
    <ChevronDownOutline class="text-primary-800 ms-2 inline h-6 w-6 dark:text-white"/>
</NavLi
>
<Dropdown class="z-20 w-44">
    {#each menuItems as item, index}
        <DropdownItem onclick={() => item.action(index)}>
            {item.title}
        </DropdownItem>
        {#if item.id === 2}
            <DropdownDivider/>
        {/if}
    {/each}
</Dropdown>

<style>
    .file_selector {
        display:none;
    }
</style>
