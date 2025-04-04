<script lang="ts">
    import {
        Button,
        ButtonGroup,
        CloseButton,
        Dropdown,
        Listgroup,
        ListgroupItem,
        Tooltip,
    } from 'flowbite-svelte';
    import {PlusOutline, FloppyDiskSolid, FolderPlusSolid, TrashBinSolid, ChevronDownOutline, FolderOpenSolid, PenSolid, ArrowUpFromBracketOutline, ArrowDownToBracketOutline} from 'flowbite-svelte-icons';
    import {FreErrorSeverity, type FreUnitIdentifier} from "@freon4dsl/core";
    import {langInfo} from '$lib/stores/LanguageInfo.svelte';
    import {setUserMessage} from "$lib/stores/UserMessageStore.svelte";
    import {editorInfo} from "$lib/stores/ModelInfo.svelte";
    import {drawerHidden, dialogs} from "$lib/stores";
    import {openModelDialog} from "$lib/language/DialogHelpers";
    import {ImportExportHandler, WebappConfigurator} from "$lib/language";

    let myUnits: FreUnitIdentifier[] = $state([]);
    let selectedIndex: number = $state(-1);

    $effect(() => {
        myUnits = !!editorInfo.unitIds && editorInfo.unitIds.length > 0
            ? editorInfo.unitIds.sort((u1: FreUnitIdentifier, u2: FreUnitIdentifier) => {
                if (u1.name > u2.name) {
                    return 1;
                }
                if (u1.name < u2.name) {
                    return -1;
                }
                return 0;
            })
            : [];

    });

    $effect(() => {
        if (editorInfo.currentUnit && myUnits.length > 0) {
            myUnits.forEach((u: FreUnitIdentifier, index: number) => {
                if (u.id === editorInfo.currentUnit?.id) {
                    selectedIndex = index;
                }
            })
        }
    })

    const openUnit = (index: number) => {
        console.log('openUnit ' + index)
        WebappConfigurator.getInstance().openModelUnit(editorInfo.unitIds[index]);
        drawerHidden.value = true;
    };

    const deleteUnit = (index: number) => {
        console.log("deleteUnit: " + editorInfo.unitIds[index].name);
        editorInfo.toBeDeleted = editorInfo.unitIds[index];
        dialogs.deleteUnitDialogVisible = true;
        drawerHidden.value = true;
    };

    const saveUnit = (index: number) => {
        console.log("saveUnit: " + editorInfo.unitIds[index].name);
        if (editorInfo.unitIds[index].name === editorInfo.currentUnit?.name) {
            WebappConfigurator.getInstance().saveUnit(editorInfo.unitIds[index]);
            setUserMessage(`Unit '${editorInfo.unitIds[index].name}' saved.`, FreErrorSeverity.Warning);
        } else {
            setUserMessage(`Unit '${editorInfo.unitIds[index].name}' has no changes.`, FreErrorSeverity.Warning);
        }
        drawerHidden.value = true;
    };

    const renameUnit = (index: number) => {
        console.log("renameUnit: " + editorInfo.unitIds[index].name);
        editorInfo.toBeRenamed = editorInfo.unitIds[index];
        dialogs.renameUnitDialogVisible = true;
        drawerHidden.value = true;
    };

    const exportUnit = (index: number) => {
        console.log("exportUnit: " + editorInfo.unitIds[index].name);
        new ImportExportHandler().exportUnit(editorInfo.unitIds[index]);
        drawerHidden.value = true;
    };

    const newUnit = (type: string) => {
        console.log('newUnit of type: ' + type);
        editorInfo.toBeCreated = {name: '', id: '', type: type}
        dialogs.newUnitDialogVisible = true;
        drawerHidden.value = true;
    };

    const buttonCls: string = 'text-center bg-secondary-200 dark:bg-secondary-700 hover:bg-primary-900 dark:hover:bg-primary-700';
    const dropdownButtonCls: string = 'bg-secondary-200 text-primary-900 dark:text-primary-50 m-1 dark:bg-secondary-700';
    const iconCls: string = "w-4 h-4 dark:text-primary-50";
</script>


<!-- buttons for open and new model -->
<div class="flex items-center">
    <ButtonGroup class="*:!ring-primary-700 ">
        <Button class={buttonCls} name="Open existing model" size="xs" onclick={openModelDialog}>
            <FolderOpenSolid class="{iconCls}"/>
        </Button>
        <Tooltip placement="bottom">Open existing model</Tooltip>
        <Button class={buttonCls} name="Create new model" size="xs" onclick={() => {dialogs.newModelDialogVisible = true}}>
            <FolderPlusSolid class="{iconCls}"/>
        </Button>
        <Tooltip placement="bottom">Create new model</Tooltip>
    </ButtonGroup>
    <CloseButton onclick={() => (drawerHidden.value = true)} class="mb-4 dark:text-primary-50"/>
