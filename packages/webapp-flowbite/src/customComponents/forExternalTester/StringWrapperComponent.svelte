<script lang="ts">
    import {StringWrapperBox} from "@freon4dsl/core";
    import {type FreComponentProps, RenderComponent} from "@freon4dsl/core-svelte";

    // Props
    let { editor, box }: FreComponentProps<StringWrapperBox> = $props();

    // todo remove inputElement and set focus to box.childBox
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
    String Wrapper
    <RenderComponent box={box.childBox} editor={editor}/>
</div>
