<script lang="ts">
    import {
        Button,
        ButtonGroup,
        CloseButton,
        Listgroup,
        ListgroupItem, Popover,
        Tooltip
    } from 'flowbite-svelte';
    import {FolderPlusSolid, ChevronDownOutline, DotsHorizontalOutline, FolderOpenSolid, CloseOutline, PenSolid, ArrowUpFromBracketOutline, UploadSolid, ArrowDownToBracketOutline} from 'flowbite-svelte-icons';
    import {langInfo} from '$lib/stores/LanguageInfo.svelte';
    import {FreErrorSeverity, type ModelUnitIdentifier} from "@freon4dsl/core";
    import {setUserMessage} from "$lib/stores/UserMessageStore.svelte";
    import {editorInfo, type UnitInfo} from "$lib/stores/ModelInfo.svelte";
    import {drawerHidden} from "$lib/stores";

    let myUnits: UnitInfo[] = $state([]);
    $effect(() => {
        myUnits = !!editorInfo.unitIds && editorInfo.unitIds.length > 0
            ? editorInfo.unitIds.sort((u1: ModelUnitIdentifier, u2: ModelUnitIdentifier) => {
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

    const openUnit = (index: number) => {
        console.log('openUnit ' + index)
        // EditorState.getInstance().openModelUnit(editorInfo.unitIds[index]);
    };

    const deleteUnit = (index: number) => {
        console.log("editorInfo.deleteUnit: " + editorInfo.unitIds[index].name);
        editorInfo.toBeDeleted = editorInfo.unitIds[index];
        // deleteUnitDialogVisible.value = true;
    };

    const saveUnit = (index: number) => {
        console.log("editorInfo.saveUnit: " + editorInfo.unitIds[index].name);
        if (editorInfo.unitIds[index].name === editorInfo.currentUnit?.name) {
            // EditorState.getInstance().saveCurrentUnit();
            setUserMessage(`Unit '${editorInfo.unitIds[index].name}' saved.`, FreErrorSeverity.Warning);
        } else {
            setUserMessage(`Unit '${editorInfo.unitIds[index].name}' has no changes.`, FreErrorSeverity.Warning);
        }
    };

    const renameUnit = (index: number) => {
        console.log("editorInfo.renameUnit: " + editorInfo.unitIds[index].name);
        editorInfo.toBeRenamed = editorInfo.unitIds[index];
        // renameUnitDialogVisible.value = true;
    };

    const exportUnit = (index: number) => {
        if (editorInfo.unitIds[index].name !== editorInfo.currentUnit?.name) {
            setUserMessage('Can only export unit currently shown in the editor', FreErrorSeverity.Warning);
        } else {
            // new ImportExportHandler().exportUnit(editorInfo.unitIds[index]);
        }
    };

</script>


<div class="flex items-center">
    <ButtonGroup class="*:!ring-primary-700 ">
        <Button name="Open existing model" size="xs">
            <FolderOpenSolid class="w-4 h-4 me-2 dark:text-white"/>
        </Button>
        <Tooltip placement="bottom">Open existing model</Tooltip>
        <Button name="Create new model" size="xs">
            <FolderPlusSolid class="w-4 h-4 me-2 dark:text-white"/>
        </Button>
        <Tooltip placement="bottom">Create new model</Tooltip>
    </ButtonGroup>
    <CloseButton onclick={() => (drawerHidden.value = true)} class="mb-4 dark:text-white"/>
</div>

<div class="flex justify-between items-center p-3 mb-3 bg-gray-200">
    <span class="font-bold">
        {editorInfo.modelName}
        <!-- Instead of DotsHorizontalOutline we could use ChevronDownOutline-->
<!--    <ChevronDownOutline class="dots-menu2 text-primary-800 ms-2 inline h-6 w-6 dark:text-white"/>-->
    </span>
    <ButtonGroup class="*:!ring-primary-700 ">
        <Button name="Rename" size="xs">
            <PenSolid class="w-4 h-4 me-2 dark:text-white"/>
        </Button>
        <Tooltip placement="bottom">Rename model</Tooltip>
        <Button name="Delete" size="xs">
            <CloseOutline class="w-4 h-4 me-2 dark:text-white"/>
        </Button>
        <Tooltip placement="bottom">Delete model</Tooltip>
        <Button name="Import Unit(s)..." size="xs">
            <ArrowDownToBracketOutline class="w-4 h-4 me-2 dark:text-white"/>
        </Button>
        <Tooltip placement="bottom">Import Unit(s)...</Tooltip>
    </ButtonGroup>
</div>

<Listgroup >
    {#each langInfo.unitTypes as unitType}
        <div class="p-1 font-semibold text-gray-900 dark:text-white">{unitType}</div>
        <ListgroupItem class="text-base border-none py-1">
            <Listgroup class="border-none">
                {#each myUnits as unit, index}
                    {#if unit.type === unitType}
                        <ListgroupItem class="text-base border-none py-1">
                        <div class="flex justify-between items-end text-gray-600 dark:text-gray-200">
                            {unit.name}
                            <!-- Instead of DotsHorizontalOutline we could use ChevronDownOutline-->
                            <DotsHorizontalOutline class="dots-menu1 inline text-gray-600 dark:text-white"/>
                        </div>
                        </ListgroupItem>
                        <Popover triggeredBy=".dots-menu1">
                            <div class="flex flex-col justify-end">
                                <Button name="Open" size="xs" class="p-1 m-1" onclick={() => openUnit(index)}>
                                    <FolderOpenSolid class="w-4 h-4 me-2 dark:text-white"/>
                                    Open
                                </Button>
                                <Button name="Save" size="xs" class="p-1 m-1" onclick={() => saveUnit(index)}>
                                    <UploadSolid class="w-4 h-4 me-2 dark:text-white"/>
                                    Save
                                </Button>
                                <Button name="Rename" size="xs" class="p-1 m-1" onclick={() => renameUnit(index)}>
                                    <PenSolid class="w-4 h-4 me-2 dark:text-white"/>
                                    Rename
                                </Button>
                                <Button name="Delete" size="xs" class="p-1 m-1" onclick={() => deleteUnit(index)}>
                                    <CloseOutline class="w-4 h-4 me-2 dark:text-white"/>
                                    Delete
                                </Button>
                                <Button name="Export" size="xs" class="p-1 m-1" onclick={() => exportUnit(index)}>
                                    <ArrowUpFromBracketOutline class="w-4 h-4 me-2 dark:text-white"/>
                                    Export
                                </Button>
                            </div>
                        </Popover>
                    {/if}
                {/each}
            </Listgroup>
        </ListgroupItem>
    {/each}
</Listgroup>
