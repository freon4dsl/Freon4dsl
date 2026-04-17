<script lang="ts">
    import { dialogs, editorInfo, setUserMessage, WebappConfigurator } from "$lib"
    import Dialog from "$lib/dialogs/Dialog.svelte"
    import { checkName } from "$lib/language/DialogHelpers"
    import { notNullOrUndefined } from "@freon4dsl/core"
    import { Button, Helper, Input } from "flowbite-svelte"
    import { FolderOpenSolid } from "flowbite-svelte-icons"

    const initialHelperText: string = 'Enter the name of the new unit.'
    let helperText: string = $state(initialHelperText);
    let newName: string = $state('');

    function resetVariables() {
        // dialogs.newUnitDialogVisible = false;
        newName = "";
        helperText = initialHelperText;
    }

    function handleCancel() {
        dialogs.newUnitDialogVisible = false;
        resetVariables();
        WebappConfigurator.getInstance().langEnv!.editor.selectionChanged()
    }
    async function handleSubmit() {
        if (newName.length > 0 && checkName(newName).length === 0) {
            const existing: string[] = await WebappConfigurator.getInstance().getUnitNames();
            if (notNullOrUndefined(existing) && existing.length > 0 && existing.indexOf(newName) !== -1) {
                helperText = `Cannot create unit '${newName}', because a unit with that name already exists on the server.`;
            } else {
                if (editorInfo.toBeCreated?.type) {
                    const name = newName
                    dialogs.newUnitDialogVisible = false;
                    resetVariables();
                    await WebappConfigurator.getInstance().newUnit(name, editorInfo.toBeCreated?.type);
                } else {
                    setUserMessage('Cannot create a new unit, because its type is unknown.')
                }
            }
        } else {
            helperText = `Cannot create unit '${newName}', because its name is invalid.`;
        }
    }

    const onInput = () => {
        helperText = checkName(newName);
    }
</script>

<Dialog open={dialogs.newUnitDialogVisible}>

    <h3 class="freon-dialog-title">
        New {editorInfo.toBeCreated?.type} unit
    </h3>

    <div class="flex flex-col space-y-6" role="dialog">

        <div class="relative">
            <Input
                class="freon-dialog-input"
                type="text"
                bind:value={newName}
                id="new-input2"
                name="unit-name"
                oninput={onInput}
            />

            <Helper class="freon-dialog-helper">
                <span class="font-medium">{helperText}</span>
            </Helper>
        </div>

    </div>

    <div class="mt-2 flex justify-end gap-3">

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
            <FolderOpenSolid class="w-4 h-4 me-2"/>
            New
        </Button>

    </div>

</Dialog>

