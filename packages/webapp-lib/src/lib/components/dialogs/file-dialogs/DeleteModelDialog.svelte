<Dialog
        bind:open={deleteModelDialogVisible.value}
        aria-labelledby="event-title"
        aria-describedby="event-content"
        onSMUIDialogClosed={closeHandler}
>
    <Title id="event-title">Delete model</Title>
    <Content id="event-content">
        Select the model you want to delete. <br>
        <i>Note that this action cannot be undone!</i>
        <LayoutGrid>
            {#each modelNames.list as name}
                {#if (name !== currentModelName.value)}
                    <Cell>
                        <FormField> <!-- FormField ensures that when the label is clicked the checkbox is marked -->
                            <Radio
                                    bind:group={modelToBeDeleted}
                                    value={name}
                            />
                            {#snippet label()}
                            <span>{name}</span>
                            {/snippet}
                        </FormField>
                    </Cell>
                {/if}
            {/each}
        </LayoutGrid>
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
    import Button, { Label } from "@smui/button";
    import Dialog, { Title, Content, Actions } from "@smui/dialog";
    import FormField from "@smui/form-field";
    import LayoutGrid, { Cell } from "@smui/layout-grid";
    import Radio from "@smui/radio";
    import { currentModelName } from "../../stores/ModelStore.svelte";
    import { deleteModelDialogVisible } from "../../stores/DialogStore.svelte";

    import { modelNames } from "../../stores/ServerStore.svelte";
    import {WebappConfigurator} from "$lib";

    const cancelStr: string = "cancel";
    const submitStr: string = "submit";
    let modelToBeDeleted: string;

    function closeHandler(e: CustomEvent<{ action: string }>) {
        switch (e.detail.action) {
            case submitStr:
                WebappConfigurator.getInstance().serverCommunication!.deleteModel(modelToBeDeleted);
                break;
            default:
                // This means the user clicked the scrim or pressed Esc to close the dialog.
                break;
            case cancelStr:
                break;
        }
        modelToBeDeleted = "";
    }

</script>
