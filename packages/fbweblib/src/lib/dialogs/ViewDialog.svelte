<script lang="ts">
    import {Button, Checkbox, Modal} from 'flowbite-svelte';
    import {projectionsShown, replaceProjectionsShown} from '$lib/stores/Projections.svelte';
    import {langInfo} from '$lib/stores/LanguageInfo.svelte';
    import {ProjectionItem} from "$lib/ts-utils/MenuItem";
    import {dialogs} from "$lib";
    import {isNullOrUndefined} from "@freon4dsl/core";

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
        console.log('Apply Changes')
        // store the selection and enable/disable the projection
        const selection: string[] = [];
        allProjections.forEach(proj => {
            if (!!proj && proj.selected) {
                selection.push(proj.name);
            }
        });
        replaceProjectionsShown(selection);
        // EditorRequestsHandler.getInstance().enableProjections(selection);
        console.log('Currently shown: ' + projectionsShown)
    }
</script>

<Modal title="Select the projections to be shown" bind:open={dialogs.selectViewsDialogVisible} size="xs" autoclose outsideclose
       class="w-full">
    <Checkbox checked disabled>Default</Checkbox>
    {#each allProjections as option}
        {#if !isNullOrUndefined(option)}
            <Checkbox onchange={() => !isNullOrUndefined(option) ? option.selected = !option.selected: null}
                      checked={option.selected}>{option ? option.name : "unknown view"}</Checkbox>
        {/if}
    {/each}
    <svelte:fragment slot="footer">
        <Button onclick={() => applyChanges()}>Apply changes</Button>
    </svelte:fragment>
</Modal>
