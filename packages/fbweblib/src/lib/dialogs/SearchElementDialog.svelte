<script lang="ts">
    import { Button, Modal, Input, Radio, Card } from "flowbite-svelte"
    import { dialogs } from "$lib/stores/WebappStores.svelte"
    import { FreLanguage } from "@freon4dsl/core"

    let nodeType = $state("")
    let textToFind: string = $state("")
    let namedElementToFind: string = $state("")

    function handleCancel() {
        dialogs.searchElementDialogVisible = false
        resetVariables()
    }

    async function handleSubmit() {

    }

    function resetVariables() {
        nodeType = ""
        textToFind = ""
        namedElementToFind = ""
    }

</script>

<Modal bind:open={dialogs.searchElementDialogVisible} autoclose={false} class="w-full">
    <div class="flex flex-col space-y-6" role="dialog">
        <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Search for ...</h3>
        <Card class="flex flex-col space-y-6 bg-white shadow my-2 p-6 max-w-full">
        <h4 class="text-l font-medium text-gray-900 dark:text-white"> Element with certain type and name</h4>
        <div class="relative text-gray-700">
            <Input class="w-full h-10 pl-3 pr-32 text-base placeholder-gray-600 border rounded-lg focus:shadow-outline"
                   type="text"
                   bind:value={namedElementToFind}
                   id="new-input"
                   name="model-name"
            />
        </div>
        <div>
            <div class="grid grid-cols-3 mb-3 p-2">
                {#each FreLanguage.getInstance().getNamedElements() as name}
                    <Radio class="p-2" name="nodeTypes" onchange={() => {nodeType = name;}}>{name}</Radio>
                {/each}
            </div>
        </div>
        </Card>
    </div>

    <svelte:fragment slot="footer">
        <Button onclick={handleSubmit}>Search</Button>
        <Button color="alternative" onclick={handleCancel}>Cancel</Button>
    </svelte:fragment>

</Modal>
