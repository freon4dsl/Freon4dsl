<!-- --bg-panel and --divider are parameters set by the svelte-mui library -->
<Dialog style={dialogStyle}
		bind:visible={$findNamedDialogVisible}
		on:keydown={handleKeydown}>
	<div slot="title" class="title">Search for an element</div>

	<div class="wrapper">
		<div class="choice">
			{#each $conceptNames as name}
				<Radio {...props} bind:group={metatypeSelected} value={name}>
					<span class="item-name">{name}</span>
				</Radio>
			{/each}
		</div>
		<div class="editPane">
			<Textfield
					name="modelname"
					autocomplete="on"
					bind:value={nameToFind}
					bind:error="{localErrorMessage}"
					outlined="true"
					style={textFieldStyle}
					placeholder="text to search for"
			/>
		</div>
	</div>

	<div slot="actions" class="actions">
		<Button style="color:var(--theme-colors-secondary_button_text)" on:click={() => handleCancel()}>Cancel</Button>
		<Button style="color:var(--theme-colors-primary_button_text)" on:click={() => handleSubmit()}>Submit</Button>
	</div>


	<div slot="footer" class="footer">
		Choose the type of element and/or enter the name to find.
	</div>
</Dialog>

<script lang="ts">
	import {Button, Dialog, Radio, Textfield} from 'svelte-mui';
	import { findNamedDialogVisible	} from "../../webapp-ts-utils/WebappStore";
	import { EditorCommunication } from "../../editor/EditorCommunication";
	import { conceptNames } from "../../webapp-ts-utils/InfoPanelStore";
	import { dialogStyle, textFieldStyle } from "../StyleConstants";

	let nameToFind: string = "";
	let localErrorMessage: string = "";
	let metatypeSelected: string = "";

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
		// TODO
		EditorCommunication.getInstance().findNamedElement(nameToFind, metatypeSelected);
		resetVariables();
	}

	const handleKeydown = (event) => {
		if ($findNamedDialogVisible) {
			switch (event.keyCode) {
				case 13: { // on Enter key try to submit
					handleSubmit();
					break;
				}
			}
		}
	}

	function resetVariables() {
		$findNamedDialogVisible = false;
		localErrorMessage = "";
		// nameToFind = "";
	}

</script>

<svelte:window on:keydown={handleKeydown}/>

<style>
	.wrapper {
		display: flex;
		border: 1px solid black;
	}
	.choice {
		border: 1px solid red;
		padding: 1px;
	}
    .editPane {
		border: 1px solid green;
		padding: 1px;
		width: 100%;
	}
	/* TODO adjust layout of actions */
	.actions {
		float: right;
	}
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
