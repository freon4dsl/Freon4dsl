<script lang="ts">
    import {afterUpdate, onMount} from "svelte";
    import {ExternalPartListBox, FreEditor, FreNode} from "@freon4dsl/core";
    import {BB} from "@freon4dsl/samples-external-tester";
    import {RenderComponent} from "@freon4dsl/core-svelte";
    export let box: ExternalPartListBox;
    export let editor: FreEditor;

    let button;
    let value: BB[];

    function getValue() {
        let startVal: FreNode[] | undefined = box.getPropertyValue();
        if (!!startVal && startVal.length > 0 && startVal[0].freLanguageConcept() === "BB") {
            value = startVal as BB[];
        } else {
            value = [];
        }
        // You can cast the startVal to the expected type, in this case "BB[]".
        // But you also have access to the native boxes the project the elements in the list,
        // those we will be projecting using the native RenderComponent.
    }
    getValue();

    const addChild = () => {
        let newBB: BB = BB.create({name: "new element", numberProp: 100, booleanProp: true});
        value.push(newBB);
        box.setPropertyValue(value);
    }

    // The following four functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        if (!!box.children && box.children.length > 0) {
            box.children[0].setFocus();
        } else {
            button.focus();
        }
    }
    const refresh = (why?: string): void => {
        // do whatever needs to be done to refresh the elements that show information from the model
        getValue();
    };
    onMount(() => {
        getValue();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        getValue();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
</script>

<div class="replacer">
    The replacer is showing a list of children, each in their native boxes.
    <ol>
        {#each box.children as childBox}
            <li><RenderComponent box={childBox} editor={editor} /></li>
        {/each}
    </ol>
    <button on:click={addChild} bind:this={button}>Add child</button>
</div>
