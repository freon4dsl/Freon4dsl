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
    import {FloppyDiskSolid, FolderPlusSolid, TrashBinSolid, ChevronDownOutline, FolderOpenSolid, PenSolid, ArrowUpFromBracketOutline, ArrowDownToBracketOutline} from 'flowbite-svelte-icons';
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

</script>

<!-- buttons for open and new model -->
<div class="flex items-center">
    <ButtonGroup class="*:!ring-primary-700 ">
        <Button name="Open existing model" size="xs" onclick={openModelDialog}>
            <FolderOpenSolid class="w-4 h-4 me-2 dark:text-primary-50"/>
        </Button>
        <Tooltip placement="bottom">Open existing model</Tooltip>
        <Button name="Create new model" size="xs" onclick={() => {dialogs.newModelDialogVisible = true}}>
            <FolderPlusSolid class="w-4 h-4 me-2 dark:text-primary-50"/>
        </Button>
        <Tooltip placement="bottom">Create new model</Tooltip>
    </ButtonGroup>
    <CloseButton onclick={() => (drawerHidden.value = true)} class="mb-4 dark:text-primary-50"/>
</div>

<!-- buttons that address the current model -->
<div class="flex justify-between items-center p-3 mb-3 bg-primary-500">
    <span class="font-bold">
        {editorInfo.modelName}
    </span>
    <ButtonGroup class="*:!ring-primary-700 ">
        <Button name="Rename" size="xs" onclick={() => {dialogs.renameModelDialogVisible = true}}>
            <PenSolid class="w-4 h-4 me-2 dark:text-primary-50"/>
        </Button>
        <Tooltip placement="bottom">Rename model</Tooltip>
        <Button name="Delete" size="xs" onclick={() => {dialogs.deleteModelDialogVisible = true}}>
            <TrashBinSolid class="w-4 h-4 me-2 dark:text-primary-50"/>
        </Button>
        <Tooltip placement="bottom">Delete model</Tooltip>
        <Button name="Import Unit(s)..." size="xs" onclick={() => {dialogs.importDialogVisible = true}}>
            <ArrowDownToBracketOutline class="w-4 h-4 me-2 dark:text-primary-50"/>
        </Button>
        <Tooltip placement="bottom">Import Unit(s)...</Tooltip>
    </ButtonGroup>
</div>

<!-- buttons for the model's units -->
<Listgroup >
    {#each langInfo.unitTypes as unitType}
        <div class="flex justify-between p-1 font-semibold text-secondary-900 dark:text-primary-50">
            {unitType}
            <ButtonGroup class="*:!ring-primary-700 ">
            <Button name="New Unit" size="xs" class="p-1" onclick={() => newUnit(unitType)}>
                <FolderOpenSolid class="w-4 h-4 me-2 dark:text-primary-50 mr-0"/>
            </Button>
            <Tooltip placement="bottom">New Unit</Tooltip>
            </ButtonGroup>
        </div>
        <ListgroupItem class="text-base border-none py-1">
            <Listgroup class="border-none ">
                {#each myUnits as unit, index}
                    {#if unit.type === unitType}
                        <ListgroupItem class="text-base first:rounded-none last:rounded-none border-none p-1
                                {index === selectedIndex ? 'bg-secondary-400 dark:bg-secondary-600' : ''}">
                        <div class="flex justify-between items-end text-secondary-600 dark:text-secondary-200">
                            {unit.name}
                            <!-- Instead of DotsHorizontalOutline we could use ChevronDownOutline-->
                            <ChevronDownOutline id="dots-menu-{index}" class="inline text-secondary-600 dark:text-primary-50"/>
                            <Dropdown class="p-0 m-0">
                                <div class="flex flex-col justify-end p-0 m-0">
                                    <Button name="Open" size="xs" class="m-1 dark:bg-secondary-200 dark:text-secondary-800" onclick={() => openUnit(index)}>
                                        <FolderOpenSolid class="w-4 h-4 me-2"/>
                                        Open
                                    </Button>
                                    <Button name="Save" size="xs" class="m-1 dark:bg-secondary-200 dark:text-secondary-800" onclick={() => saveUnit(index)}>
                                        <FloppyDiskSolid class="w-4 h-4 me-2"/>
                                        Save
                                    </Button>
                                    <Button name="Rename" size="xs" class="m-1 dark:bg-secondary-200 dark:text-secondary-800" onclick={() => renameUnit(index)}>
                                        <PenSolid class="w-4 h-4 me-2"/>
                                        Rename
                                    </Button>
                                    <Button name="Delete" size="xs" class="m-1 dark:bg-secondary-200 dark:text-secondary-800" onclick={() => deleteUnit(index)}>
                                        <TrashBinSolid class="w-4 h-4 me-2"/>
                                        Delete
                                    </Button>
                                    <Button name="Export" size="xs" class="m-1 dark:bg-secondary-200 dark:text-secondary-800" onclick={() => exportUnit(index)}>
                                        <ArrowUpFromBracketOutline class="w-4 h-4 me-2"/>
                                        Export
                                    </Button>
                                </div>
                            </Dropdown>
                        </div>
                        </ListgroupItem>

                    {/if}
                {/each}
            </Listgroup>
        </ListgroupItem>
    {/each}
</Listgroup>
