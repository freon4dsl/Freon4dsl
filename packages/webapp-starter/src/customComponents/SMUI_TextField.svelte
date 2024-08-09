<script lang="ts">
    import Textfield from '@smui/textfield';
    import Icon from '@smui/textfield/icon';
    import HelperText from '@smui/textfield/helper-text';
    import {ExternalBox, FreEditor} from "@freon4dsl/core";
    import {afterUpdate, onMount} from "svelte";
    export let box: ExternalBox;
    export let editor: FreEditor;

    let valueA: string = '';

    function getValueFromModel() {
        let modelValue = box.getPrimitivePropertyValue();
        if (typeof modelValue === 'string') {
            valueA = modelValue;
        }
        console.log("ValueA: " + valueA + ", modelValue: " + modelValue)
    }

    let inputElement;
    async function setFocus(): Promise<void> {
        inputElement.focus();
    }
    const refresh = (why?: string): void => {
        getValueFromModel();
    };
    onMount(() => {
        getValueFromModel();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        getValueFromModel();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    getValueFromModel();
    $: box.setPrimitivePropertyValue(valueA);
</script>

<span class="card-container">
    <Textfield bind:value={valueA} label="{box.propertyName}" bind:this={inputElement}>
      <Icon class="material-icons" slot="leadingIcon">event</Icon>
      <HelperText slot="helper">This is a SMUI input to set the value of {box.propertyName}</HelperText>
      <Icon class="material-icons" slot="trailingIcon">delete</Icon>
    </Textfield>
</span>

<style>
    .card-container {
        padding: 10px;
    }
</style>
