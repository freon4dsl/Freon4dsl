<Dialog
        bind:open={openModelDialogVisible.value}
        aria-labelledby="event-title"
        aria-describedby="event-content"
        onSMUIDialogClosed={closeHandler}
        onkeydown={handleKeydown}
>
    <Title id="event-title">Open Model</Title>
    <Content id="event-content">
        <div>
            <br> <!-- br is here to make the label visible when it is moved to the top of the text field -->
            <Textfield variant="outlined" bind:invalid={nameInvalid} bind:value={newName} label="name of model">
                {#snippet helper()}
                <HelperText>{helperText}</HelperText>
                {/snippet}
            </Textfield>

            <LayoutGrid>
                {#each modelNames.list as name}
                    <Cell>
                        <FormField> <!-- FormField ensures that when the label is clicked the checkbox is marked -->
                            <Radio
                                    bind:group={internalSelected}
                                    value={name}
                            />
                            {#snippet label()}
                            <span>{name}</span>
                            {/snippet}
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
        <Button variant="raised" action={submitStr} defaultAction>
            <Label>Open</Label>
        </Button>
    </Actions>
</Dialog>

<script lang="ts">
    import { isIdentifier } from "@freon4dsl/core";
    import Button, { Label } from "@smui/button";
    import Dialog, { Title, Content, Actions } from "@smui/dialog";
    import FormField from "@smui/form-field";
    import LayoutGrid, { Cell } from '@smui/layout-grid';
    import Radio from '@smui/radio';
    import Textfield from '@smui/textfield';
    import HelperText from '@smui/textfield/helper-text';
    import { modelNames } from "../../stores/ServerStore.svelte";
    import { initializing, openModelDialogVisible } from "../../stores/DialogStore.svelte";
    import { setUserMessage } from "../../stores/UserMessageStore.svelte";
    import { EditorState } from "$lib/language/EditorState";
    import * as Keys from "@freon4dsl/core"

    const cancelStr: string = "cancel";
    const submitStr: string = "submit";
    const initialHelperText: string = "Enter or select a name.";
    let internalSelected: string = $state(""); // used for radio buttons
    let newName: string = $state("");
    $effect(() => {newName = internalSelected.length > 0 ? internalSelected : '';});
    let nameInvalid: boolean = $state(false);
    $effect(() => {nameInvalid = newName.length > 0 ? newNameInvalid() : false;});
    let helperText: string = $state(initialHelperText);

    async function doSubmit() {
        let comm = EditorState.getInstance();
        if (internalSelected?.length > 0) { // should be checked first, because newName depends on it
            await comm.openModel(internalSelected);
            initializing.value = false;
        } else if (!newNameInvalid() && newName.length > 0) {
            await comm.newModel(newName);
            // console.log("CREATING NEW MODEL: " + newName);
            initializing.value = false;
        } else {
            setUserMessage(`Cannot create model ${newName}, because its name is invalid.`);
        }
    }

    async function closeHandler(e: CustomEvent<{ action: string }>) {
        // console.log("initalizing: " + initializing.value);
        switch (e.detail.action) {
            case submitStr:
                await doSubmit();
                break;
            case cancelStr:
                if (initializing.value) {
                    setUserMessage("You must select or create a model, before you can start!");
                }
                break;
            default:
                // This means the user clicked the scrim or pressed Esc to close the dialog.
                if (initializing.value) {
                    setUserMessage("You must select or create a model, before you can start!");
                }
                break;
        }
        resetVariables();
    }

    function isKeyBoardEvent(event: Event): event is KeyboardEvent {
        return 'detail' in event;
    }

    const handleKeydown = (event: Event) => {
        if (isKeyBoardEvent(event)) {
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
    }

    function newNameInvalid(): boolean {
        if (newName === internalSelected) {
            return false; // one of the existing models is selected, this is ok => not invalid
        } else {
            if (!isIdentifier(newName)) {
                helperText = "Name not valid.";
                return true;
            } else {
                return false;
            }
        }
    }

    function resetVariables() {
        modelNames.list = [];
        openModelDialogVisible.value = false;
        newName = "";
        internalSelected = "";
        helperText = initialHelperText;
    }

</script>
