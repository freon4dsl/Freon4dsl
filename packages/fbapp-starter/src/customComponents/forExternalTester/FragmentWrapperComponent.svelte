<script lang="ts">
    import {FragmentWrapperBox} from "@freon4dsl/core";
    import {type FreComponentProps, RenderComponent} from "@freon4dsl/core-svelte";

    // Props
    let { editor, box }: FreComponentProps<FragmentWrapperBox> = $props();

    let inputElement: HTMLInputElement;

    // The following three functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        inputElement.focus();
    }
    const refresh = (why?: string): void => {
        // do whatever needs to be done to refresh the elements that show information from the model
    };
    $effect(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
</script>

<div class="wrapper">
    Fragment wrapper
    <RenderComponent box={box.childBox} editor={editor}/>
</div>

<style>
    .wrapper {
        border: 2px groove #666666;
        border-radius: 8px;
    }
</style>
