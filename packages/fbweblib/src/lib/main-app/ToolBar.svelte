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
import { Banner, Button, Input } from "flowbite-svelte"
import { ENTER } from "@freon4dsl/core"

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

const buttonCls: string= "rounded-none font-normal p-1 text-primary-700 bg-secondary-50 hover:text-primary-50 dark:text-primary-50 dark:bg-secondary-900"
const iconCls: string = "w-4 h-4 me-2 dark:text-primary-50"

</script>

<Banner dismissable={false} class="p-0">
    <div class="flex w-full justify-between flex-nowrap bg-secondary-50 dark:bg-secondary-900 text-secondary-500 dark:text-secondary-400 border border-secondary-200 dark:border-secondary-700 divide-y divide-gray-200 dark:divide-gray-600">
        <div class="ml-2">
            <Button class="{buttonCls}" onclick={EditorRequestsHandler.getInstance().undo}>
                <UndoOutline class="{iconCls}"/>
                Undo
            </Button>
            <Button class="{buttonCls}" onclick={EditorRequestsHandler.getInstance().redo}>
                <RedoOutline class="{iconCls}"/>
                Redo
            </Button>
            <Button class="{buttonCls}" onclick={EditorRequestsHandler.getInstance().cut}>
                <ClipboardOutline class="{iconCls}"/>
                Cut
            </Button>
            <Button class="{buttonCls}" onclick={EditorRequestsHandler.getInstance().copy}>
                <FileCopyOutline class="{iconCls}"/>
                Copy
            </Button>
            <Button class="{buttonCls}" onclick={EditorRequestsHandler.getInstance().paste}>
                <FilePasteOutline class="{iconCls}"/>
                Paste
            </Button>
            <Button class="{buttonCls}" onclick={() => {dialogs.searchElementDialogVisible = true}}>
                <SearchOutline class="{iconCls}"/>
                Element...
            </Button>
            <Button class="{buttonCls}" onclick={EditorRequestsHandler.getInstance().validate}>
                <ThumbsUpOutline class="{iconCls}"/>
                Validate
            </Button>
            <Button class="{buttonCls}" onclick={EditorRequestsHandler.getInstance().interpret}>
                <PlayOutline class="{iconCls}"/>
                Interpret
            </Button>
            <Button class="{buttonCls}" onclick={() => {dialogs.selectViewsDialogVisible = true}}>
                <EyeOutline class="{iconCls}"/>
                View(s)...
            </Button>
        </div>
        <div class="relative ">
            <div class="flex absolute inset-y-0 start-0 items-center ps-3 pointer-events-none text-primary-700 dark:bg-secondary-50">
                <SearchOutline class="w-4 h-4 " />
            </div>
            <Input id="search-navbar"
                   class="rounded-none h-full border-l border-t-0 border-b-0 ps-10 py-1 text-primary-700 dark:text-primary-100 bg-primary-50 dark:bg-secondary-50"
                   floatClass="text-secondary-500 dark:text-secondary-400"
                   size="sm"
                   placeholder="Search..."
                   onkeydown={onKeydown}
            />
        </div>
    </div>
</Banner>
