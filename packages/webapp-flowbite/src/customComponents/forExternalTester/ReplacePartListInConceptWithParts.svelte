<script lang="ts">
    import { AST, PartListReplacerBox, type FreNode, isNullOrUndefined, notNullOrUndefined } from '@freon4dsl/core';
    import {CC} from "@freon4dsl/samples-external-tester";
    import {type FreComponentProps, RenderComponent} from "@freon4dsl/core-svelte";

    // Props
    let { editor, box }: FreComponentProps<PartListReplacerBox> = $props();

    let button: HTMLButtonElement;
    let value: CC[];

    function getValue() {
        let startVal: FreNode[] = box.getPropertyValue();
        // startVal should not be undefined, but it can be empty!
        if (notNullOrUndefined(startVal) && box.getPropertyType() === "CC") {
            value = startVal as CC[];
        }
        // You can cast the startVal to the expected type, in this case "CC[]".
        // But you also have access to the native boxes that project the elements in the list,
        // those we will be using via the native RenderComponent.
    }
    getValue();

    const addChild = () => {
        // Note that you need to put any changes to the actual model in an 'AST.change or AST.changeNamed',
        // because all elements in the model are reactive using mobx.
        AST.changeNamed("addChild", () => {
            let newCC: CC = CC.create({name: "new element", numberProp: 100});
            value.push(newCC);
        });
    }

    const removeChild = () => {
        // Note that you need to put any changes to the actual model in an 'AST.change or AST.changeNamed',
        // because all elements in the model are reactive using mobx.
        AST.changeNamed("removeChild", () => {
            value.splice(0, 1);
        });
    }

    // The following three functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        if (notNullOrUndefined(box.children) && box.children.length > 0) {
            box.children[0].setFocus();
        } else if (notNullOrUndefined(button)) {
            button.focus();
        }
    }
    const refresh = (why?: string): void => {
        // do whatever needs to be done to refresh the elements that show information from the model
        getValue();
    };
    $effect(() => {
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
    <button class="list-replace-button" onclick={addChild} bind:this={button}>Add list element</button>
    <button class="list-replace-button" onclick={removeChild} bind:this={button}>Remove first list element</button>
</div>
