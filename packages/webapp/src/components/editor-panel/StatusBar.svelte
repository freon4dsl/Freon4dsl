<!-- The StatusBar presents info about the unit in the editor: name, whether there are errors, etc. -->

<script lang="ts">
	// import { Box, isTextBox } from "@projectit/core";
	// import { editorEnvironment } from "../WebappConfiguration";
	import { currentModelName, currentUnitName } from "../../stores/ModelStore";
	import { modelErrors } from "../../stores/InfoPanelStore";
	import { mdiCheckCircle, mdiChevronRight, mdiAlertCircle } from '@mdi/js';
	import { Svg } from '@smui/common/elements';
	import { Icon } from '@smui/common';
	import IconButton from '@smui/button';

	// let currentBox: Box = null;
	//
	// autorun( () => {
	// 	currentBox = editorEnvironment.editor.selectedBox;
	// });
</script>

<span class="status-bar">
	<IconButton class="less-padding">
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
	<i class='mdc-typography--body2'>{$currentModelName}</i>
	<IconButton>
	<Icon component={Svg} viewBox="0 0 24 24">
		<path d={mdiChevronRight}/>
	</Icon>
		</IconButton>
	<i class='mdc-typography--body2'>{$currentUnitName}</i>
	<!--	box: <i>{currentBox?.role} {currentBox?.$id}</i>-->
	<!--	kind: <i>{currentBox?.kind} </i>-->
	<!--	elem: <i>{currentBox?.element?.piId()} - {currentBox?.element?.piLanguageConcept()} </i>-->
	<!--	(x, y): <i>{(!!currentBox ? Math.round(currentBox.actualX + editorEnvironment.editor.scrollX)-->
	<!--	+ ", " + Math.round(currentBox?.actualY + editorEnvironment.editor.scrollY): "NAN")}-->
	<!--	"{(isTextBox(currentBox) ? currentBox.getText() : "NotTextBox" )}"</i>-->
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
		background: teal;
	}
</style>
