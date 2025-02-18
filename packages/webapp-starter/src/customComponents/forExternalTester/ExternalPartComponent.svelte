<script lang="ts">
    import { ExternalPartBox, FreNode} from "@freon4dsl/core";
    import {BB} from "@freon4dsl/samples-external-tester";
    import type {FreComponentProps} from "@freon4dsl/core-svelte";

    // Props
    let { editor, box }: FreComponentProps<ExternalPartBox> = $props();

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
            nameOfValue = "<unknown>";
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
        // Because we only change properties of the part, there is no need to communicate the
        // new state to the box. If you want to change it to a completely different (new?) part,
        // you should use:
        // box.setPropertyValue(otherValue);
    }

    // The following three functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        inputElement.focus();
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
    The replacer is showing the name
    <input bind:value={nameOfValue} bind:this={inputElement} onchange={onChange}/>
    and numberProp:
    <input bind:value={numberOfValue} onchange={onChange}/>
</div>
