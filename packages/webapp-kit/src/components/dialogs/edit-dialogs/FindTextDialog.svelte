<Dialog
		bind:open={$findTextDialogVisible}
		aria-labelledby="event-title"
		aria-describedby="event-content"
		on:SMUIDialog:closed={closeHandler}
>
	<Title id="event-title">Search for a text string</Title>
	<Content id="event-content">
		<div>
		<Textfield variant="outlined" bind:value={stringToFind}>
			<HelperText slot="helper">Enter the string to search for</HelperText>
		</Textfield>
		</div>
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
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import Button, { Label } from '@smui/button';
	import { findTextDialogVisible } from "../../stores/DialogStore";
	import { EditorRequestsHandler } from "../../../language/EditorRequestsHandler";

	let stringToFind: string = "";
	const cancelStr: string = "cancel";
	const submitStr: string = "submit";

	function closeHandler(e: CustomEvent<{ action: string }>) {
		switch (e.detail.action) {
			case submitStr:
				if (!!stringToFind && stringToFind.length > 0) {
					EditorRequestsHandler.getInstance().findText(stringToFind);
				}
				break;
			case cancelStr:
				break;
			default:
				// This means the user clicked the scrim or pressed Esc to close the dialog.
				break;
		}
		stringToFind = '';
	}

</script>
