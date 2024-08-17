<script lang="ts">
    import {afterUpdate, onMount} from "svelte";
    import {ExternalSimpleBox, FreEditor} from "@freon4dsl/core";
    export let box: ExternalSimpleBox;
    //@ts-ignore The RenderComponent assumes that every svelte component has 'box' and 'editor' as parameters
    export let editor: FreEditor;
    let src = '/cats-kittens.gif';
    let name1 = 'Two kittens licking';
    let inputElement;

    // The following four functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        inputElement.focus();
    }
    const refresh = (why?: string): void => {
        // do whatever needs to be done to refresh the elements that show information from the model
    };
    onMount(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
</script>

<div class="replacer">
    <img {src} alt="{name1}" />
</div>
