<script lang="ts">
    import {Button, Modal, Label, Input, Radio, Helper} from 'flowbite-svelte';
    import {dialogs} from '$lib/stores/WebappStores.svelte';
    import {serverInfo} from '$lib/stores/ModelInfo.svelte';

</script>

<Modal bind:open={dialogs.deleteModelDialogVisible} autoclose={false} class="w-full">

    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="flex flex-col space-y-6" onkeydown={handleEnterKey} role="dialog">
        <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Delete model</h3>

        <Label class="space-y-2">
            <span>Select the model you want to delete. <br>
        <i>Note that this action cannot be undone!</i></span>
        </Label>
        <div class="grid grid-cols-3">
            {#each serverInfo.allModelNames as model}
                <Radio class="p-2" name="models" onchange={() => {internalSelected = model; newName = model;}}>{model}</Radio>
            {/each}
        </div>
    </div>

    <svelte:fragment slot="footer">
        <Button onclick={handleSubmit}>Delete</Button>
        <Button color="alternative" onclick={handleCancel}>Cancel</Button>
    </svelte:fragment>

</Modal>
