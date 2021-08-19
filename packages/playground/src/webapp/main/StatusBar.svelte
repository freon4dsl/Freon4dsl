<!-- The AppBar is always shown at the top of the viewport -->
<!-- It contains the menus, the name of the language, and ... -->

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
    unit <i>{$currentUnitName}</i> of model <i>{$currentModelName}  box: {currentBox?.role} </i>

    <div class="vl"></div>
</div>

<script lang="ts">
    import { currentUnitName, currentModelName } from "../WebappStore";
    import { modelErrors } from "../main-ts-files/ModelErrorsStore";
    import { Icon } from "svelte-mui";
    import error from "../assets/icons/svg/error.svg";
    import check from "../assets/icons/svg/check_circle.svg";
    import { Box } from "@projectit/core";
    import { autorun } from "mobx";
    import { editorEnvironment } from "../WebappConfiguration";

    let currentBox: Box = null;

    autorun( () => {
        currentBox = editorEnvironment.editor.selectedBox;
    });
</script>

<style>
    .status-bar {
        display: flex;
        align-items: center;
        height: var(--pi-header-height);
        color: var(--pi-darkblue);
        background: var(--pi-lightblue);
        font-size: var(--button-font-size);
        line-height: 1;
        min-width: inherit;
        padding: 0 4px 0 6px;
        position: fixed;
        left: 8px;
        bottom: calc(var(--pi-footer-height) + 8px);
        border: var(--pi-darkblue) solid 1px;
        right: 6px;
        z-index: 20;
    }
    .vl {
        border-left: 1px solid var(--pi-darkblue);
        height: var(--pi-header-height);
        display:inline;
        margin: 6px;
    }
</style>
