<script lang="ts">
    import {dialogs, messageInfo, noUnitAvailable} from "$lib";
    import {fly} from "svelte/transition";
    import {WebappConfigurator, EditorRequestsHandler} from "$lib/language/index.js";
    import { Alert, Button, Dropdown, DropdownItem } from "flowbite-svelte"
    import {
        ClipboardSolid,
        DotsHorizontalOutline, FileCopySolid, FilePasteSolid,
        InfoCircleSolid, RedoOutline, SearchOutline, UndoOutline, PlaySolid, EyeOutline,
        ThumbsUpOutline
    } from "flowbite-svelte-icons";
    import {FreonComponent} from "@freon4dsl/core-svelte";
    import {isNullOrUndefined} from "@freon4dsl/core";
</script>

<div class='bg-white dark:bg-gray-700 dark:text-white p-2'>
    {#if (noUnitAvailable.value || isNullOrUndefined(WebappConfigurator.getInstance().langEnv?.editor))}
        {#if !messageInfo.userMessageOpen}
            <Alert color="red" transition={fly} params={{ x: 200 }}>
                <InfoCircleSolid slot="icon" class="w-5 h-5"/>
                Please, select, create, or import Unit to be shown.
            </Alert>
        {/if}
    {:else}
        <!-- Snippet editorActions() has exact same content, but placement of button is lower when user message is shown. -->
        {#if messageInfo.userMessageOpen}
            <Button id='actions-button' name="Editor actions" size="xs"
                    class="absolute end-6 top-40 z-10 bg-primary-400 text-black dark:text-white dark:bg-primary-800"
                    pill>
                <DotsHorizontalOutline class="w-5 h-7 dark:text-white"/>
            </Button>
            {@render editorActions()}
        {:else}
            <Button id='actions-button' name="Editor actions" size="xs"
                    class="absolute end-6 top-20 z-10 bg-primary-400 text-black dark:text-white dark:bg-primary-800"
                    pill>
                <DotsHorizontalOutline class="w-5 h-7 dark:text-white"/>
            </Button>
            {@render editorActions()}
        {/if}
        <FreonComponent editor={WebappConfigurator.getInstance().langEnv?.editor}/>
    {/if}
</div>

{#snippet editorActions()}
<Dropdown triggeredBy="#actions-button">
<!-- Cannot get the onclick of Flowbite's ListgroupItem working, therefore I use a plain div, with plain buttons here.   -->
    <div class="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
        <button type="button" onclick={EditorRequestsHandler.getInstance().undo}
                class="flex items-center text-left py-2 px-4 w-full text-sm font-medium list-none first:rounded-t-lg last:rounded-b-lg hover:bg-gray-100 hover:text-primary-700 dark:hover:bg-gray-600 dark:hover:text-white focus:z-40 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:text-primary-700 dark:focus:ring-gray-500 dark:focus:text-white flex"
                aria-current="false">
            <UndoOutline class="w-4 h-4 me-2 dark:text-white"/>
            Undo
        </button>
        <button type="button" onclick={EditorRequestsHandler.getInstance().redo}
                class="flex items-center text-left py-2 px-4 w-full text-sm font-medium list-none first:rounded-t-lg last:rounded-b-lg hover:bg-gray-100 hover:text-primary-700 dark:hover:bg-gray-600 dark:hover:text-white focus:z-40 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:text-primary-700 dark:focus:ring-gray-500 dark:focus:text-white flex"
                aria-current="false">
            <RedoOutline class="w-4 h-4 me-2 dark:text-white"/>
            Redo
        </button>
        <button type="button" onclick={EditorRequestsHandler.getInstance().cut}
                class="flex items-center text-left py-2 px-4 w-full text-sm font-medium list-none first:rounded-t-lg last:rounded-b-lg hover:bg-gray-100 hover:text-primary-700 dark:hover:bg-gray-600 dark:hover:text-white focus:z-40 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:text-primary-700 dark:focus:ring-gray-500 dark:focus:text-white flex"
                aria-current="false">
            <ClipboardSolid class="w-4 h-4 me-2 dark:text-white"/>
            Cut
        </button>
        <button type="button" onclick={EditorRequestsHandler.getInstance().copy}
                class="flex items-center text-left py-2 px-4 w-full text-sm font-medium list-none first:rounded-t-lg last:rounded-b-lg hover:bg-gray-100 hover:text-primary-700 dark:hover:bg-gray-600 dark:hover:text-white focus:z-40 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:text-primary-700 dark:focus:ring-gray-500 dark:focus:text-white flex"
                aria-current="false">
            <FileCopySolid class="w-4 h-4 me-2 dark:text-white"/>
            Copy
        </button>
        <button type="button" onclick={EditorRequestsHandler.getInstance().paste}
                class="flex items-center text-left py-2 px-4 w-full text-sm font-medium list-none first:rounded-t-lg last:rounded-b-lg hover:bg-gray-100 hover:text-primary-700 dark:hover:bg-gray-600 dark:hover:text-white focus:z-40 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:text-primary-700 dark:focus:ring-gray-500 dark:focus:text-white flex"
                aria-current="false">
            <FilePasteSolid class="w-4 h-4 me-2 dark:text-white"/>
            Paste
        </button>
        <button type="button" id='search-button'
                class="flex items-center text-left py-2 px-4 w-full text-sm font-medium list-none first:rounded-t-lg last:rounded-b-lg hover:bg-gray-100 hover:text-primary-700 dark:hover:bg-gray-600 dark:hover:text-white focus:z-40 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:text-primary-700 dark:focus:ring-gray-500 dark:focus:text-white flex"
                aria-current="false">
            <SearchOutline class="w-4 h-4 me-2 dark:text-white"/>
            Search...
            <Dropdown triggeredBy="#search-button">
                <DropdownItem onclick={() => {dialogs.searchTextDialogVisible = true}}>Plain text</DropdownItem>
                <DropdownItem onclick={() => {dialogs.searchElementDialogVisible = true}}>Element</DropdownItem>
            </Dropdown>
        </button>
        <button type="button" onclick={EditorRequestsHandler.getInstance().validate}
                class="flex items-center text-left py-2 px-4 w-full text-sm font-medium list-none first:rounded-t-lg last:rounded-b-lg hover:bg-gray-100 hover:text-primary-700 dark:hover:bg-gray-600 dark:hover:text-white focus:z-40 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:text-primary-700 dark:focus:ring-gray-500 dark:focus:text-white flex"
                aria-current="false">
            <ThumbsUpOutline class="w-4 h-4 me-2 dark:text-white"/>
            Validate
        </button>
<!--        <button type="button" onclick={EditorRequestsHandler.getInstance().interpret}-->
<!--                class="flex items-center text-left py-2 px-4 w-full text-sm font-medium list-none first:rounded-t-lg last:rounded-b-lg hover:bg-gray-100 hover:text-primary-700 dark:hover:bg-gray-600 dark:hover:text-white focus:z-40 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:text-primary-700 dark:focus:ring-gray-500 dark:focus:text-white flex"-->
<!--                aria-current="false">-->
<!--            <PlaySolid class="w-4 h-4 me-2 dark:text-white"/>-->
<!--            Interpret-->
<!--        </button>-->
        <button type="button" onclick={() => {dialogs.selectViewsDialogVisible = true}}
                class="flex items-center text-left py-2 px-4 w-full text-sm font-medium list-none first:rounded-t-lg last:rounded-b-lg over:bg-gray-100 hover:text-primary-700 dark:hover:bg-gray-600 dark:hover:text-white focus:z-40 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:text-primary-700 dark:focus:ring-gray-500 dark:focus:text-white flex"
                aria-current="false">
            <EyeOutline class="w-4 h-4 me-2 dark:text-white"/>
            View(s)
        </button>
    </div>
</Dropdown>
{/snippet}
