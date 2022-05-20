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
	import { currentModelName, currentUnitName } from "../../stores/ModelStore";
	import { deleteUnitDialogVisible } from "../../stores/DialogStore";
	import { toBeDeleted } from "../../stores/ModelStore";
	import { serverCommunication } from "../../../config/WebappConfiguration";
	import { EditorCommunication } from "../../../language/EditorCommunication";
	import { setUserMessage, SeverityType } from "../../stores/UserMessageStore";

	const cancelStr: string = "cancel";
	const submitStr: string = "submit";
	let response: string = '';

	function closeHandler(e: CustomEvent<{ action: string }>) {
		switch (e.detail.action) {
			case submitStr:
				response = 'In the trash with it.';
				EditorCommunication.getInstance().deleteModelUnit($toBeDeleted);
				setUserMessage("Deleted unit '" + $toBeDeleted.name + "'.", SeverityType.info);
				$toBeDeleted = null;
				break;
			case cancelStr:
				response = "Ok, well, we'll keep it then.";
				$toBeDeleted = null;
				break;
			default:
				// This means the user clicked the scrim or pressed Esc to close the dialog.
				// The actions will be "close".
				response = "Ok, well, we'll keep it then.";
				$toBeDeleted = null;
				break;
		}
		console.log(response);
	}

</script>
