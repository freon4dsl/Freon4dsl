<script lang="ts">
    import {SimpleExternalBox} from "@freon4dsl/core";
    import type {FreComponentProps} from "@freon4dsl/core-svelte";

    // The RenderComponent assumes that every svelte component has 'box' and 'editor' as parameters
    // Props
    let { editor, box }: FreComponentProps<SimpleExternalBox> = $props();

    let src = '/customImages/cats-kittens.gif';
    let name1 = 'Two kittens licking';
    let divElement: HTMLDivElement;

    // The following three functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        divElement.focus();
    }
    const refresh = (why?: string): void => {
        // do whatever needs to be done to refresh the elements that show information from the model
    };
    $effect(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
</script>

<div class="replacer" bind:this={divElement}>
    <img {src} alt="{name1}" />
</div>
