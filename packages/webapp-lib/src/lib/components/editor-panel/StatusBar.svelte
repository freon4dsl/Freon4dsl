<!-- The StatusBar presents info about the unit in the editor: name, whether there are errors, etc. -->

<script lang="ts">
    import { Box, isTextBox } from "@freon4dsl/core";
    import { currentModelName, currentUnit } from "../stores/ModelStore.svelte";
    import { modelErrors } from "../stores/InfoPanelStore.svelte";
    import { mdiCheckCircle, mdiChevronRight, mdiAlertCircle } from "@mdi/js";
    import { Icon } from "@smui/common";
    import IconButton from "@smui/button";
	import {WebappConfigurator} from "$lib";
	import {selectedBoxes} from "@freon4dsl/core-svelte";

    let currentBox: Box | null = $state(null);
	$effect(() => {
		currentBox = selectedBoxes.value[0];
	});
	let langEnv = WebappConfigurator.getInstance().editorEnvironment!;
</script>

<span class="status-bar">
	<span class='mdc-typography--caption'>
	<IconButton style="margin-right: -24px; margin-left: -12px;">
		{#if modelErrors.list.length > 0}
			<Icon tag=svg viewBox='0 0 24 24'>
				<path d={mdiAlertCircle}/>
			</Icon>
		{:else}
			<Icon tag=svg viewBox='0 0 24 24'>
				<path d={mdiCheckCircle}/>
			</Icon>
		{/if}
	</IconButton>
	{currentModelName.value}
	<IconButton style="margin-right: -30px; margin-left: -20px;">
		<Icon tag=svg viewBox="0 0 24 24">
			<path d={mdiChevronRight}/>
		</Icon>
	</IconButton>
	{currentUnit.id?.name ?? "<no unit>"}
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
		(x, y): {(!!currentBox ? Math.round(currentBox.actualX + langEnv.editor.scrollX)
    + ", " + Math.round(currentBox?.actualY + langEnv.editor.scrollY) : "NAN")}
    "{(!!currentBox && isTextBox(currentBox) ? currentBox.getText() : "NotTextBox")}"
		</span>
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
