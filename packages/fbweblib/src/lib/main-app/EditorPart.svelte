<script>
    import {messageInfo, noUnitAvailable} from "$lib";
    import {fly} from "svelte/transition";
    import {WebappConfigurator} from "$lib/language/index.js";
    import {Alert, Button, Listgroup, ListgroupItem, SpeedDial, Tooltip} from "flowbite-svelte";
    import {
        ClipboardSolid,
        DotsHorizontalOutline, FileCopySolid, FilePasteSolid,
        InfoCircleSolid, RedoOutline, SearchOutline, UndoOutline,
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
        <!-- SpeedDail has exact same content, but placement is lower when user message is shown. -->
        <!-- Cannot use svelte snippet here, because Flowbite component is still using slots. -->
        {#if messageInfo.userMessageOpen}
            <SpeedDial defaultClass="absolute end-6 top-40 z-10" placement="top-end" trigger="hover">
                <Button slot="button" name="Editor actions" size="xs" class="bg-primary-400 text-black dark:text-white dark:bg-primary-900"
                        pill>
                    <DotsHorizontalOutline class="w-5 h-7 dark:text-white"/>
                </Button>
                <Listgroup active>
                    <ListgroupItem class="flex">
                        <UndoOutline class="w-4 h-4 me-2 dark:text-white"/>
                        Undo
                    </ListgroupItem>
                    <ListgroupItem class="flex">
                        <RedoOutline class="w-4 h-4 me-2 dark:text-white"/>
                        Redo
                    </ListgroupItem>
                    <ListgroupItem class="flex">
                        <ClipboardSolid class="w-4 h-4 me-2 dark:text-white"/>
                        Cut
                    </ListgroupItem>
                    <ListgroupItem class="flex">
                        <FileCopySolid class="me-2 w-5 h-5"/>
                        Copy
                    </ListgroupItem>
                    <ListgroupItem class="flex">
                        <FilePasteSolid class="w-4 h-4 me-2 dark:text-white"/>
                        Paste
                    </ListgroupItem>
                    <ListgroupItem class="flex">
                        <SearchOutline class="w-4 h-4 me-2 dark:text-white"/>
                        Find...
                    </ListgroupItem>
                    <ListgroupItem class="flex">
                        <SearchOutline class="w-4 h-4 me-2 dark:text-white"/>
                        Validate
                    </ListgroupItem>
                    <ListgroupItem class="flex">
                        <SearchOutline class="w-4 h-4 me-2 dark:text-white"/>
                        Interpreter
                    </ListgroupItem>
                    <ListgroupItem class="flex">
                        <SearchOutline class="w-4 h-4 me-2 dark:text-white"/>
                        View(s)
                    </ListgroupItem>
                </Listgroup>
            </SpeedDial>
        {:else}
            <SpeedDial defaultClass="absolute end-6 top-20 z-10" placement="top-end" trigger="hover">
                <Button slot="button" name="Editor actions" size="xs" class="bg-primary-400 text-black dark:text-white dark:bg-primary-800"
                        pill>
                    <DotsHorizontalOutline class="w-5 h-7 dark:text-white"/>
                </Button>
                <Tooltip placement="bottom">Editor actions</Tooltip>
                <Listgroup active>
                    <ListgroupItem class="flex">
                        <UndoOutline class="w-4 h-4 me-2 dark:text-white"/>
                        Undo
                    </ListgroupItem>
                    <ListgroupItem class="flex">
                        <RedoOutline class="w-4 h-4 me-2 dark:text-white"/>
                        Redo
                    </ListgroupItem>
                    <ListgroupItem class="flex">
                        <ClipboardSolid class="w-4 h-4 me-2 dark:text-white"/>
                        Cut
                    </ListgroupItem>
                    <ListgroupItem class="flex">
                        <FileCopySolid class="me-2 w-5 h-5"/>
                        Copy
                    </ListgroupItem>
                    <ListgroupItem class="flex">
                        <FilePasteSolid class="w-4 h-4 me-2 dark:text-white"/>
                        Paste
                    </ListgroupItem>
                    <ListgroupItem class="flex">
                        <SearchOutline class="w-4 h-4 me-2 dark:text-white"/>
                        Find...
                    </ListgroupItem>
                    <ListgroupItem class="flex">
                        <SearchOutline class="w-4 h-4 me-2 dark:text-white"/>
                        Validate
                    </ListgroupItem>
                    <ListgroupItem class="flex">
                        <SearchOutline class="w-4 h-4 me-2 dark:text-white"/>
                        Interpreter
                    </ListgroupItem>
                    <ListgroupItem class="flex">
                        <SearchOutline class="w-4 h-4 me-2 dark:text-white"/>
                        View(s)
                    </ListgroupItem>
                </Listgroup>
            </SpeedDial>
        {/if}
        <FreonComponent editor={WebappConfigurator.getInstance().langEnv?.editor}/>
    {/if}
</div>
