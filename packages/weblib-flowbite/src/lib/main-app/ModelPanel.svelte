<script lang="ts">
    import { newModelDialog } from "$lib/language/DialogHelpers.js"
    import {
        Button,
        ButtonGroup,
        Dropdown,
        Tooltip
    } from "flowbite-svelte"
    import {
        PlusOutline,
        FolderPlusSolid,
        TrashBinSolid,
        ChevronDownOutline,
        FolderOpenSolid,
        PenSolid,
        ArrowUpFromBracketOutline,
        ArrowDownToBracketOutline
    } from "flowbite-svelte-icons"
    import { type FreUnitIdentifier } from "@freon4dsl/core"
    import { langInfo } from "$lib/stores/LanguageInfo.svelte"
    import { editorInfo } from "$lib/stores/ModelInfo.svelte"
    import { drawerOpen, dialogs } from "$lib/stores"
    import { openModelDialog } from "$lib/language/DialogHelpers"
    import { ImportExportHandler, WebappConfigurator } from "$lib/language"

    let myUnits: FreUnitIdentifier[] = $derived(
        editorInfo.unitIds?.length
            ? editorInfo.unitIds
            : []
    )

    let selectedIndex: number = $derived(
        myUnits?.findIndex((u) => u.id === editorInfo.currentUnit?.id)
    )

    const openUnit = (index: number) => {
        // console.log('openUnit ' + index + " " + editorInfo.unitIds[index]?.id)
        const unit = editorInfo.unitIds?.[index]
        if (unit) {
            WebappConfigurator.getInstance().openModelUnit(unit)
        }
        drawerOpen.value = false
    }

    const deleteUnit = (index: number) => {
        // console.log("deleteUnit: " + editorInfo.unitIds[index].name);
        editorInfo.toBeDeleted = editorInfo.unitIds[index]
        dialogs.deleteUnitDialogVisible = true
        drawerOpen.value = false
    }

    const renameUnit = (index: number) => {
        // console.log("renameUnit: " + editorInfo.unitIds[index].name);
        editorInfo.toBeRenamed = editorInfo.unitIds[index]
        dialogs.renameUnitDialogVisible = true
        drawerOpen.value = false
    }

    const exportUnit = (index: number) => {
        // console.log("exportUnit: " + editorInfo.unitIds[index].name);
        const unit = editorInfo.unitIds?.[index]
        if (unit) {
            new ImportExportHandler().exportUnit(unit)
        }
        drawerOpen.value = false
    }

    const newUnit = (type: string) => {
        // console.log('newUnit of type: ' + type);
        editorInfo.toBeCreated = { name: "", id: "", type: type }
        dialogs.newUnitDialogVisible = true
        drawerOpen.value = false
    }

    /**
     * disable buttons if there is no open model
     */
    let disabled: boolean = $derived(
        editorInfo.modelName === "<no-model>"
    )
</script>

<!-- buttons for open and new model -->
<div class="freon-modelpanel mb-3 flex items-center justify-between" id="modelPanel">
    <ButtonGroup class="*:ring-light-base-700! *:border *:not-first:-ms-px">
        <Button
            id="open-model-button"
            class="freon-btn rounded-none first:rounded-s-lg last:rounded-e-lg"
            name="Open existing model"
            onclick={openModelDialog}
            size="xs">
            <FolderOpenSolid class="freon-modelpanel-icon" />
        </Button>
        <Button
            id="create-model-button"
            class="freon-btn rounded-none first:rounded-s-lg last:rounded-e-lg"
            name="Create new model"
            onclick={newModelDialog}
            size="xs">
            <FolderPlusSolid class="freon-modelpanel-icon" />
        </Button>
    </ButtonGroup>
</div>
<!--  tooltips need to be outside of the button group, otherwise the styling will not be correct  -->
<Tooltip class="freon-tooltip" placement="bottom" triggeredBy="#open-model-button">Open existing model</Tooltip>
<Tooltip class="freon-tooltip" placement="bottom" triggeredBy="#create-model-button">Create new model</Tooltip>


