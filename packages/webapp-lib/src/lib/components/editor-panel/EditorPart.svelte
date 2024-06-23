<div class='editor-part'>
    {#if ($noUnitAvailable)}
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
    import { noUnitAvailable } from "../stores/ModelStore.js";
    import {WebappConfigurator} from "../../WebappConfigurator.js";
</script>

<style>
    .editor-part {
        height: 100%;
        box-sizing: border-box;
        padding:  0px 4px 4px 4px; /* top padding is 0 because the progress indicator uses 4px height */
    }
    .message {
        margin: 30px;
        text-align: center;
    }
</style>
