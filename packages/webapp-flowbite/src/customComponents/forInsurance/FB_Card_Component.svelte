<script lang="ts">
    import {type FreComponentProps, RenderComponent} from "@freon4dsl/core-svelte";
    import { FragmentWrapperBox, notNullOrUndefined } from "@freon4dsl/core"
    import { Card } from 'flowbite-svelte';

    // Props
    let { editor, box }: FreComponentProps<FragmentWrapperBox> = $props();

    // The following three functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        if (notNullOrUndefined(box.childBox)) {
            box.childBox.setFocus();
        }
    }
    const refresh = (why?: string): void => {
        // do whatever needs to be done to refresh the elements that show information from the model
    };
    $effect(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
</script>

<span class="card-container">
    <Card>
        <RenderComponent box={box.childBox} editor={editor} />
    </Card>
</span>

<style>
    .card-container {
        padding: 10px;
    }
</style>