<!-- buttons that address the current model -->
<div id="freon-modelpanel-header" class="freon-modelpanel-header mb-3 flex items-center justify-between rounded-md px-3 py-2">
    <span class="truncate font-bold">
        {editorInfo.modelName}
    </span>
    <ButtonGroup class="*:ring-light-base-700! ">
        <Button class="freon-btn px-3" {disabled} id="rename-model-button" name="Rename" onclick={() => {dialogs.renameModelDialogVisible = true}}
                size="xs">
            <PenSolid class="freon-modelpanel-icon " />
        </Button>
        <Button class="freon-btn px-3" {disabled} id="delete-model-button" name="Delete"
                onclick={() => {dialogs.deleteModelDialogVisible = true}}>
            <TrashBinSolid class="freon-modelpanel-icon" />
        </Button>
        <Button class="freon-btn px-3" {disabled} id="import-unit-button" name="Import Unit(s)..."
                onclick={() => {dialogs.importDialogVisible = true}}>
            <ArrowDownToBracketOutline class="freon-modelpanel-icon" />
        </Button>
    </ButtonGroup>
    <!--  tooltips need to be outside of the button group, otherwise the styling will not be correct  -->
    <Tooltip class="freon-tooltip" placement="bottom" triggeredBy="#rename-model-button">Rename model</Tooltip>
    <Tooltip class="freon-tooltip" placement="bottom" triggeredBy="#delete-model-button">Delete model</Tooltip>
    <Tooltip class="freon-tooltip" placement="bottom" triggeredBy="#import-unit-button">Import Unit(s)...</Tooltip>
</div>

<!-- buttons for the model's units -->
<div
    class="pl-3 px-3 py-2 text-sm font-medium text-light-base-900 bg-light-base-50 dark:bg-dark-base-900 border-light-base-200 rounded-lg   dark:text-dark-base-50">
    {#each langInfo.unitTypes as unitType, index (index)}
        <div class="freon-modelpanel-section mb-3 rounded-md overflow-hidden">
            <div class="freon-modelpanel-section-header flex items-center justify-between px-2 py-2 font-semibold">
                <span class="px-1 text-light-base-800 dark:text-dark-base-100">{unitType} units</span>

                <Button {disabled} class="freon-btn p-1" name="New Unit" size="xs"
                        onclick={() => newUnit(unitType)}>
                    <PlusOutline class="freon-modelpanel-icon me-2 mr-0" />
                </Button>
                <Tooltip class="freon-tooltip" placement="bottom">New {unitType} unit</Tooltip>
            </div>
            <div class="ml-3 py-1 text-sm">
                {#each myUnits as unit, index (index)}
                    {#if unit.type === unitType}
                        <div
                            class="freon-modelpanel-unit mx-2 my-1 flex items-center justify-between rounded-md px-2 py-1"
                            class:freon-modelpanel-unit-selected={unit.id === editorInfo.currentUnit?.id}
                        >
                            <button
                                class="flex flex-1 items-center gap-2 py-1 text-left"
                                onclick={() => openUnit(index)}
                            >
                                {#if index === selectedIndex}
                                    <PenSolid class="freon-modelpanel-icon shrink-0" />
                                {/if}

                                <span class="truncate">{unit.name}</span>
                            </button>
                            <Tooltip class="freon-tooltip" placement="bottom">Open {unit.name}</Tooltip>
                            <span class="inline-flex items-center shrink-0 py-1">
                                <span class="inline-flex items-center shrink-0 p-1">
                                    <ChevronDownOutline
                                        id="dots-menu-{index}"
                                        class="freon-modelpanel-menu-trigger h-4 w-4 cursor-pointer"
                                    />
                                </span>
                                <Tooltip class="freon-tooltip" placement="bottom">Actions on {unit.name}</Tooltip>
                                <Dropdown class="p-0 m-0" placement="bottom" triggeredBy="#dots-menu-{index}">
                                    <div class="flex flex-col p-0 m-0">
                                        <Button class="freon-modelpanel-dropdown-btn" name="Rename" size="xs"
                                                onclick={() => renameUnit(index)}>
                                            <PenSolid class="freon-modelpanel-icon me-2" />
                                            Rename
                                        </Button>
                                        <Button class="freon-modelpanel-dropdown-btn" name="Delete" size="xs"
                                                onclick={() => deleteUnit(index)}>
                                            <TrashBinSolid class="freon-modelpanel-icon me-2" />
                                            Delete
                                        </Button>
                                        <Button class="freon-modelpanel-dropdown-btn" name="Export" size="xs"
                                                onclick={() => exportUnit(index)}>
                                            <ArrowUpFromBracketOutline class="freon-modelpanel-icon me-2" />
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

