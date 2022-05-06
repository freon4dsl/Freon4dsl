<Dialog
        bind:open={$newUnitDialogVisible}
        aria-labelledby="event-title"
        aria-describedby="event-content"
        on:SMUIDialog:closed={closeHandler}
>
    <Title id="event-title">Create new unit</Title>
    <Content id="event-content">
        <div>
            <br> <!-- br is here to make the lable visible when it is moved to the top of the textfield -->
            <Textfield variant="outlined" bind:invalid={nameInvalid} bind:value={newName} label="name of new model">
                <HelperText slot="helper">{helperText}</HelperText>
            </Textfield>
        </div>
    </Content>
    <Actions>
        <Button color="secondary" variant="raised" action={cancelStr}>
            <Label>Cancel</Label>
        </Button>
        <Button variant="raised" action={submitStr} default>
            <Label>Open</Label>
        </Button>
    </Actions>
</Dialog>

<script lang="ts">
    import Button, { Label } from "@smui/button";
    import Dialog, { Title, Content, Actions } from "@smui/dialog";
    import Textfield from '@smui/textfield';
    import HelperText from '@smui/textfield/helper-text';
    import { unitNames } from "../../../stores/ModelStore";
    import { newUnitDialogVisible } from "../../../stores/DialogStore";

    const cancelStr: string = "cancel";
    const submitStr: string = "submit";
    const initialHelperText: string = "Enter a new name.";
    let newName: string = '';
    let nameInvalid: boolean;
    $: nameInvalid = newName.length > 0 ? newNameInvalid() : false;
    let helperText: string = initialHelperText;

    function closeHandler(e: CustomEvent<{ action: string }>) {
        switch (e.detail.action) {
            case submitStr:
                // let comm = EditorCommunication.getInstance();
                if (!newNameInvalid()) {
                    // comm.newModel(newName);
                    console.log("CREATING NEW UNIT: " + newName);
                }
                break;
            case cancelStr:
                break;
            default:
                // This means the user clicked the scrim or pressed Esc to close the dialog.
                // The actions will be "close".
                break;
        }
        resetVariables();
    }

    function newNameInvalid(): boolean {
        // if ($unitNames.includes(newName)) {
        //     helperText = "Unit with this name already exists";
        //     return true;
        // } else
            if (newName.match(/^[0-9]/)) {
            helperText = "Name must start with a character.";
            return true;
        } else if (!newName.match(/^[a-z,A-Z][a-z,A-Z0-9_]*$/)) {
            helperText = "Name may contain only characters and numbers, and must start with a character.";
            return true;
        } else {
            return false;
        }
    }

    function resetVariables() {
        // if ($initializing) {
        //     $initializing = false;
        // }
        // $modelNames = [];
        newName = "";
        helperText = initialHelperText;
    }

</script>
