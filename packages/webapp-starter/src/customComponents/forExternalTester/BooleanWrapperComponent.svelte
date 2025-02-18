<script lang="ts">
    import {BooleanWrapperBox} from "@freon4dsl/core";
    import {type FreComponentProps, RenderComponent} from "@freon4dsl/core-svelte";
    import type {SvelteComponent} from "svelte";

    // Props
    let { editor, box }: FreComponentProps<BooleanWrapperBox> = $props();

    let inputElement: SvelteComponent;

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
    Boolean wrapper
    <RenderComponent box={box.childBox} editor={editor} bind:this={inputElement}/>
</div>
