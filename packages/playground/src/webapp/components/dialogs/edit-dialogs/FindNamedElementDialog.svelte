<Dialog
        bind:open={$findNamedDialogVisible}
        aria-labelledby="event-title"
        aria-describedby="event-content"
        on:SMUIDialog:closed={closeHandler}
>
    <Title id="event-title">Search for a named element</Title>
    <Content id="event-content">
        <div>
            <Textfield variant="outlined" bind:value={stringToFind} bind:invalid={nameInvalid} >
                <HelperText slot="helper">{helperText}</HelperText>
            </Textfield>
        </div>
        <div>
            {#each FreLanguage.getInstance().getNamedElements() as name}
                <FormField>
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
            <Label>Search</Label>
        </Button>
    </Actions>
</Dialog>

<script lang="ts">
    import { FreLanguage } from "@freon4dsl/core";
    import Dialog, { Title, Content, Actions } from "@smui/dialog";
    import Textfield from "@smui/textfield";
    import HelperText from "@smui/textfield/helper-text";
    import Button, { Label } from "@smui/button";
    import Radio from "@smui/radio";
    import FormField from "@smui/form-field";
    import { findNamedDialogVisible } from "../../stores/DialogStore";
    import { EditorRequestsHandler } from "../../../language/EditorRequestsHandler";

    const cancelStr: string = "cancel";
    const submitStr: string = "submit";
    const initialHelperText: string = "Enter the name of the element to search for";

    let stringToFind: string = "";
    let typeSelected: string = "";
    let nameInvalid: boolean;
    $: nameInvalid = stringToFind.length > 0 ? !!typeSelected ? inputInvalid() : inputInvalid() : false;

    let helperText: string = initialHelperText;

    function closeHandler(e: CustomEvent<{ action: string }>) {
        switch (e.detail.action) {
            case submitStr:
                if (!inputInvalid()) {
                    EditorRequestsHandler.getInstance().findNamedElement(stringToFind, typeSelected);
                }
                break;
            case cancelStr:
                break;
            default:
                // This means the user clicked the scrim or pressed Esc to close the dialog.
                break;
        }
        stringToFind = "";
    }

    function inputInvalid(): boolean {
        if (!(!!typeSelected && typeSelected.length > 0)) {
            helperText = "Please, select the type of the unit below.";
            return true;
        } else {
            helperText = initialHelperText;
            return false;
        }
    }
</script>
