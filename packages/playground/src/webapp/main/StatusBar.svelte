<div class="status-bar">
    {#if ($modelErrors.length > 0)}
        <Icon style="color:var(--theme-colors-accent); height: var(--pi-footer-height)">
            <svelte:component this={error} />
        </Icon>
    {:else}
        <Icon style="color:var(--theme-colors-color); height: var(--pi-footer-height)">
            <svelte:component this={check} />
        </Icon>
    {/if}
    unit <i>{$currentUnitName}</i> of model <i>{$currentModelName}</i>

    <div class="vl"></div>
</div>

<script lang="ts">
    import { currentUnitName, currentModelName } from "../WebappStore";
    import { modelErrors } from "../main-ts-files/ModelErrorsStore";
    import { Icon } from "svelte-mui";
    import error from "../assets/icons/svg/error.svg";
    import check from "../assets/icons/svg/check_circle.svg";
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
