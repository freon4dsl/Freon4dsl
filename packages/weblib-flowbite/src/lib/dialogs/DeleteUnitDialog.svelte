<script lang="ts">
    import {Button, Modal, Label} from 'flowbite-svelte';
    import {dialogs} from '$lib/stores/WebappStores.svelte';
    import {editorInfo} from "$lib";
    import {WebappConfigurator} from "$lib/language";
    import { cancelButtonClass, okButtonClass } from '$lib/stores/StylesStore.svelte';
    import { TrashBinSolid } from 'flowbite-svelte-icons';

    function handleCancel() {
        dialogs.deleteUnitDialogVisible = false;
    }

    function handleSubmit() {
        WebappConfigurator.getInstance().deleteModelUnit(editorInfo.toBeDeleted);
        dialogs.deleteUnitDialogVisible = false;
    }

</script>

<Modal bind:open={dialogs.deleteUnitDialogVisible} autoclose={false} class="w-full bg-light-base-100 dark:bg-dark-base-800">
    <div class="flex flex-col space-y-6" role="dialog">
        <h3 class="mb-4 text-xl font-medium text-light-base-900 dark:text-dark-base-50">Delete unit</h3>
        <div class="flex flex-col space-y-6 p-4 bg-light-base-700 dark-bg-light-base-300" role="dialog">
        <Label class="space-y-2 text-light-base-50 dark:text-dark-base-50">
            Do you want to delete <span class="font-bold">{editorInfo.toBeDeleted?.name}</span>?
        </Label>
        <Label class="italic text-light-base-200 dark:text-dark-base-200">Note that this action cannot be undone.</Label>
        </div>
    </div>

    <div class="flex flex-row justify-end">
        <Button onclick={handleCancel} class={cancelButtonClass}>
            Cancel
        </Button>
        <Button class={okButtonClass}
                onclick={handleSubmit}>
            <TrashBinSolid class="w-4 h-4 me-2"/>
            Delete
        </Button>
    </div>
</Modal>
