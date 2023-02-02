<Dialog
		bind:open={$findStructureDialogVisible}
		aria-labelledby="event-title"
		aria-describedby="event-content"
		on:SMUIDialog:closed={closeHandler}
>
	<Title id="event-title">Search for a structure</Title>
	<Content id="event-content">
		<div>
			{#each FreLanguage.getInstance().getNamedElements() as name}
				<FormField>
					<Radio
							bind:group={metatypeSelected}
							value={name}
					/>
					<span slot="label">{name}</span>
				</FormField>
			{/each}
		</div>
		<Card style="min-width:300px; min-height:100px;" variant="outlined" padded>
			{#if metatypeSelected.length === 0}
				<div class="mdc-typography--subtitle2">{initialMessage}</div>
			{:else}
				<div class="mdc-typography--subtitle2">TEXT WHICH SHOULD BE REPLACED BY AN EDITOR WINDOW ON A <em>{metatypeSelected}</em>.</div>
			{/if}
		</Card>
	</Content>
	<Actions>
		<Button color="secondary" variant="raised" action={cancelStr}>
			<Label>Cancel</Label>
		</Button>
		<Button variant="raised" action={submitStr} default>
			<Label>Search</Label>
		</Button>
	</Actions>
</Dialog>

<script lang="ts">
	import { FreLanguage } from "@freon4dsl/core";
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import Radio from '@smui/radio';
	import Card from '@smui/card';
	import FormField from '@smui/form-field';
	import Button, { Label } from '@smui/button';
	import { findStructureDialogVisible } from "../../stores/DialogStore";

	const initialMessage: string = "Please select an element type.";
	let metatypeSelected: string = "";
	const cancelStr: string = "cancel";
	const submitStr: string = "submit";

	function closeHandler(e: CustomEvent<{ action: string }>) {
		switch (e.detail.action) {
			case submitStr:
				// todo add real functionality
				// EditorRequestsHandler.getInstance().findStructure(elemToMatch);
				break;
			case cancelStr:
				break;
			default:
				// This means the user clicked the scrim or pressed Esc to close the dialog.
				break;
		}
	}

</script>
