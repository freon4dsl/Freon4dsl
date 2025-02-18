<script lang="ts">
    import { ExternalStringBox } from "@freon4dsl/core";
    import {type FreComponentProps} from "@freon4dsl/core-svelte";

    // Props
    let { editor, box }: FreComponentProps<ExternalStringBox> = $props();

    let inputElement;
    let value: string = $state('');

    function getValue() {
        let startVal: string | undefined = box.getPropertyValue();
        if (typeof startVal === "string") {
            value = startVal;
        } else {
            value = ""; // the default
        }
    }
    getValue();

    const onChange = () => {
        if (!!value && value.length > 0) {
            box.setPropertyValue(value);
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
    StringReplacer
    <input bind:value={value} bind:this={inputElement} onchange={onChange}/>
</div>
