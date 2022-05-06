<!-- The StatusBar presents info about the unit in the editor: name, whether there are errors, etc. -->

<script lang="ts">
	// import { Box, isTextBox } from "@projectit/core";
	// import { editorEnvironment } from "../WebappConfiguration";
	import { currentModelName, currentUnitName } from "../stores/ModelStore";
	import { modelErrors } from "../stores/ValidationStore";
	import { mdiCheckCircle, mdiChevronRight, mdiAlertCircleCheck, mdiWeb } from '@mdi/js';
	import { Svg } from '@smui/common/elements';
	import { Label, Icon } from '@smui/common';
	import IconButton from '@smui/button';

	// let currentBox: Box = null;
	//
	// autorun( () => {
	// 	currentBox = editorEnvironment.editor.selectedBox;
	// });
</script>

<div class="status-bar">

	{#if $modelErrors.length > 0}
			<IconButton>
				<Icon component={Svg} viewBox='0 0 24 24'>
					<path fill='currentColor' d={mdiAlertCircleCheck} />
				</Icon>
			</IconButton>

	{:else}
		<IconButton>
			<Icon component={Svg} viewBox='0 0 24 24'>
				<path fill='currentColor' d={mdiCheckCircle} />
			</Icon>
		</IconButton>

	{/if}

	<i class='mdc-typography--body2'>{$currentModelName}</i>
	<Icon component={Svg} viewBox="0 0 24 24">
		<path fill="currentColor" d={mdiChevronRight} />
	</Icon>
	<i class='mdc-typography--body2'>{$currentUnitName}</i>
<!--	box: <i>{currentBox?.role} {currentBox?.$id}</i>-->
<!--	kind: <i>{currentBox?.kind} </i>-->
<!--	elem: <i>{currentBox?.element?.piId()} - {currentBox?.element?.piLanguageConcept()} </i>-->
<!--	(x, y): <i>{(!!currentBox ? Math.round(currentBox.actualX + editorEnvironment.editor.scrollX)-->
<!--	+ ", " + Math.round(currentBox?.actualY + editorEnvironment.editor.scrollY): "NAN")}-->
<!--	"{(isTextBox(currentBox) ? currentBox.getText() : "NotTextBox" )}"</i>-->
</div>


<style>
    .status-bar {
        position: relative;
        /*height: var(--pi-statusbar-height);*/
				height: 36px;
        width: 100%;
        /*color: var(--theme-colors-color);*/
        /*background: var(--theme-colors-inverse_color);*/
        /*font-size: var(--pi-button-font-size);*/
        /*border-bottom: var(--theme-colors-list_divider) solid 1px;*/
        box-sizing: border-box;
				display: flex;
				padding-top: 8px;
    }
</style>
