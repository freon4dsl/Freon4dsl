<script lang="ts">
    import {Button, Modal, Label} from 'flowbite-svelte';
    import {dialogs} from '$lib/stores/WebappStores.svelte';
    import {editorInfo} from "$lib";
    import {WebappConfigurator} from "$lib/language";
    import { cancelButtonClass } from '$lib/stores/StylesStore.svelte';
    import { TrashBinSolid } from 'flowbite-svelte-icons';

    function handleCancel() {
        dialogs.deleteModelDialogVisible = false;
    }

    function handleSubmit() {
        WebappConfigurator.getInstance().deleteModel();
        dialogs.deleteModelDialogVisible = false;
    }

</script>

<Modal bind:open={dialogs.deleteModelDialogVisible} autoclose={false} class="w-full bg-primary-100 dark:bg-secondary-800">
    <div class="flex flex-col space-y-6" role="dialog">
        <h3 class="mb-4 text-xl font-medium text-secondary-900 dark:text-primary-50">Delete model</h3>
        <div class="flex flex-col space-y-6 p-4 bg-primary-700 dark-bg-secondary-300" role="dialog">
        <Label class="space-y-2 text-primary-50 dark:text-secondary-50">
            Do you want to delete <span class="font-bold">{editorInfo.modelName}</span>?
        </Label>
        <Label class="italic text-secondary-200 dark:text-primary-200">Note that this action cannot be undone.</Label>
        </div>
    </div>

    <div class="flex flex-row justify-end">
        <Button onclick={handleCancel} class={cancelButtonClass}>
            Cancel
        </Button>
        <Button onclick={handleSubmit} class="text-primary-50 dark:text-primary-50">
            <TrashBinSolid class="w-4 h-4 me-2 text-primary-50 dark:text-primary-50"/>
            Delete
        </Button>
    </div>
</Modal>
