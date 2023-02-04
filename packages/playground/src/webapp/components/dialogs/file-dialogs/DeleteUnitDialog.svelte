<Dialog
		bind:open={$deleteUnitDialogVisible}
		aria-labelledby="event-title"
		aria-describedby="event-content"
		on:SMUIDialog:closed={closeHandler}
>
	<Title id="event-title">Delete model</Title>
	<Content id="event-content">
		Are you sure you want to delete unit '{$toBeDeleted?.name}'?
	</Content>
	<Actions>
		<Button color="secondary" variant="raised" action={cancelStr}>
			<Label>Cancel</Label>
		</Button>
		<Button variant="raised" action={submitStr} default>
			<Label>Delete</Label>
		</Button>
	</Actions>
</Dialog>


<script lang="ts">
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import Button, { Label } from '@smui/button';
	import { deleteUnitDialogVisible } from "../../stores/DialogStore";
	import { toBeDeleted } from "../../stores/ModelStore";
	import { EditorState } from "../../../language/EditorState";
	import { setUserMessage } from "../../stores/UserMessageStore";
	import { FreErrorSeverity } from "@freon4dsl/core";

	const cancelStr: string = "cancel";
	const submitStr: string = "submit";

	function closeHandler(e: CustomEvent<{ action: string }>) {
		switch (e.detail.action) {
			case submitStr:
				EditorState.getInstance().deleteModelUnit($toBeDeleted);
				setUserMessage("Deleted unit '" + $toBeDeleted.name + "'.", FreErrorSeverity.Info);
				$toBeDeleted = null;
				break;
			case cancelStr:
				$toBeDeleted = null;
				break;
			default:
				// This means the user clicked the scrim or pressed Esc to close the dialog.
				$toBeDeleted = null;
				break;
		}
	}

</script>
