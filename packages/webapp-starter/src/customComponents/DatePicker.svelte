<script lang="ts">
    import {afterUpdate, onMount} from "svelte";
    import {ExternalBox, FreEditor} from "@freon4dsl/core";
    export let box: ExternalBox;
    export let editor: FreEditor;

    let inputElement;
    let value: string = "";
    getValue();

    const onClick = (event: MouseEvent & {currentTarget: EventTarget & HTMLInputElement; }) => {
        event.stopPropagation();
    }

    const onChange = (event: MouseEvent & {currentTarget: EventTarget & HTMLInputElement; }) => {
        event.stopPropagation();
        let xx = getValidDate(value)
        if (xx !== undefined) {
            console.log("Changing value to: " + value)
            box.children[0].element[box.children[0].propertyName] = value;
        } else {
            console.log("Value: " + value + " is not a valid date")
        }
    }
    function getValidDate(d) {
        let dateArray = d.split("-");
        let newDate = `${dateArray[2]}-${dateArray[1]}-${dateArray[0]}`;

        console.log("In isValidDate: "+ newDate); // 2019-05-15 (YYYY/MM/DD)
        let date = new Date(newDate);
        if (date instanceof Date) {
            return date;
        } else {
            return undefined;
        }
    }
    function getValue() {
        let startStr: string | undefined = box.children[0].element[box.children[0].propertyName];
        value = (!!startStr && startStr.length > 0) ? startStr : "2024-02-24";
        console.log("Value: " + value);
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
        box.children[0].setFocus = setFocus;
        box.refreshComponent = refresh;
        box.children[0].refreshComponent = refresh;
    });
    afterUpdate(() => {
        box.setFocus = setFocus;
        box.children[0].setFocus = setFocus;
        box.refreshComponent = refresh;
        box.children[0].refreshComponent = refresh;
    });
</script>
<div class="datepicker">
    <input
            id="default-datepicker"
            type="date"
            bind:value={value}
            class="datepicker-input"
            placeholder="Select date"
            on:click={onClick}
            on:change={onChange}
            bind:this={inputElement}
    />
</div>

<style>
    .datepicker {
        position: relative;
        max-width: 24rem;
    }
    .datepicker-input {
        background-color: rgb(249 250 251);
        border-width: 1px;
        border-color: rgb(209 213 219);
        color: rgb(17 24 39);
        font-size: 0.875rem; /* 14px */
        line-height: 1.25rem; /* 20px */
        border-radius: 0.5rem; /* 8px */
        display: block;
        width: 100%;
        padding-inline-start: 2.5rem; /* 40px */
        padding: 0.625rem; /* 10px */
    }
    .datepicker-input:focus {
        --tw-ring-color: rgb(59 130 246);
        border-color: rgb(59 130 246);
    }
</style>
