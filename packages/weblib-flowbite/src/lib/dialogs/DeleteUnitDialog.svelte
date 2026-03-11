<script lang="ts">
    import Dialog from "$lib/dialogs/Dialog.svelte";
    import { Button, Label } from "flowbite-svelte";
    import { dialogs } from "$lib/stores/WebappStores.svelte";
    import { editorInfo } from "$lib";
    import { WebappConfigurator } from "$lib/language";
    import { TrashBinSolid } from "flowbite-svelte-icons";
    import { ExclamationCircleSolid } from "flowbite-svelte-icons";

    function handleCancel() {
        dialogs.deleteUnitDialogVisible = false;
    }

    function handleSubmit() {
        WebappConfigurator
            .getInstance()
            .deleteModelUnit(editorInfo.toBeDeleted);

        dialogs.deleteUnitDialogVisible = false;
    }
</script>

<Dialog open={dialogs.deleteUnitDialogVisible}>
    <div class="flex flex-col space-y-6" role="dialog">

        <h3 class="freon-dialog-title">
            Delete unit
        </h3>

        <div class="freon-dialog-section flex flex-col space-y-4 p-4">

            <Label class="freon-dialog-text">
                Do you want to delete
                <span class="font-semibold">
                    {editorInfo.toBeDeleted?.name}
                </span>?
            </Label>

            <div class="freon-dialog-warning">
                <ExclamationCircleSolid class="w-4 h-4 inline mr-2"/>
                Note that this action cannot be undone.
            </div>

        </div>
    </div>

    <div class="mt-6 flex justify-end gap-3">

        <Button
            onclick={handleCancel}
            class="freon-dialog-btn freon-dialog-btn-cancel"
        >
            Cancel
        </Button>

        <Button
            onclick={handleSubmit}
            class="freon-dialog-btn freon-dialog-btn-ok"
        >
            <TrashBinSolid class="w-4 h-4 me-2"/>
            Delete
        </Button>

    </div>
</Dialog>
