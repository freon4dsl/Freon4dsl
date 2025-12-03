<script lang="ts">
    import { PartReplacerBox, type FreNode, isNullOrUndefined, notNullOrUndefined } from '@freon4dsl/core';
    import {CC} from "@freon4dsl/samples-external-tester";
    import type {FreComponentProps} from "@freon4dsl/core-svelte";

    // Props
    let { editor, box }: FreComponentProps<PartReplacerBox> = $props();

    let inputElement: HTMLInputElement;
    let value: CC | undefined = $state();
    let nameOfValue: string = $state('');
    let numberOfValue: string = $state('');

    function getValue() {
        let startVal: FreNode | undefined = box.getPropertyValue();
        // you can cast the startVal to the expected type, in this case "CC"
        // note that the property is optional in the model
        if (notNullOrUndefined(startVal) && startVal.freLanguageConcept() === "CC") {
            value = startVal as CC;
            // get whatever you want to expose from the node
            // in this case we are showing its 'name' and 'numberProp'
            nameOfValue = value.name;
            numberOfValue = value.numberProp.toString();
        } else { // the default
            value = CC.create({name: 'noConceptwithPart'});
            nameOfValue = "<unknown>";
            numberOfValue = "0";
        }
    }
    getValue();

    const onChange = () => {
        // set the name and numberProp of value
        if (value instanceof CC) {
            if (!!numberOfValue && numberOfValue.length > 0) {
                value.numberProp = Number.parseInt(numberOfValue);
            }
            if (!!nameOfValue && nameOfValue.length > 0) {
                value.name = nameOfValue;
            }
            // check whether there is a previous property of type CC,
            // if not, set the default as property
            let startVal: FreNode | undefined = box.getPropertyValue();
            if (isNullOrUndefined(startVal)) {
                console.log('setting value:', value);
                box.setPropertyValue(value!);
            }
        }
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
