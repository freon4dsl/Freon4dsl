<script lang="ts">
    import { EditorRequestsHandler } from "$lib/language/index.js"
    import { dialogs, drawerOpen, editorInfo, searchText } from "$lib"
import {
    ClipboardOutline,
    EyeOutline,
    FileCopyOutline,
    FilePasteOutline,
    RedoOutline,
    SearchOutline,
    ThumbsUpOutline,
    UndoOutline,
    PlayOutline,
    ChevronRightOutline,
    FloppyDiskSolid,
    FileImportOutline
} from 'flowbite-svelte-icons';
import { Button, Input, Tooltip } from 'flowbite-svelte';
import { ENTER } from "@freon4dsl/core"

let innerSearchText: string = $state("");

/**
 * We use the key ENTER here to be able to search again, when the search text has not changed, but possibly
 * the model has. The onchange event only triggers when the search text has changed.
 * @param event
 */
function search(event: KeyboardEvent) {
    if (event.key !== ENTER) return;

    if (!innerSearchText || innerSearchText.length === 0) return;

    searchText.value = innerSearchText;
    EditorRequestsHandler.getInstance().findText(innerSearchText);
    innerSearchText = "";
}

    /**
     * disable buttons if there  is no open model and open unit in the editor
     */
    let disabled: boolean = $derived(
        editorInfo.modelName === "<no-model>" || editorInfo.currentUnit === undefined
    )
</script>

<div id="freon-toolbar" class="freon-toolbar flex h-12 w-full items-center justify-between border-b px-2">
    <!-- LEFT SIDE -->
    <div class="flex items-center gap-2">
        <!-- drawer button -->
        <Button
            id="model-button"
            tabindex={-1}
            class="freon-btn freon-btn-accent rounded-md px-3 py-1.5"
            onclick={() => (drawerOpen.value = true)}>
            <ChevronRightOutline class="w-5 h-5" />
        </Button>
        <!-- toolbar button group -->
        <div class="flex items-center *:px-3 *:py-1.5 *:border *:not-first:-ms-px">
            <!--  Buttons for editor actions      -->
            <Button id="save-button" tabindex={-1} {disabled} class="freon-btn rounded-none first:rounded-s-lg last:rounded-e-lg"
                    onclick={EditorRequestsHandler.getInstance().saveModel}>
                <FloppyDiskSolid class="freon-toolbar-icon"/>
            </Button>
            <Button id="undo-button" tabindex={-1}  {disabled} class="freon-btn rounded-none first:rounded-s-lg last:rounded-e-lg"
                    onclick={EditorRequestsHandler.getInstance().undo}>
                <UndoOutline class="freon-toolbar-icon"/>
            </Button>
            <Button id="redo-button" tabindex={-1} {disabled} class="freon-btn rounded-none first:rounded-s-lg last:rounded-e-lg"
                    onclick={EditorRequestsHandler.getInstance().redo}>
                <RedoOutline class="freon-toolbar-icon" />
            </Button>
            <Button id="cut-button" tabindex={-1} {disabled} class="freon-btn rounded-none first:rounded-s-lg last:rounded-e-lg"
                    onclick={EditorRequestsHandler.getInstance().cut}>
                <ClipboardOutline class="freon-toolbar-icon"/>
            </Button>
            <Button id="copy-button" tabindex={-1} {disabled} class="freon-btn rounded-none first:rounded-s-lg last:rounded-e-lg"
                    onclick={EditorRequestsHandler.getInstance().copy}>
                <FileCopyOutline class="freon-toolbar-icon"/>
            </Button>
            <Button id="paste-button" tabindex={-1} {disabled} class="freon-btn rounded-none first:rounded-s-lg last:rounded-e-lg"
                    onclick={EditorRequestsHandler.getInstance().paste}>
                <FilePasteOutline class="freon-toolbar-icon"/>
            </Button>
            <Button id="element-search-button" tabindex={-1} {disabled} class="freon-btn rounded-none first:rounded-s-lg last:rounded-e-lg"
                    onclick={() => {dialogs.searchElementDialogVisible = true}}>
                <SearchOutline tabindex={-1} class="freon-toolbar-icon"/>
            </Button>
            <Button id="validate-button" tabindex={-1} {disabled} class="freon-btn rounded-none first:rounded-s-lg last:rounded-e-lg"
                    onclick={EditorRequestsHandler.getInstance().validate}>
                <ThumbsUpOutline class="freon-toolbar-icon"/>
            </Button>
            <Button id="interpret-button" tabindex={-1} {disabled} class="freon-btn rounded-none first:rounded-s-lg last:rounded-e-lg"
                    onclick={EditorRequestsHandler.getInstance().interpret}>
                <PlayOutline class="freon-toolbar-icon"/>
            </Button>
            <Button id="views-button" tabindex={-1} {disabled} class="freon-btn rounded-none first:rounded-s-lg last:rounded-e-lg"
                    onclick={() => {dialogs.selectViewsDialogVisible = true}}>
                <EyeOutline class="freon-toolbar-icon"/>
            </Button>
            <Button id="deltas-button" tabindex={-1} {disabled} class="freon-btn rounded-none first:rounded-s-lg last:rounded-e-lg"
                    onclick={EditorRequestsHandler.getInstance().showDeltas}>
                <FileImportOutline class="freon-toolbar-icon"/>
            </Button>
        </div>
    </div>

    <!-- RIGHT SIDE -->
    <div class="relative flex items-center">
        <div class="flex absolute inset-y-0 inset-s-0 items-center ps-3 pointer-events-none ">
            <SearchOutline class="w-4 h-4 " />
        </div>
        <Input
            tabindex={-1}
            {disabled}
            id="search-navbar"
            size="sm"
            placeholder="Search..."
            bind:value={innerSearchText}
            onkeydown={search}
            class="freon-toolbar-search h-9 rounded-md border ps-10 pe-3 text-sm"
        />
    </div>
    <!--  tooltips need to be outside of the button group, otherwise the styling will not be correct  -->
    <Tooltip tabindex={-1} triggeredBy="#model-button" placement="bottom" class="freon-tooltip">Show Model Information</Tooltip>
    <Tooltip tabindex={-1} triggeredBy="#save-button" placement="bottom" class="freon-tooltip">Save Model</Tooltip>
    <Tooltip tabindex={-1} triggeredBy="#undo-button" placement="bottom" class="freon-tooltip">Undo</Tooltip>
    <Tooltip tabindex={-1} triggeredBy="#redo-button" placement="bottom" class="freon-tooltip">Redo</Tooltip>
    <Tooltip tabindex={-1} triggeredBy="#cut-button" placement="bottom" class="freon-tooltip">Cut</Tooltip>
    <Tooltip tabindex={-1} triggeredBy="#copy-button" placement="bottom" class="freon-tooltip">Copy</Tooltip>
    <Tooltip tabindex={-1} triggeredBy="#paste-button" placement="bottom" class="freon-tooltip">Paste</Tooltip>
    <Tooltip tabindex={-1} triggeredBy="#element-search-button" placement="bottom" class="freon-tooltip">Search for Type</Tooltip>
    <Tooltip tabindex={-1} triggeredBy="#validate-button" placement="bottom" class="freon-tooltip">Validate</Tooltip>
    <Tooltip tabindex={-1} triggeredBy="#interpret-button" placement="bottom" class="freon-tooltip">Interpret</Tooltip>
    <Tooltip tabindex={-1} triggeredBy="#views-button" placement="bottom" class="freon-tooltip">Change Views</Tooltip>
</div>
