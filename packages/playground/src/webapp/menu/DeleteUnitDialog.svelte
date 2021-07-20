<Dialog width="350" bind:visible>
	<div slot="title">Deleting unit:</div>

	<div>
		"{get(currentUnitName)}" of model "{get(currentModelName)}"
	</div>

	<div slot="actions" class="actions center">
		<Button color="secondary" on:click={() => handleCancel()}>Cancel</Button>
		<Button color="primary" on:click={() => handleSubmit()}>Submit</Button>
	</div>

	<div slot="footer" class="footer">
		Do you really want to delete this unit from the server?
	</div>
</Dialog>

<script lang="ts">
	import {Button, Radio, Dialog} from 'svelte-mui';
	import {currentModelName} from "../menu-ts-files/WebappStore";
	import {get} from 'svelte/store';
	import {EditorCommunication} from "../editor/EditorCommunication";
	import { currentUnitName } from "../menu-ts-files/WebappStore";

	export let visible: boolean = false;

	let props = {
		right: false,
		ripple: true,
		disabled: false,
	};
	const handleCancel = () => {
		console.log("Cancel called ");
		visible = false;
	}

	const handleSubmit = () => {
		console.log("Submit called, unit to be deleted: " + get(currentUnitName) + "." + get(currentModelName));
		EditorCommunication.getInstance().deleteCurrentUnit();
		visible = false;
	}
</script>

<style>
	.footer {
		text-align: center;
		margin-bottom: 1rem;
		font-size: 13px;
	}
	/*.footer a {*/
	/*	color: #f50057;*/
	/*	padding-left: 1rem;*/
	/*}*/
</style>
