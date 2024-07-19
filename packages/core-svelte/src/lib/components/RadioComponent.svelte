<script lang="ts">
    /**
     * This component shows a boolean value as checkbox.
     */
    import {BooleanControlBox, FreEditor, FreLogger} from "@freon4dsl/core";
    import {afterUpdate, onMount} from "svelte";

    const LOGGER = new FreLogger("RadioComponent").mute();

    export let editor: FreEditor;
    export let box: BooleanControlBox;

    let id: string = box.id;
    let inputElement: HTMLInputElement;
    let value = box.getBoolean();

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the html needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
    async function setFocus(): Promise<void> {
        inputElement.focus();
    }
    const refresh = (why?: string): void => {
        LOGGER.log("REFRESH BooleanControlBox: " + why);
        value = box.getBoolean();
    };
    onMount(() => {
        value = box.getBoolean();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    const onChange = (event: MouseEvent & {currentTarget: EventTarget & HTMLInputElement; }) => {
        LOGGER.log("RadioComponent.onChange for box " + box.role + ", value:" + value);
        value = !value;
        box.setBoolean(value);
        if (box.selectable) {
            editor.selectElementForBox(box);
        }
        event.stopPropagation();
    }
    const onClick = (event: MouseEvent & {currentTarget: EventTarget & HTMLInputElement; }) => {
        LOGGER.log("RadioComponent.onClick for box " + box.role + ", value:" + value);
        event.stopPropagation();
    }
</script>

<span role="radiogroup" class="radio">
<span id="{id}" class="mdc-form-field">
	  <span class="mdc-radio">
    <input
            class="mdc-radio__native-control"
            type="radio"
            id="trueOne"
            bind:this={inputElement}
            checked={value===true}
            on:click={onClick}
            on:change={onChange}
            name="trueOne"
    >
    <span class="mdc-radio__background">
      <span class="mdc-radio__outer-circle" />
      <span class="mdc-radio__inner-circle" />
    </span>
  </span>
	<label for="trueOne" class="radiolabel">True</label>
</span>
<span id="{id}" class="mdc-form-field xxx">
	  <span class="mdc-radio xxx">
		<input
                class="mdc-radio__native-control"
                type="radio"
                id="falseOne"
                checked={value===false}
                on:click={onClick}
                on:change={onChange}
        />
    <span class="mdc-radio__background">
      <span class="mdc-radio__outer-circle" />
      <span class="mdc-radio__inner-circle" />
    </span>
  </span>
  <label for="falseOne" class="radiolabel">False</label>
</span>
</span>

<style>
    .radio {
        --mdc-theme-secondary: var(--freon-boolean-radio-color, var(--mdc-theme-primary));
    }
    .radiolabel {
        padding-right: 4px;
    }
</style>

