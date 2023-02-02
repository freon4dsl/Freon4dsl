<Dialog
        bind:open={$newUnitDialogVisible}
        aria-labelledby="event-title"
        aria-describedby="event-content"
        on:SMUIDialog:closed={closeHandler}
        on:keydown={handleKeydown}
>
    <Title id="event-title">Create new unit</Title>
    <Content id="event-content">
        <div>
            <br> <!-- br is here to make the label visible when it is moved to the top of the textfield -->
            <Textfield variant="outlined" bind:invalid={nameInvalid} bind:value={newName} label="name of new unit">
                <HelperText slot="helper">{helperText}</HelperText>
            </Textfield>
            {#each $unitTypes as name}
                <FormField >
                    <Radio
                            bind:group={typeSelected}
                            value={name}
                    />
                    <span slot="label">{name}</span>
                </FormField>
            {/each}

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
    import Textfield from "@smui/textfield";
    import HelperText from "@smui/textfield/helper-text";
    import { unitNames } from "../../stores/ModelStore";
    import { newUnitDialogVisible } from "../../stores/DialogStore";

    import { unitTypes } from "../../stores/LanguageStore";
    import Radio from "@smui/radio";
    import FormField from "@smui/form-field";
    import { EditorState } from "../../../language/EditorState";
    import * as Keys from "@freon4dsl/core";

    const cancelStr: string = "cancel";
    const submitStr: string = "submit";
    const initialHelperText: string = "Enter a new name.";

    let typeSelected: string = $unitTypes[0]; // initialize to the first type found
    let newName: string = "";
    let nameInvalid: boolean;
    $: nameInvalid = newName.length > 0 ? !!typeSelected ? newNameInvalid() : newNameInvalid() : false;
    let helperText: string = initialHelperText;

    function doSubmit() {
        if (!newNameInvalid()) {
            EditorState.getInstance().newUnit(newName, typeSelected);
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
                // The actions will be "close".
                break;
        }
        resetVariables();
    }

    function newNameInvalid(): boolean {
        if ($unitNames.includes(newName)) {
            helperText = "Unit with this name already exists.";
            return true;
        } else if (newName.match(/^[0-9]/)) {
            helperText = "Name must start with a character.";
            return true;
        } else if (!newName.match(/^[a-z,A-Z][a-z,A-Z0-9_]*$/)) {
            helperText = "Name may contain only characters and numbers, and must start with a character.";
            return true;
        } else if (!(!!typeSelected && typeSelected.length > 0)) {
            helperText = "Please, select the type of the unit below.";
            return true;
        } else {
            helperText = initialHelperText;
            return false;
        }
    }

    function resetVariables() {
        newName = "";
        helperText = initialHelperText;
        $newUnitDialogVisible = false;
    }

    const handleKeydown = (event) => {
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
