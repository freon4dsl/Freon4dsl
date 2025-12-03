<script lang="ts">
    import { AST, RefReplacerBox, FreNodeReference, notNullOrUndefined } from '@freon4dsl/core';
    import {CC} from "@freon4dsl/samples-external-tester";
    import type {FreComponentProps} from "@freon4dsl/core-svelte";

    // Props
    let { editor, box }: FreComponentProps<RefReplacerBox> = $props();

    let inputElement: HTMLInputElement;
    let value: FreNodeReference<CC>;
    let nameOfValue: string = $state('');
    let numberOfValueAsString: string = $state('0');

    function getValue() {
        let startVal: FreNodeReference<CC> | undefined = box.getPropertyValue();
        // you can cast the startVal to the expected type, in this case "FreNodeReference<CC>"
        if (notNullOrUndefined(startVal) && startVal.typeName === "CC") {
            value = startVal as FreNodeReference<CC>;
            console.log(startVal.constructor.name, value.name, value.typeName)
            // get whatever you want to expose from the node
            // in this case we are showing the referred name and the 'numberProp' of the referred element
            nameOfValue = value.name;
            if (notNullOrUndefined(value.referred)) {
                numberOfValueAsString = (value.referred as CC).numberProp.toString();
            }
        } else { // the default
            AST.change(() => {
                value = FreNodeReference.create<CC>('\<no CC\>', 'CC');
                box.setPropertyValue(value);
            });
            nameOfValue = "\<no CC\>";
        }
    }
    getValue();

    const onChange = () => {
        // set the name of the referred element
        // todo check whether this works in all circumstances
        if (notNullOrUndefined(nameOfValue) && nameOfValue.length > 0) {
            // Note the difference between the following two statements.
            // 'value.name = nameOfValue' sets the name in the FreNodeReference object,
            // which could potentially make it a reference to another object.
            // For instance, when there are three objects of type CC called 'cc1', 'cc2', and 'cc3',
            // and the 'value.name' of the FreNodeReference object equals 'cc1',
            // the object returned by 'value.referred' will be the 'cc1' object.
            // But when you use 'value.referred.name = nameOfValue', you are actually changing the
            // referred object itself. For instance, if the referred object was the 'cc1' object,
            // the statement 'value.referred.name = "cc2"' will change the name of that object to 'cc2',
            // thus creating a second object with that name. This will trigger an update of all references to
            // the 'cc1' object, so the name in those FreNodeReferences becomes 'cc2'.
            // In short:
            // value.referred.name = nameOfValue; // the referred object has a different name
            // value.name = nameOfValue;          // the reference is to another object
            AST.change(() => {
                value.name = nameOfValue;          // the reference is to another object
            })
        }
        // Because we only change the name of the FreNodeReference, there is no need to communicate the
        // new state to the box. If you want to change it to a completely different (new?) FreNodeReference object,
        // you should use:
        // box.setPropertyValue(otherValue);
    }

    const onNumberChange = () => {
        // Note that we change the properties of the referred object here. This is NOT good practice.
        // It is here to show that much is possible, but also that it is easy to create strange effects.
        // A better approach would be to make the numberProp a non-editable part of the page.
        if (notNullOrUndefined(value.referred) && notNullOrUndefined(numberOfValueAsString)) {
            (value.referred as CC).numberProp = parseInt(numberOfValueAsString, 10);
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
    The replacer is showing the name <input bind:value={nameOfValue} bind:this={inputElement} onchange={onChange}/>
    and the number of the referred object <input bind:value={numberOfValueAsString} onchange={onNumberChange}/>.
</div>
