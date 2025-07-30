<script lang="ts">
import { EditorRequestsHandler } from "$lib/language/index.js"
import { dialogs, drawerHidden } from '$lib';
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
    FloppyDiskSolid
} from 'flowbite-svelte-icons';
import { Button, Input, Tooltip } from 'flowbite-svelte';
import { ENTER } from "@freon4dsl/core"
import { tooltipClass } from '$lib/stores/StylesStore.svelte';


/**
 * We use the key ENTER here to be able to search again, when the search text has not changed, but possibly
 * the model has. The onchange event only triggers when the search text has changed.
 * @param event
 */
function onKeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    if (event.key === ENTER) {
        EditorRequestsHandler.getInstance().findText(event.currentTarget.value);
    }
}

const buttonCls: string= 'rounded-none font-normal px-2 py-1 mx-2' +
  'text-light-base-50           dark:text-dark-base-900 ' +
  'bg-light-base-600 					  dark:bg-dark-base-200 ' +
  'hover:bg-light-base-900      dark:hover:bg-dark-base-50 ';
const iconCls: string = "w-4 h-4";
const searchFieldCls: string =
  'text-light-base-50           dark:text-dark-base-900 ' +
  'bg-light-base-600 					  dark:bg-dark-base-200 ' +
  'hover:bg-light-base-50       dark:hover:bg-dark-base-900 ' +
  'hover:text-light-base-900    dark:hover:text-dark-base-900' +
  'placeholder-light-base-100   dark:placeholder-dark-base-800';

</script>

<div id="freon-toolbar" class="p-0">
    <div class="flex w-full justify-between flex-nowrap bg-light-base-100 dark:bg-dark-base-800 border border-light-base-100 dark:border-dark-base-800 ">
        <div class="flex justify-start flex-nowrap">
        <!--  Model panel button and tooltip      -->
        <Button
            id="model-button"
            tabindex={-1}
            class="{buttonCls} pill={true} ml-2  bg-light-accent-700 dark:bg-dark-accent-700" onclick={() => (drawerHidden.value = false)}>
            <ChevronRightOutline class="w-5 h-5" />
        </Button>
        <Tooltip tabindex={-1} placement="bottom" class={tooltipClass}>Show Model Info</Tooltip>
        <span id="spacer" class="inline-block min-w-8">&nbsp;</span>
        <div>
            <!--  Buttons for editor actions      -->
            <Button id="save-button" tabindex={-1} class={buttonCls} onclick={EditorRequestsHandler.getInstance().saveModel}>
                <FloppyDiskSolid class="{iconCls}"/>
            </Button>
            <Button id="undo-button" tabindex={-1} class={buttonCls} onclick={EditorRequestsHandler.getInstance().undo}>
                <UndoOutline class={iconCls}/>
            </Button>
            <Button id="redo-button" tabindex={-1} class={buttonCls} onclick={EditorRequestsHandler.getInstance().redo}>
                <RedoOutline class={iconCls}/>
            </Button>
            <Button id="cut-button" tabindex={-1} class={buttonCls} onclick={EditorRequestsHandler.getInstance().cut}>
                <ClipboardOutline class={iconCls}/>
            </Button>
            <Button id="copy-button" tabindex={-1} class={buttonCls} onclick={EditorRequestsHandler.getInstance().copy}>
                <FileCopyOutline class={iconCls}/>
            </Button>
            <Button id="paste-button" tabindex={-1} class={buttonCls} onclick={EditorRequestsHandler.getInstance().paste}>
                <FilePasteOutline class={iconCls}/>
            </Button>
            <Button id="element-search-button" tabindex={-1} class={buttonCls} onclick={() => {dialogs.searchElementDialogVisible = true}}>
                <SearchOutline tabindex={-1} class={iconCls}/>
            </Button>
            <Button id="validate-button" tabindex={-1} class={buttonCls} onclick={EditorRequestsHandler.getInstance().validate}>
                <ThumbsUpOutline class={iconCls}/>
            </Button>
            <Button id="interpret-button" tabindex={-1} class={buttonCls} onclick={EditorRequestsHandler.getInstance().interpret}>
                <PlayOutline class={iconCls}/>
            </Button>
            <Button id="views-button" tabindex={-1} class={buttonCls} onclick={() => {dialogs.selectViewsDialogVisible = true}}>
                <EyeOutline class={iconCls}/>
            </Button>
        </div>
            <!--  tooltips need to be outside of the button group, otherwise the styling will not be correct  -->
            <Tooltip tabindex={-1} triggeredBy="#model-button" placement="bottom" class="{tooltipClass}">Show Model Information</Tooltip>
            <Tooltip tabindex={-1} triggeredBy="#save-button" placement="bottom" class="{tooltipClass}">Save Model</Tooltip>
            <Tooltip tabindex={-1} triggeredBy="#undo-button" placement="bottom" class="{tooltipClass}">Undo</Tooltip>
            <Tooltip tabindex={-1} triggeredBy="#redo-button" placement="bottom" class="{tooltipClass}">Redo</Tooltip>
            <Tooltip tabindex={-1} triggeredBy="#cut-button" placement="bottom" class="{tooltipClass}">Cut</Tooltip>
            <Tooltip tabindex={-1} triggeredBy="#copy-button" placement="bottom" class="{tooltipClass}">Copy</Tooltip>
            <Tooltip tabindex={-1} triggeredBy="#paste-button" placement="bottom" class="{tooltipClass}">Paste</Tooltip>
            <Tooltip tabindex={-1} triggeredBy="#element-search-button" placement="bottom" class="{tooltipClass}">Search for Type</Tooltip>
            <Tooltip tabindex={-1} triggeredBy="#validate-button" placement="bottom" class="{tooltipClass}">Validate</Tooltip>
            <Tooltip tabindex={-1} triggeredBy="#interpret-button" placement="bottom" class="{tooltipClass}">Interpret</Tooltip>
            <Tooltip tabindex={-1} triggeredBy="#views-button" placement="bottom" class="{tooltipClass}">Change Views</Tooltip>
        </div>
        <div class="relative {searchFieldCls}">
            <div class="flex absolute inset-y-0 start-0 items-center ps-3 pointer-events-none ">
                <SearchOutline class="w-4 h-4 " />
            </div>
            <Input tabindex={-1} 
                   id="search-navbar"
                   class="rounded-none h-full border-l border-t-0 border-b-0 ps-10 py-1 {searchFieldCls}
                   floatClass="{searchFieldCls}
                   size="sm"
                   placeholder="Search..."
                   onkeydown={onKeydown}
            />
        </div>
    </div>
</div>
