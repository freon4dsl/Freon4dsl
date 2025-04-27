<script lang="ts">
    import Card from '@smui/card';
    import {type FreComponentProps, RenderComponent} from "@freon4dsl/core-svelte";
    import {FragmentWrapperBox} from "@freon4dsl/core";

    // Props
    let { editor, box }: FreComponentProps<FragmentWrapperBox> = $props();

    // The following three functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        if (!!box.childBox) {
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
