<script lang="ts">
import { EditorRequestsHandler } from "$lib/language/index.js"
import { dialogs } from "$lib"
import {
    ClipboardOutline,
    EyeOutline,
    FileCopyOutline,
    FilePasteOutline,
    RedoOutline,
    SearchOutline,
    ThumbsUpOutline,
    UndoOutline,
    PlayOutline
} from "flowbite-svelte-icons"
import { Button, Input } from "flowbite-svelte"

function onSearchInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    EditorRequestsHandler.getInstance().findText(event.currentTarget.value);
}
</script>


<div class="flex justify-between flex-nowrap bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
    <div class="ml-2">
        <Button class="text-primary-700 font-normal bg-gray-50 hover:text-primary-50 dark:text-white  dark:bg-gray-800 p-1" onclick={EditorRequestsHandler.getInstance().undo}>
            <UndoOutline class="w-4 h-4 me-2 dark:text-white"/>
            Undo
        </Button>
        <Button class=" text-primary-700 font-normal bg-gray-50 hover:text-primary-50 dark:text-white dark:bg-gray-800 p-1" onclick={EditorRequestsHandler.getInstance().redo}>
            <RedoOutline class="w-4 h-4 me-2 dark:text-white"/>
            Redo
        </Button>
        <Button class=" text-primary-700 font-normal bg-gray-50 hover:text-primary-50 dark:text-white dark:bg-gray-800 p-1" onclick={EditorRequestsHandler.getInstance().cut}>
            <ClipboardOutline class="w-4 h-4 me-2 dark:text-white"/>
            Cut
        </Button>
        <Button class=" text-primary-700 font-normal bg-gray-50 hover:text-primary-50 dark:text-white dark:bg-gray-800 p-1" onclick={EditorRequestsHandler.getInstance().copy}>
            <FileCopyOutline class="w-4 h-4 me-2 dark:text-white"/>
            Copy
        </Button>
        <Button class=" text-primary-700 font-normal bg-gray-50 hover:text-primary-50 dark:text-white dark:bg-gray-800 p-1" onclick={EditorRequestsHandler.getInstance().paste}>
            <FilePasteOutline class="w-4 h-4 me-2 dark:text-white"/>
            Paste
        </Button>
        <Button class=" text-primary-700 font-normal bg-gray-50 hover:text-primary-50 dark:text-white dark:bg-gray-800 p-1" onclick={() => {dialogs.searchElementDialogVisible = true}}>
            <SearchOutline class="w-4 h-4 me-2 dark:text-white"/>
            Element...
        </Button>
        <Button class=" text-primary-700 font-normal bg-gray-50 hover:text-primary-50 dark:text-white dark:bg-gray-800 p-1" onclick={EditorRequestsHandler.getInstance().validate}>
            <ThumbsUpOutline class="w-4 h-4 me-2 dark:text-white"/>
            Validate
        </Button>
                <Button class=" text-primary-700 font-normal bg-gray-50 hover:text-primary-50 dark:text-white dark:bg-gray-800 p-1" onclick={EditorRequestsHandler.getInstance().interpret}>
                    <PlayOutline class="w-4 h-4 me-2 dark:text-white"/>
                    Interpret
                </Button>
        <Button class=" text-primary-700 font-normal bg-gray-50 hover:text-primary-50 dark:text-white dark:bg-gray-800 p-1" onclick={() => {dialogs.selectViewsDialogVisible = true}}>
            <EyeOutline class="w-4 h-4 me-2 dark:text-white"/>
            View(s)...
        </Button>
    </div>
    <div class="relative">
        <div class="flex absolute inset-y-0 start-0 items-center ps-3 pointer-events-none text-primary-700">
            <SearchOutline class="w-4 h-4" />
        </div>
        <Input id="search-navbar" class="ps-10 py-1 text-primary-700" size="sm" placeholder="Search..." onchange={onSearchInput}/>
    </div>

    </div>
