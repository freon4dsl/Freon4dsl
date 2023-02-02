<!-- The StatusBar presents info about the unit in the editor: name, whether there are errors, etc. -->

<script lang="ts">
    import { Box, isTextBox } from "@freon4dsl/core";
	import { selectedBoxes } from "@freon4dsl/core-svelte";
    import { editorEnvironment } from "../../config/WebappConfiguration";
    import { currentModelName, currentUnitName } from "../stores/ModelStore";
    import { modelErrors } from "../stores/InfoPanelStore";
    import { mdiCheckCircle, mdiChevronRight, mdiAlertCircle } from "@mdi/js";
    import { Svg } from "@smui/common/elements";
    import { Icon } from "@smui/common";
    import IconButton from "@smui/button";

    let currentBox: Box = null;
	$: currentBox = $selectedBoxes[0];
</script>

<span class="status-bar">
	<div class='mdc-typography--caption'>
	<IconButton style="margin-right: -24px; margin-left: -12px;">
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
	{$currentModelName}
	<IconButton style="margin-right: -30px; margin-left: -20px;">
		<Icon component={Svg} viewBox="0 0 24 24">
			<path d={mdiChevronRight}/>
		</Icon>
	</IconButton>
	{$currentUnitName}
	<IconButton style="margin-right: -30px; margin-left: -20px;">
		<Icon component={Svg} viewBox="0 0 24 24">
			<path d={mdiChevronRight}/>
		</Icon>
	</IconButton>
		box: {currentBox?.role} {currentBox?.$id}
			<IconButton style="margin-right: -30px; margin-left: -20px;">
		<Icon component={Svg} viewBox="0 0 24 24">
			<path d={mdiChevronRight}/>
		</Icon>
	</IconButton>
		kind: {currentBox?.kind}
	<IconButton style="margin-right: -30px; margin-left: -20px;">
		<Icon component={Svg} viewBox="0 0 24 24">
			<path d={mdiChevronRight}/>
		</Icon>
	</IconButton>
		elem: {currentBox?.element?.freId()} - {currentBox?.element?.freLanguageConcept()}
	<IconButton style="margin-right: -30px; margin-left: -20px;">
		<Icon component={Svg} viewBox="0 0 24 24">
			<path d={mdiChevronRight}/>
		</Icon>
	</IconButton>
		(x, y): {(!!currentBox ? Math.round(currentBox.actualX + editorEnvironment.editor.scrollX)
    + ", " + Math.round(currentBox?.actualY + editorEnvironment.editor.scrollY) : "NAN")}
    "{(isTextBox(currentBox) ? currentBox.getText() : "NotTextBox")}"
		</div>
</span>

<style lang="scss">
  .status-bar {
    position: relative;
    height: 24px;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    background: var(--freon-colors-bg-status);
	color: var(--freon-colors-text-status);
	font-style: var(--freon-text-style-status);
	white-space: nowrap;
  }
</style>
