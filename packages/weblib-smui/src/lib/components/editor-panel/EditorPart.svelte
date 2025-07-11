<div class='editor-part'>
    {#if (noUnitAvailable.value)}
        <div class="message">
        <div class="mdc-typography--subtitle1">
            Please, select, create, or import Unit to be shown.
        </div>
            </div>
    {:else}
        <FreonComponent editor={WebappConfigurator.getInstance().editorEnvironment.editor}/>
    {/if}
</div>

<script lang="ts">
    import { FreonComponent } from "@freon4dsl/core-svelte";
    import { noUnitAvailable } from "../stores/ModelStore.svelte";
    import {WebappConfigurator} from "$lib";
</script>

<style>
    .editor-part {
        height: 100%;
        box-sizing: border-box;
        padding:  0 4px 4px 4px; /* top padding is 0 because the progress indicator uses 4px height */
    }
    .message {
        margin: 30px;
        text-align: center;
    }
</style>
