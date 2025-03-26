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
</script>

<div class='bg-white dark:bg-gray-700 dark:text-white p-2'>
    {#if (noUnitAvailable.value || isNullOrUndefined(WebappConfigurator.getInstance().langEnv?.editor))}
        {#if !userMessageOpen.value}
            <Alert color="red" transition={fly} params={{ x: 200 }}>
                <InfoCircleSolid slot="icon" class="w-5 h-5"/>
                Please, select, create, or import Unit to be shown.
            </Alert>
        {/if}
    {:else}
        {#if userMessageOpen.value}
            <Alert color="red" dismissable transition={fly} params={{ x: 200 }} class="p-1 gap-0">
                <InfoCircleSolid slot="icon" class="w-5 h-5"/>
                {messageInfo.userMessage}
                <Button slot="close-button" size="xs"
                        onclick={() => {userMessageOpen.value = !userMessageOpen.value}} class="ms-auto bg-secondary-800">
                    Dismiss
                </Button>
            </Alert>
        {/if}
        <FreonComponent editor={WebappConfigurator.getInstance().langEnv?.editor}/>
    {/if}
</div>
