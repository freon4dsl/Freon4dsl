<!-- The StatusBar presents info about the unit in the editor: name, whether there are errors, etc. -->

<script lang="ts">
    import { Box, isTextBox } from "@freon4dsl/core";
	import { selectedBoxes } from "@freon4dsl/core-svelte";
    import { currentModelName, currentUnitName } from "../stores/ModelStore.js";
    import { modelErrors } from "../stores/InfoPanelStore.js";
    import { mdiCheckCircle, mdiChevronRight, mdiAlertCircle } from "@mdi/js";
    import { Icon } from "@smui/common";
    import IconButton from "@smui/button";
	import {WebappConfigurator} from "../../WebappConfigurator.js";

    let currentBox: Box = null;
	$: currentBox = $selectedBoxes[0];
</script>

<span class="status-bar">
	<div class='mdc-typography--caption'>
	<IconButton style="margin-right: -24px; margin-left: -12px;">
		{#if $modelErrors.length > 0}
			<Icon tag=svg viewBox='0 0 24 24'>
				<path d={mdiAlertCircle}/>
			</Icon>
		{:else}
			<Icon tag=svg viewBox='0 0 24 24'>
				<path d={mdiCheckCircle}/>
			</Icon>
		{/if}
	</IconButton>
	{$currentModelName}
	<IconButton style="margin-right: -30px; margin-left: -20px;">
		<Icon tag=svg viewBox="0 0 24 24">
			<path d={mdiChevronRight}/>
		</Icon>
	</IconButton>
	{$currentUnitName?.name ?? "<no unit>"}
	<IconButton style="margin-right: -30px; margin-left: -20px;">
		<Icon tag=svg viewBox="0 0 24 24">
			<path d={mdiChevronRight}/>
		</Icon>
	</IconButton>
		box: {currentBox?.role} {currentBox?.$id}
			<IconButton style="margin-right: -30px; margin-left: -20px;">
		<Icon tag=svg viewBox="0 0 24 24">
			<path d={mdiChevronRight}/>
		</Icon>
	</IconButton>
		kind: {currentBox?.kind}
	<IconButton style="margin-right: -30px; margin-left: -20px;">
		<Icon tag=svg viewBox="0 0 24 24">
			<path d={mdiChevronRight}/>
		</Icon>
	</IconButton>
		elem: {currentBox?.node?.freId()} - {currentBox?.node?.freLanguageConcept()}
	<IconButton style="margin-right: -30px; margin-left: -20px;">
		<Icon tag=svg viewBox="0 0 24 24">
			<path d={mdiChevronRight}/>
		</Icon>
	</IconButton>
		(x, y): {(!!currentBox ? Math.round(currentBox.actualX + WebappConfigurator.getInstance().editorEnvironment.editor.scrollX)
    + ", " + Math.round(currentBox?.actualY + WebappConfigurator.getInstance().editorEnvironment.editor.scrollY) : "NAN")}
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
