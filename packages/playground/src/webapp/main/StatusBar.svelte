<!-- The AppBar is always shown at the top of the viewport -->
<!-- It contains the menus, the name of the language, and ... -->

<div class="status-bar">
    {#if ($modelErrors.length > 0)}
        <Icon class="icon" style="color:var(--theme-colors-accent);">
            <svelte:component this={error} />
        </Icon>
    {:else}
        <Icon class="icon">
            <svelte:component this={check} />
        </Icon>
    {/if}
    unit: <i>{$currentUnitName}</i>
    <Icon class="icon">
        <svelte:component this={arrowRight} />
    </Icon>
    elem: <i>{currentBox?.element?.piLanguageConcept()} - {currentBox?.element?.piId()}  </i>
    box: <i>{currentBox?.role} {currentBox?.$id}</i>
    kind: <i>{currentBox?.kind} </i>
    (x, y): <i>{(!!currentBox ? Math.round(currentBox.actualX + editorEnvironment.editor.scrollX)
                + ", " + Math.round(currentBox?.actualY + editorEnvironment.editor.scrollY): "NAN")}
    "{(isTextBox(currentBox) ? currentBox.getText() : "NotTextBox" )}"</i>
</div>

<script lang="ts">
    import { currentUnitName } from "../webapp-ts-utils/WebappStore";
    import { modelErrors } from "../webapp-ts-utils/InfoPanelStore";
    import { Icon } from "svelte-mui";
    import error from "../assets/icons/svg/error.svg";
    import check from "../assets/icons/svg/check_circle.svg";
    import arrowRight from "../assets/icons/svg/keyboard_arrow_right.svg"
    import { Box, isTextBox } from "@projectit/core";
    import { autorun } from "mobx";
    import { editorEnvironment } from "../WebappConfiguration";

    let currentBox: Box = null;

    autorun( () => {
        currentBox = editorEnvironment.editor.selectedBox;
    });
</script>

<style>
    .status-bar {
        position: relative;
        height: var(--pi-statusbar-height);
        width: 100%;
        color: var(--theme-colors-color);
        background: var(--theme-colors-inverse_color);
        font-size: var(--pi-button-font-size);
        border-bottom: var(--theme-colors-list_divider) solid 1px;
        box-sizing: border-box;
    }
</style>
