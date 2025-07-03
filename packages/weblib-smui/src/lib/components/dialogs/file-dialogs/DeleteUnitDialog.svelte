<Dialog
		bind:open={deleteUnitDialogVisible.value}
		aria-labelledby="event-title"
		aria-describedby="event-content"
		onSMUIDialogClosed={closeHandler}
>
	<Title id="event-title">Delete model</Title>
	<Content id="event-content">
		Are you sure you want to delete unit '{toBeDeleted.ref?.name}'?
	</Content>
	<Actions>
		<Button color="secondary" variant="raised" action={cancelStr}>
			<Label>Cancel</Label>
		</Button>
		<Button variant="raised" action={submitStr} defaultAction>
			<Label>Delete</Label>
		</Button>
	</Actions>
</Dialog>


<script lang="ts">
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import Button, { Label } from '@smui/button';
	import { deleteUnitDialogVisible } from "../../stores/DialogStore.svelte";
	import { toBeDeleted } from "../../stores/ModelStore.svelte";
	import { EditorState } from "$lib/language/EditorState";
	import { setUserMessage } from "../../stores/UserMessageStore.svelte";
	import {FreErrorSeverity, isNullOrUndefined} from "@freon4dsl/core";

	const cancelStr: string = "cancel";
	const submitStr: string = "submit";

	function closeHandler(e: CustomEvent<{ action: string }>) {
		switch (e.detail.action) {
			case submitStr:
				if (!isNullOrUndefined(toBeDeleted.ref)) {
					EditorState.getInstance().deleteModelUnit(toBeDeleted.ref);
					setUserMessage("Deleted unit '" + toBeDeleted.ref.name + "'.", FreErrorSeverity.Info);
					toBeDeleted.ref = undefined;
				}
				break;
			case cancelStr:
				toBeDeleted.ref = undefined;
				break;
			default:
				// This means the user clicked the scrim or pressed Esc to close the dialog.
				toBeDeleted.ref = undefined;
				break;
		}
	}

</script>
