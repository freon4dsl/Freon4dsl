<script lang="ts">
    import {Button, Modal, Label} from 'flowbite-svelte';
    import {dialogs} from '$lib/stores/WebappStores.svelte';
    import {editorInfo} from "$lib";
    import {WebappConfigurator} from "$lib/language";

    function handleCancel() {
        dialogs.deleteModelDialogVisible = false;
    }

    function handleSubmit() {
        WebappConfigurator.getInstance().deleteModel();
        dialogs.deleteModelDialogVisible = false;
    }

</script>

<Modal bind:open={dialogs.deleteModelDialogVisible} autoclose={false} class="w-full">
    <div class="flex flex-col space-y-6" role="dialog">
        <h3 class="mb-4 text-xl font-medium text-secondary-900 dark:text-primary-50">Delete model</h3>
        <Label class="space-y-2">
            Do you want to delete <span class="font-bold">{editorInfo.modelName}</span>?
        </Label>
        <Label class="italic">Note that this action cannot be undone.</Label>
    </div>

    <svelte:fragment slot="footer">
        <Button onclick={handleSubmit}>Delete</Button>
        <Button color="alternative" onclick={handleCancel}>Cancel</Button>
    </svelte:fragment>
</Modal>