</div>

<!-- buttons that address the current model -->
<div class="flex justify-between items-center p-3 mb-3 bg-primary-500">
    <span class="font-bold text-primary-900 dark:text-primary-50">
        {editorInfo.modelName}
    </span>
    <ButtonGroup class="*:!ring-primary-700 ">
        <Button class={buttonCls} name="Rename" size="xs" onclick={() => {dialogs.renameModelDialogVisible = true}}>
            <PenSolid class="{iconCls} me-2 "/>
        </Button>
        <Tooltip placement="bottom">Rename model</Tooltip>
        <Button class={buttonCls} name="Delete" size="xs" onclick={() => {dialogs.deleteModelDialogVisible = true}}>
            <TrashBinSolid class="{iconCls} me-2"/>
        </Button>
        <Tooltip placement="bottom">Delete model</Tooltip>
        <Button class={buttonCls} name="Import Unit(s)..." size="xs" onclick={() => {dialogs.importDialogVisible = true}}>
            <ArrowDownToBracketOutline class="{iconCls} me-2"/>
        </Button>
        <Tooltip placement="bottom">Import Unit(s)...</Tooltip>
    </ButtonGroup>
</div>

<!-- buttons for the model's units -->
<div class="text-sm font-medium text-gray-900 bg-primary-50 dark:bg-secondary-900 border-gray-200 rounded-lg   dark:text-primary-50">
    {#each langInfo.unitTypes as unitType}
        <div class=" border border-secondary-800 mb-3">
            <div class="flex justify-between px-1 py-2 font-semibold text-secondary-900 dark:text-primary-50 bg-primary-100 dark:bg-secondary-700">
                <span class="px-1 text-primary-800 dark:text-primary-100">{unitType}</span>
                <ButtonGroup class="*:!ring-primary-700 ">
                <Button class="{buttonCls} p-1" name="New Unit" size="xs" onclick={() => newUnit(unitType)}>
                    <PlusOutline class="{iconCls} me-2 mr-0"/>
                </Button>
                <Tooltip placement="bottom">New Unit</Tooltip>
                </ButtonGroup>
            </div>
        <div class="w-64 ml-4 text-sm font-medium text-gray-900 bg-primary-50 dark:bg-secondary-900 border-gray-200 rounded-lg  dark:border-gray-600 dark:text-white">
            {#each myUnits as unit, index}
                {#if unit.type === unitType}
                <div class="flex justify-between items-end text-primary-800  dark:text-secondary-200 w-full mx-3 my-1 px-4 py-1
                    cursor-pointer dark:bg-gray-800
                    {index === selectedIndex ? 'bg-secondary-300 dark:bg-primary-400' : 'bg-primary-100 dark:bg-secondary-700'}"
                >
                    {unit.name}
                    <ChevronDownOutline id="dots-menu-{index}" class="inline text-secondary-900 dark:text-primary-50"/>
                    <Dropdown class="p-0 m-0 bg-primary-500" placement='left' triggeredBy="#dots-menu-{index}">
                        <div class="flex flex-col justify-end p-0 m-0">
                            <Button class={dropdownButtonCls} name="Open" size="xs" onclick={() => openUnit(index)}>
                                <FolderOpenSolid class="{iconCls} me-2"/>
                                Open
                            </Button>
                            <Button class={dropdownButtonCls}  name="Save" size="xs" onclick={() => saveUnit(index)}>
                                <FloppyDiskSolid class="{iconCls} me-2"/>
                                Save
                            </Button>
                            <Button class={dropdownButtonCls}  name="Rename" size="xs" onclick={() => renameUnit(index)}>
                                <PenSolid class="{iconCls} me-2"/>
                                Rename
                            </Button>
                            <Button class={dropdownButtonCls}  name="Delete" size="xs" onclick={() => deleteUnit(index)}>
                                <TrashBinSolid class="{iconCls} me-2"/>
                                Delete
                            </Button>
                            <Button class={dropdownButtonCls}  name="Export" size="xs" onclick={() => exportUnit(index)}>
                                <ArrowUpFromBracketOutline class="{iconCls} me-2"/>
                                Export
                            </Button>
                        </div>
                    </Dropdown>
                </div>
                {/if}
            {/each}
        </div>
        </div>
    {/each}
</div>

