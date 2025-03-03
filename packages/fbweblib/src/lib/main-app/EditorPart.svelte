<script>
    import {messageInfo, noUnitAvailable} from "$lib";
    import {fly} from "svelte/transition";
    import {WebappConfigurator} from "$lib/language/index.js";
    import {Alert} from "flowbite-svelte";
    import {
        InfoCircleSolid,
    } from "flowbite-svelte-icons";
    import {FreonComponent} from "@freon4dsl/core-svelte";
    import {isNullOrUndefined} from "@freon4dsl/core";
    import EditorSpeedDial from "$lib/main-app/EditorSpeedDial.svelte";
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
        <EditorSpeedDial/>
        <FreonComponent editor={WebappConfigurator.getInstance().langEnv?.editor}/>
    {/if}
</div>

