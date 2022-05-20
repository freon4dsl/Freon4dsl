<!-- The StatusBar presents info about the unit in the editor: name, whether there are errors, etc. -->

<script lang="ts">
    import { Box, isTextBox } from "@projectit/core";
    import { autorun } from "mobx";
    import { editorEnvironment } from "../../config/WebappConfiguration";
    import { currentModelName, currentUnitName } from "../stores/ModelStore";
    import { modelErrors } from "../stores/InfoPanelStore";
    import { mdiCheckCircle, mdiChevronRight, mdiAlertCircle } from "@mdi/js";
    import { Svg } from "@smui/common/elements";
    import { Icon } from "@smui/common";
    import IconButton from "@smui/button";

    let currentBox: Box = null;

    autorun(() => {
        currentBox = editorEnvironment.editor.selectedBox;
    });
</script>

<span class="status-bar">
	<div class='mdc-typography--body2'>
	<IconButton size="button" style="margin-right: -24px; margin-left: -12px;">
		{#if $modelErrors.length > 0}
			<Icon component={Svg} viewBox='0 0 24 24'>
				<path d={mdiAlertCircle}/>
			</Icon>
		{:else}
			<Icon component={Svg} viewBox='0 0 24 24'>
				<path d={mdiCheckCircle}/>
			</Icon>
		{/if}
	</IconButton>
	<em >{$currentModelName}</em>
	<IconButton style="margin-right: -30px; margin-left: -20px;">
		<Icon component={Svg} viewBox="0 0 24 24">
			<path d={mdiChevronRight}/>
		</Icon>
	</IconButton>
	<em>{$currentUnitName}</em>
	<IconButton style="margin-right: -30px; margin-left: -20px;">
		<Icon component={Svg} viewBox="0 0 24 24">
			<path d={mdiChevronRight}/>
		</Icon>
	</IconButton>
		box: <i>{currentBox?.role} {currentBox?.$id}</i>
			<IconButton size="button" style="margin-right: -30px; margin-left: -20px;">
		<Icon component={Svg} viewBox="0 0 24 24">
			<path d={mdiChevronRight}/>
		</Icon>
	</IconButton>
		kind: <i>{currentBox?.kind} </i>
	<IconButton style="margin-right: -30px; margin-left: -20px;">
		<Icon component={Svg} viewBox="0 0 24 24">
			<path d={mdiChevronRight}/>
		</Icon>
	</IconButton>
		elem: <i>{currentBox?.element?.piId()} - {currentBox?.element?.piLanguageConcept()} </i>
	<IconButton style="margin-right: -30px; margin-left: -20px;">
		<Icon component={Svg} viewBox="0 0 24 24">
			<path d={mdiChevronRight}/>
		</Icon>
	</IconButton>
		(x, y): <i>{(!!currentBox ? Math.round(currentBox.actualX + editorEnvironment.editor.scrollX)
    + ", " + Math.round(currentBox?.actualY + editorEnvironment.editor.scrollY) : "NAN")}
    "{(isTextBox(currentBox) ? currentBox.getText() : "NotTextBox")}"</i>
		</div>
</span>

<style lang="scss">
  .status-bar {
    position: relative;
    height: 36px;
    width: 100%;
    /*height: var(--pi-statusbar-height);*/
    /*color: var(--theme-colors-color);*/
    /*background: var(--theme-colors-inverse_color);*/
    /*font-size: var(--pi-button-font-size);*/
    /*border-bottom: var(--theme-colors-list_divider) solid 1px;*/
    box-sizing: border-box;
    display: flex;
    align-items: center;
    background: #80CBC4; // teal-200
	// todo use color variable
  }
</style>
