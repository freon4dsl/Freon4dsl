<script lang="ts">
    import { dialogs, messageInfo, noUnitAvailable, userMessageOpen } from "$lib"
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

    let alertCls: string = 'p-1 m-2 gap-1 bg-secondary-600 dark:bg-secondary-200 text-primary-50 dark:text-primary-900';
</script>

<div class='bg-white dark:bg-primary-50 dark:text-primary-50 p-2'>
    {#if (noUnitAvailable.value || isNullOrUndefined(WebappConfigurator.getInstance().langEnv?.editor))}
        {#if !userMessageOpen.value}
            <Alert transition={fly} params={{ x: 200 }} class={alertCls}>
                <InfoCircleSolid slot="icon" class="w-5 h-5"/>
                Please, select, create, or import Unit to be shown.
            </Alert>
        {/if}
    {:else}
        {#if userMessageOpen.value}
            <Alert dismissable transition={fly} params={{ x: 200 }} class={alertCls}>
                <InfoCircleSolid slot="icon" class="w-5 h-5"/>
                {messageInfo.userMessage}
                <Button slot="close-button" size="xs"
                        onclick={() => {userMessageOpen.value = !userMessageOpen.value}} class="ms-auto dark:text-secondary-100 bg-primary-800 dark:bg-primary-800">
                    Dismiss
                </Button>
            </Alert>
        {/if}
        <FreonComponent editor={WebappConfigurator.getInstance().langEnv?.editor}/>
    {/if}
</div>
