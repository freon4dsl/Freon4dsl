<Dialog
        bind:open={renameUnitDialogVisible.value}
        aria-labelledby="event-title"
        aria-describedby="event-content"
        onSMUIDialogClosed={closeHandler}
        onkeydown={handleKeydown}
>
    <Title id="event-title">Rename unit</Title>
    <Content id="event-content">
        <div>
            <br> <!-- br is here to make the label visible when it is moved to the top of the text field -->
            <Textfield variant="outlined" bind:invalid={nameInvalid} bind:value={newName} label="new name of the unit">
                {#snippet helper()}
                <HelperText>{helperText}</HelperText>
                {/snippet}
            </Textfield>
        </div>
    </Content>
    <Actions>
        <Button color="secondary" variant="raised" action={cancelStr}>
            <Label>Cancel</Label>
        </Button>
        <Button variant="raised" action={submitStr} defaultAction>
            <Label>Rename</Label>
        </Button>
    </Actions>
</Dialog>

<script lang="ts">
    import Button, { Label } from "@smui/button";
    import Dialog, { Title, Content, Actions } from "@smui/dialog";
    import Textfield from "@smui/textfield";
    import HelperText from "@smui/textfield/helper-text";
    import { toBeRenamed, unitNames } from "../../stores/ModelStore.svelte";
    import { renameUnitDialogVisible } from "../../stores/DialogStore.svelte";
    import { EditorState } from "$lib/language/EditorState";
    import * as Keys from "@freon4dsl/core";
    import { isNullOrUndefined, type FreUnitIdentifier, isIdentifier } from "@freon4dsl/core";

    const cancelStr: string = "cancel";
    const submitStr: string = "submit";
    const initialHelperText: string = "Enter a new name.";

    let newName: string = $state('');
    let nameInvalid: boolean = $state(false);
    $effect(() => {nameInvalid = newName.length > 0 ? newNameInvalid() : false});
    let helperText: string = $state(initialHelperText);

    function doSubmit() {
        if (!newNameInvalid() && !isNullOrUndefined(toBeRenamed.ref)) {
            EditorState.getInstance().renameModelUnit(toBeRenamed.ref, toBeRenamed.ref.name, newName);
        }
    }

    function closeHandler(e: CustomEvent<{ action: string }>) {
        switch (e.detail.action) {
            case submitStr:
                doSubmit();
                break;
            case cancelStr:
                break;
            default:
                // This means the user clicked the scrim or pressed Esc to close the dialog.
                break;
        }
        resetVariables();
    }

    function newNameInvalid(): boolean {
        if (unitNames.ids.map((u: FreUnitIdentifier) => u.name).includes(newName)) {
            helperText = "Unit with this name already exists.";
            return true;
        } else if (!isIdentifier(newName)) {
            helperText = "Name syntax invalid.";
            return true;
        } else {
            helperText = initialHelperText;
            return false;
        }
    }

    function resetVariables() {
        newName = "";
        helperText = initialHelperText;
        renameUnitDialogVisible.value = false;
    }

    const handleKeydown = (event: KeyboardEvent) => {
        switch (event.key) {
            case Keys.ENTER: { // on Enter key try to submit
                event.stopPropagation();
                event.preventDefault();
                if (!newNameInvalid()) {
                    doSubmit();
                    resetVariables();
                }
                break;
            }
        }
    }

</script>
