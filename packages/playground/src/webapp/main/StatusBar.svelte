<div class="status-bar">
    <div class="vl"></div>
    unit <i>{$currentUnitName}</i> of model <i>{$currentModelName}</i>
    {#if ($modelErrors.length > 0)}
        <div class="vl"></div>
        number of errors: {$modelErrors.length}
    {/if}
    <div class="vl"></div>
</div>

<script lang="ts">
    import { currentUnitName, currentModelName } from "../WebappStore";
    import { modelErrors } from "../main-ts-files/ModelErrorsStore";
</script>

<style>
    .status-bar {
        position: relative;
        height: var(--pi-footer-height);
        width: 100%;
        color: var(--theme-colors-color);
        background: var(--theme-colors-inverse_color);
        font-size: var(--pi-button-font-size);
        border-bottom: var(--theme-colors-list_divider) solid 1px;
    }
    .vl {
        border-left: 1px solid var(--theme-colors-color);
        height: var(--pi-header-height);
        display:inline;
        margin: 6px;
        position: relative;
    }
</style>
