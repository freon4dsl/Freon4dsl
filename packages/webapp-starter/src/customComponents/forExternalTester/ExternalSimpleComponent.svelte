<script lang="ts">
    import {ExternalSimpleBox} from "@freon4dsl/core";
    import type {FreComponentProps} from "@freon4dsl/core-svelte";

    // The RenderComponent assumes that every svelte component has 'box' and 'editor' as parameters
    // Props
    let { editor, box }: FreComponentProps<ExternalSimpleBox> = $props();

    let src = '/cats-kittens.gif';
    let name1 = 'Two kittens licking';
    let inputElement;

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

<div class="replacer" bind:this={inputElement}>
    <img {src} alt="{name1}" />
</div>
