<Dialog
        bind:open={$openModelDialogVisible}
        aria-labelledby="event-title"
        aria-describedby="event-content"
        on:SMUIDialog:closed={closeHandler}
        on:keydown={handleKeydown}
>
    <Title id="event-title">Open Model</Title>
    <Content id="event-content">
        <div>
            <br> <!-- br is here to make the lable visible when it is moved to the top of the textfield -->
            <Textfield variant="outlined" bind:invalid={nameInvalid} bind:value={newName} label="name of model">
                <HelperText slot="helper">{helperText}</HelperText>
            </Textfield>

            <LayoutGrid>
                {#each $modelNames as name}
                    <Cell>
                        <FormField> <!-- FormField ensures that when the label is clicked the checkbox is marked -->
                            <Radio
                                    bind:group={internalSelected}
                                    value={name}
                            />
                            <span slot="label">{name}</span>
                        </FormField>
                    </Cell>
                {/each}
            </LayoutGrid>
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
    import FormField from "@smui/form-field";
    import LayoutGrid, { Cell } from '@smui/layout-grid';
    import Radio from '@smui/radio';
    import Textfield from '@smui/textfield';
    import HelperText from '@smui/textfield/helper-text';
    import { modelNames } from "../../stores/ServerStore";
    import { initializing, openModelDialogVisible } from "../../stores/DialogStore";
    import { setUserMessage } from "../../stores/UserMessageStore";
    import { EditorState } from "../../../language/EditorState";
    import * as Keys from "@freon4dsl/core"

    const cancelStr: string = "cancel";
    const submitStr: string = "submit";
    const initialHelperText: string = "Enter or select a name.";
    let internalSelected: string = ""; // used for radio buttons
    let newName: string = '';
    $: newName = internalSelected.length > 0 ? internalSelected : '';
    let nameInvalid: boolean;
    $: nameInvalid = newName.length > 0 ? newNameInvalid() : false;
    let helperText: string = initialHelperText;

    function doSubmit() {
        let comm = EditorState.getInstance();
        if (internalSelected?.length > 0) { // should be checked first, because newName depends on it
            comm.openModel(internalSelected);
            // console.log("OPENING EXISTING MODEL: " + newName);
            $initializing = false;
        } else if (!newNameInvalid() && newName.length > 0) {
            comm.newModel(newName);
            // console.log("CREATING NEW MODEL: " + newName);
            $initializing = false;
        } else {
            setUserMessage(`Cannot create model ${newName}, because its name is invalid.`);
        }
    }

    function closeHandler(e: CustomEvent<{ action: string }>) {
        // console.log("initalizing: " + $initializing);
        switch (e.detail.action) {
            case submitStr:
                doSubmit();
                break;
            case cancelStr:
                if ($initializing) {
                    setUserMessage("You must select or create a model, before you can start!");
                }
                break;
            default:
                // This means the user clicked the scrim or pressed Esc to close the dialog.
                if ($initializing) {
                    setUserMessage("You must select or create a model, before you can start!");
                }
                break;
        }
        resetVariables();
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

    function newNameInvalid(): boolean {
        if (newName === internalSelected) {
            return false; // one of the existing models is selected, this is ok => not invalid
        } else {
            if (!newName.match(/^[a-z,A-Z][a-z,A-Z0-9_]*$/)) {
                helperText = "Name may contain only characters and numbers, and must start with a character.";
                return true;
            } else {
                return false;
            }
        }
    }

    function resetVariables() {
        $modelNames = [];
        $openModelDialogVisible = false;
        newName = "";
        internalSelected = "";
        helperText = initialHelperText;
    }

</script>
