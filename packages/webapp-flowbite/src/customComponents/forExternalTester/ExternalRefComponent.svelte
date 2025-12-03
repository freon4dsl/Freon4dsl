<script lang="ts">
    import {AST, RefReplacerBox, FreNodeReference} from "@freon4dsl/core";
    import {CC} from "@freon4dsl/samples-external-tester";
    import type {FreComponentProps} from "@freon4dsl/core-svelte";

    // Props
    let { editor, box }: FreComponentProps<RefReplacerBox> = $props();

    let inputElement: HTMLInputElement;
    let value: FreNodeReference<CC>;
    let nameOfValue: string = $state('');

    function getValue() {
        let startVal: FreNodeReference<CC> | undefined = box.getPropertyValue();
        // you can cast the startVal to the expected type, in this case "FreNodeReference<CC>"
        // note that the property is optional in the model
        if (!!startVal && startVal.typeName === "CC") {
            value = startVal as FreNodeReference<CC>;
            // get whatever you want to expose from the node
            // in this case we are showing the referred name and the 'numberProp' of the referred element
            if (!!value.referred) {
                nameOfValue = value.referred.name;
            } else {
                nameOfValue = "<unknown>";
            }
        } else { // the default
            AST.change(() => {
                value = FreNodeReference.create<CC>('noCC', 'CC');
            });
            nameOfValue = "<unknown>";
        }
    }
    getValue();

    const onChange = () => {
        // set the name of the referred element
        // todo check whether this works in all circumstances
        if (!!nameOfValue && nameOfValue.length > 0) {
            // Note the difference between these two statements, and the order.
            // The second sets the name in the FreNodeReference object,
            // which could potentially make it a reference to another object.
            // For instance, when there are three objects of type CC called 'cc1', 'cc2', and 'cc3',
            // and the 'value' FreNodeReference object holds the name 'cc1',
            // the object returned by 'value.referred' will be the 'cc1' object.
            // But when you change the name in the 'value' FreNodeReference object to 'cc2',
            // 'value.referred' will return the 'cc2' object. After changing value.name to 'cc4',
            // 'value.referred' will return null. But when you first change the name of the 'cc1'
            // object to 'cc4', and _then_ change the name in the FreNodeReference also to 'cc4'
            // value.referred will return the same object as before the changes.
            // Do be careful with this feature. Other references to 'cc1' may be left dangling.
            value.referred.name = nameOfValue; // the reference now refers to another object
            value.name = nameOfValue;          // now the name of the object equals that of the reference
        }
        // Because we only change the name of the FreNodeReference, there is no need to communicate the
        // new state to the box. If you want to change it to a completely different (new?) FreNodeReference object,
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
    The replacer is showing the name <input bind:value={nameOfValue} bind:this={inputElement} onchange={onChange}/>
</div>
