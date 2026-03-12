<script lang="ts">
    import Dialog from "$lib/dialogs/Dialog.svelte"
    import {Button, Checkbox} from 'flowbite-svelte';
    import {projectionsShown, replaceProjectionsShown} from '$lib/stores/Projections.svelte';
    import {langInfo} from '$lib/stores/LanguageInfo.svelte';
    import {ProjectionItem} from "$lib/ts-utils/MenuItem";
    import { dialogs, WebappConfigurator } from "$lib"
    import { isNullOrUndefined, notNullOrUndefined } from "@freon4dsl/core"
    import { EditorRequestsHandler } from "$lib/language"

    let allProjections: (ProjectionItem | undefined)[] = $derived(
        langInfo.projectionNames.map(view => {
            let selected: boolean = false;
            if (view !== 'default') {
                if (projectionsShown.includes(view)) {
                    selected = true;
                }
                return new ProjectionItem(view, selected);
            }
        })
    );

    function applyChanges() {
        // console.log('Apply Changes')
        // store the selection and enable/disable the projection
        const selection: string[] = [];
        allProjections.forEach(proj => {
            if (notNullOrUndefined(proj) && proj.selected) {
                selection.push(proj.name);
            }
        });
        replaceProjectionsShown(selection);
        EditorRequestsHandler.getInstance().enableProjections(selection);
        dialogs.selectViewsDialogVisible = false
        WebappConfigurator.getInstance().langEnv!.editor.selectionChanged()
    }
</script>

<Dialog open={dialogs.selectViewsDialogVisible}>

    <h3 class="freon-dialog-title">
        Select the projections to be shown
    </h3>

    <div class="flex flex-col space-y-6" role="dialog">

        <div class="freon-dialog-section p-4 flex flex-col gap-2">

            <Checkbox checked disabled>
                Default
            </Checkbox>

            {#each allProjections as option, index (index)}
                {#if !isNullOrUndefined(option)}
                    <Checkbox
                        checked={option.selected}
                        onchange={() =>
                            !isNullOrUndefined(option)
                                ? option.selected = !option.selected
                                : null
                        }
                    >
                        {option ? option.name : "unknown view"}
                    </Checkbox>
                {/if}
            {/each}

        </div>

        <div class="mt-2 flex justify-end gap-3">

            <Button
                class="freon-dialog-btn freon-dialog-btn-ok"
                onclick={() => applyChanges()}
            >
                Apply changes
            </Button>

        </div>

    </div>

</Dialog>
