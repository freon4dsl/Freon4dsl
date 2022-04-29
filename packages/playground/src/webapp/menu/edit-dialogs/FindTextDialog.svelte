<!-- --bg-panel and --divider are parameters set by the svelte-mui library -->
<Dialog style={dialogStyle}
		bind:visible={$findTextDialogVisible}
		on:keydown={handleKeydown}>
	<div slot="title" class="title">Search for text</div>

	<Textfield
			name="modelname"
			autocomplete="on"
			bind:value={stringToFind}
			bind:error="{localErrorMessage}"
			outlined="true"
			style={textFieldStyle}
			placeholder="text to search for"
	/>

	<div slot="actions" class="actions">
		<Button style="color:var(--theme-colors-secondary_button_text)" on:click={() => handleCancel()}>Cancel</Button>
		<Button style="color:var(--theme-colors-primary_button_text)" on:click={() => handleSubmit()}>Submit</Button>
	</div>

	<div slot="footer" class="footer">
		Searching for a text string is based on the default or parser projection.
	</div>
</Dialog>

<script lang="ts">
	import {Button, Dialog, Textfield} from 'svelte-mui';
	import {
		findTextDialogVisible
	} from "../../webapp-ts-utils/WebappStore";
	import { EditorCommunication } from "../../editor/EditorCommunication";
	import { textFieldStyle, dialogStyle } from "../StyleConstants";
	// TODO on opening set focus on textfield

	let stringToFind: string = "";
	let localErrorMessage: string = "";

	let props = {
		right: false,
		ripple: true,
		disabled: false,
		color: "var(--theme-colors-color)"
	};

	const handleCancel = () => {
		resetVariables();
	}

	const handleSubmit = () => {
		if (!!stringToFind && stringToFind.length > 0) {
			console.log("Searching for text: " + stringToFind);
			EditorCommunication.getInstance().findText(stringToFind);
			resetVariables();
		}
	}

	const handleKeydown = (event) => {
		if ($findTextDialogVisible) {
			switch (event.keyCode) {
				case 13: { // on Enter key try to submit
					handleSubmit();
					break;
				}
			}
		}
	}

	function resetVariables() {
		$findTextDialogVisible = false;
		stringToFind = "";
		localErrorMessage = "";
	}

</script>

<svelte:window on:keydown={handleKeydown}/>

<style>
	.footer {
		text-align: center;
		margin-bottom: 1rem;
		font-size: 13px;
		color: var(--theme-colors-color);
	}
	.title {
		color: var(--theme-colors-inverse_color);
	}
</style>
