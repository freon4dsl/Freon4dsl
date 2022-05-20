<Dialog
		bind:open={$deleteModelDialogVisible}
		aria-labelledby="event-title"
		aria-describedby="event-content"
		on:SMUIDialog:closed={closeHandler}
>
	<Title id="event-title">Delete model</Title>
	<Content id="event-content">
		Sure you want to delete model {$currentModelName}?
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
	import { currentModelName } from "../../stores/ModelStore";
	import { deleteModelDialogVisible } from "../../stores/DialogStore";

	const cancelStr: string = "cancel";
	const submitStr: string = "submit";
	let response: string = '';

	function closeHandler(e: CustomEvent<{ action: string }>) {
		switch (e.detail.action) {
			case submitStr:
				response = 'In the trash with it.';
				break;
			case cancelStr:
				response = "Ok, well, we'll keep it then.";
				break;
			default:
				// This means the user clicked the scrim or pressed Esc to close the dialog.
				// The actions will be "close".
				response = "Ok, well, we'll keep it then.";
				break;
		}
		console.log(response);
	}

	const handleCancel = () => {
		// console.log("Cancel called ");
		// modelToBeDeleted = "";
		// $deleteModelDialogVisible = false;
	}

	const handleSubmit = () => {
		// console.log("DeleteModel.Submit called, model to be deleted: " + modelToBeDeleted);
		// serverCommunication.deleteModel(modelToBeDeleted);
		// modelToBeDeleted = "";
		// $deleteModelDialogVisible = false;
	}

</script>
