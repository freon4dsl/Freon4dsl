<script lang="ts">
    import {afterUpdate, onMount} from "svelte";
    import {ExternalPartBox, FreEditor, FreNode, StringWrapperBox} from "@freon4dsl/core";
    import {RenderComponent} from "@freon4dsl/core-svelte";
    import {BB} from "@freon4dsl/samples-external-tester";
    export let box: ExternalPartBox;
    export let editor: FreEditor;

    let inputElement;
    let value: BB;
    let nameOfValue: string;
    let numberOfValue: string;

    function getValue() {
        let startVal: FreNode | undefined = box.getPropertyValue();
        // you can cast the startVal to the expected type, in this case "BB"
        // note that the property is optional in the model
        if (!!startVal && startVal.freLanguageConcept() === "BB") {
            value = startVal as BB;
            // get whatever you want to expose from the node
            // in this case we are showing its 'name' and 'numberProp'
            nameOfValue = value.name;
            numberOfValue = value.numberProp.toString();
        } else { // the default
            value = null;
            nameOfValue = "";
            numberOfValue = "0";
        }
    }
    getValue();

    const onChange = () => {
        // set the name and numberProp of value
        if (!!numberOfValue && numberOfValue.length > 0) {
            value.numberProp = Number.parseInt(numberOfValue);
        }
        if (!!nameOfValue && nameOfValue.length > 0) {
            value.name = nameOfValue;
        }
        // then communicate the new state to the box
        box.setPropertyValue(value);
    }

    // The following four functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        inputElement.focus();
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
    The replacer is showing the name <input bind:value={nameOfValue} bind:this={inputElement} on:change={onChange}/> and numberProp: <input bind:value={numberOfValue} on:change={onChange}/>
</div>
