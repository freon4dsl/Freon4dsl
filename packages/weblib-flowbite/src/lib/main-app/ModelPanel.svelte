<script lang="ts">
    import { newModelDialog } from "$lib/language/DialogHelpers.js"
    import {
        Button,
        ButtonGroup,
        CloseButton,
        Dropdown,
        Tooltip,
    } from 'flowbite-svelte';
    import {PlusOutline, FolderPlusSolid, TrashBinSolid, ChevronDownOutline, FolderOpenSolid, PenSolid, ArrowUpFromBracketOutline, ArrowDownToBracketOutline} from 'flowbite-svelte-icons';
    import { type FreUnitIdentifier, notNullOrUndefined } from "@freon4dsl/core"
    import {langInfo} from '$lib/stores/LanguageInfo.svelte';
    import {editorInfo} from "$lib/stores/ModelInfo.svelte";
    import {drawerHidden, dialogs} from "$lib/stores";
    import {openModelDialog} from "$lib/language/DialogHelpers";
    import {ImportExportHandler, WebappConfigurator} from "$lib/language";
    import { tooltipClass } from '$lib/stores/StylesStore.svelte';

    let myUnits: FreUnitIdentifier[] = $state([]);
    let selectedIndex: number = $state(-1);

    $effect(() => {
        myUnits = (notNullOrUndefined(editorInfo.unitIds) && editorInfo.unitIds.length > 0)
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
        // console.log('openUnit ' + index + " " + editorInfo.unitIds[index]?.id)
        WebappConfigurator.getInstance().openModelUnit(editorInfo.unitIds[index]);
        drawerHidden.value = true;
    };

    const deleteUnit = (index: number) => {
        // console.log("deleteUnit: " + editorInfo.unitIds[index].name);
        editorInfo.toBeDeleted = editorInfo.unitIds[index];
        dialogs.deleteUnitDialogVisible = true;
        drawerHidden.value = true;
    };

    const renameUnit = (index: number) => {
        // console.log("renameUnit: " + editorInfo.unitIds[index].name);
        editorInfo.toBeRenamed = editorInfo.unitIds[index];
        dialogs.renameUnitDialogVisible = true;
        drawerHidden.value = true;
    };

    const exportUnit = (index: number) => {
        // console.log("exportUnit: " + editorInfo.unitIds[index].name);
        new ImportExportHandler().exportUnit(editorInfo.unitIds[index]);
        drawerHidden.value = true;
    };

    const newUnit = (type: string) => {
        // console.log('newUnit of type: ' + type);
        editorInfo.toBeCreated = {name: '', id: '', type: type}
        dialogs.newUnitDialogVisible = true;
        drawerHidden.value = true;
    };
    
    const closeDrawer = () => {
        drawerHidden.value = true
        WebappConfigurator.getInstance().langEnv!.editor.selectionChanged()
    }

    /**
     * disable buttons if there  is no open model
     */
    let disabled: boolean = $derived(
        editorInfo.modelName === "<no-model>"
    )
    
    const buttonCls: string = 'text-center ' +
      'bg-light-base-200            dark:bg-dark-base-700 ' +
      'text-light-base-900          dark:text-dark-base-50 ' +
      'hover:text-light-base-100    dark:hover:text-dark-base-800 ' +
      'hover:bg-light-base-900      dark:hover:bg-dark-base-700';
    const dropdownButtonCls: string = 'm-1 ' +
      'bg-light-base-100            dark:bg-dark-base-700 ' +
      'text-light-base-900          dark:text-dark-base-50 ' +
      'hover:text-light-base-100    dark:hover:text-dark-base-800 ' +
      'hover:bg-light-base-900      dark:hover:bg-dark-base-700';
    const iconCls: string = "w-4 h-4 ";
    
    const hiddenButtonCls: string = 'hidden'
</script>



<!-- buttons for open and new model -->
<div id="modelPanel" class="flex items-center justify-between">
    <ButtonGroup class="*:!ring-light-base-700 ">
        <!-- Dummy button first, otherwise the tooltip for open-model will show when panel is opened. -->
        <Button id="dummy-model-button" class={hiddenButtonCls} name="Dummy" size="xs" onclick={openModelDialog}/>
        <Button id="open-model-button" class={buttonCls} name="Open existing model" size="xs" onclick={openModelDialog}>
            <FolderOpenSolid class={iconCls}/>
        </Button>
        <Button id="create-model-button" class={buttonCls} name="Create new model" size="xs" onclick={newModelDialog}>
            <FolderPlusSolid class={iconCls}/>
        </Button>
    </ButtonGroup>
    <CloseButton onclick={closeDrawer} class="mb-4 dark:text-dark-base-50"/>
</div>
<!--  tooltips need to be outside of the button group, otherwise the styling will not be correct  -->
<Tooltip triggeredBy="#open-model-button" class={tooltipClass} placement="bottom">Open existing model</Tooltip>
<Tooltip triggeredBy="#create-model-button" class={tooltipClass} placement="bottom">Create new model</Tooltip>


<!-- buttons that address the current model -->
<div class="flex justify-between items-center p-3 mb-3 bg-light-base-500">
    <span class="font-bold text-light-base-100 dark:text-dark-base-50 text-ellipsis">
        {editorInfo.modelName}
    </span>
    <ButtonGroup class="*:!ring-light-base-700 ">
        <Button id="rename-model-button" disabled class="{buttonCls} px-3" name="Rename" size="xs" onclick={() => {dialogs.renameModelDialogVisible = true}}>
            <PenSolid class="{iconCls} "/>
        </Button>
        <Button id="delete-model-button" {disabled} class="{buttonCls} px-3" name="Delete"  onclick={() => {dialogs.deleteModelDialogVisible = true}}>
            <TrashBinSolid class={iconCls}/>
        </Button>
        <Button id="import-unit-button" {disabled} class="{buttonCls} px-3" name="Import Unit(s)..." onclick={() => {dialogs.importDialogVisible = true}}>
            <ArrowDownToBracketOutline class={iconCls}/>
        </Button>
    </ButtonGroup>
    <!--  tooltips need to be outside of the button group, otherwise the styling will not be correct  -->
    <Tooltip triggeredBy="#rename-model-button" class={tooltipClass} placement="bottom">Rename model</Tooltip>
    <Tooltip triggeredBy="#delete-model-button" class={tooltipClass} placement="bottom">Delete model</Tooltip>
    <Tooltip triggeredBy="#import-unit-button" class={tooltipClass} placement="bottom">Import Unit(s)...</Tooltip>
</div>

<!-- buttons for the model's units -->
<div class="text-sm font-medium text-light-base-900 bg-light-base-50 dark:bg-dark-base-900 border-light-base-200 rounded-lg   dark:text-dark-base-50">
    {#each langInfo.unitTypes as unitType}
        <div class=" border border-light-base-800 mb-3">
            <div class="flex justify-between px-1 py-2 font-semibold text-light-base-900 dark:text-dark-base-50 bg-light-base-200 dark:bg-dark-base-700">
                <span class="px-1 text-light-base-800 dark:text-dark-base-100">{unitType} units</span>

                <Button {disabled} class="{buttonCls} p-1" name="New Unit" size="xs" onclick={() => newUnit(unitType)}>
                    <PlusOutline class="{iconCls} me-2 mr-0"/>
                </Button>
                <Tooltip class={tooltipClass} placement="bottom">New {unitType} unit</Tooltip>
            </div>
        <div class="w-64 ml-4 text-sm font-medium text-light-base-900 bg-light-base-50 dark:bg-dark-base-900 border-light-base-200 rounded-lg  dark:border-dark-base-600 dark:text-white">
            {#each myUnits as unit, index}
                {#if unit.type === unitType}
                <div class="flex justify-between items-end text-light-base-800  dark:text-dark-base-200 w-full mx-3 my-1
                    cursor-pointer dark:bg-dark-base-800
                    {index === selectedIndex ? 'bg-light-accent-100 dark:bg-dark-accent-100' : 'bg-light-base-100 dark:bg-dark-base-700'}"
                >
                <button class="flex-1 flex-start h-full text-ellipsis  py-1" onclick={() => openUnit(index)}>
                    <span class="flex flex-start mx-2 text-ellipsis">
                        {#if index === selectedIndex}
                            <div class="flex justify-between text-ellipsis"> 
                                <PenSolid class="{iconCls} me-2 "/>
                                <span class="text-ellipsis">{unit.name}</span>
                            </div>
                        {:else}
                            <div class="text-ellipsis">{unit.name}</div>
                        {/if}
                    </span>
                </button>
                <Tooltip class={tooltipClass} placement="bottom">Open {unit.name}</Tooltip>
                <span class="py-1">
                    <ChevronDownOutline id="dots-menu-{index}" class="inline text-light-base-900 dark:text-dark-base-50 hover:bg-light-base-900 dark:hover:bg-dark-base-50 hover:text-light-base-150 dark:hover:text-dark-base-700"/>
                    <Tooltip class={tooltipClass} placement="bottom">Actions on {unit.name}</Tooltip>
                    <Dropdown class="p-0 m-0 bg-light-base-500" placement='bottom' triggeredBy="#dots-menu-{index}">
                        <div class="flex flex-col justify-end p-0 m-0">
<!--                            // <Button class={dropdownButtonCls} name="Open" size="xs" onclick={() => openUnit(index)}>-->
<!--                            //     <FolderOpenSolid class="{iconCls} me-2"/>-->
<!--                            //     Open-->
<!--                            // </Button>-->
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
                </span>
                </div>
                {/if}
            {/each}
        </div>
        </div>
    {/each}
</div>

