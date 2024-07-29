<script lang="ts">
    /**
     * This component shows a boolean value as checkbox.
     */
    import {
      ALT, ARROW_DOWN,
      ARROW_LEFT, ARROW_RIGHT, ARROW_UP,
      BooleanControlBox,
      CONTROL,
      FreEditor,
      FreLogger,
      SHIFT, SPACEBAR
    } from "@freon4dsl/core";
    import {afterUpdate, onMount} from "svelte";
    import {MdRadio} from "@material/web/all.js";

    const LOGGER = new FreLogger("RadioComponent").mute();

    export let editor: FreEditor;
    export let box: BooleanControlBox;

    let id: string = box.id;
    let trueElement: MdRadio;
    let falseElement: MdRadio;
    let currentValue = box.getBoolean();
    let ariaLabel = "toBedone"; // todo create useful aria-label

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the html needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
    async function setFocus(): Promise<void> {
      if (currentValue === true) {
        trueElement.focus();
      } else if (currentValue === false) {
        falseElement.focus();
      }
    }
    const refresh = (why?: string): void => {
        LOGGER.log("REFRESH BooleanControlBox: " + why);
        currentValue = box.getBoolean();
    };
    onMount(() => {
        currentValue = box.getBoolean();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    const onChange = (event: MouseEvent & {currentTarget: EventTarget & HTMLInputElement; }) => {
        LOGGER.log("RadioComponent.onChange for box " + box.role + ", value:" + event.target["value"]);
        currentValue = event.target["value"];
        box.setBoolean(currentValue);
        editor.selectElementForBox(box);
        event.stopPropagation();
    }
    const onClick = (event: MouseEvent & {currentTarget: EventTarget & HTMLInputElement; }) => {
        event.stopPropagation();
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== SHIFT && event.key !== CONTROL && event.key !== ALT) { // ignore meta keys
        switch (event.key) { // only react to arrow keys, other keys are handled by other components
          case ARROW_LEFT:
          case ARROW_RIGHT:
          case ARROW_UP:
          case ARROW_DOWN: {
            event.stopPropagation();
            event.preventDefault();
          }
        }
      }
    }
</script>

<span role="radiogroup" aria-labelledby={ariaLabel} class="radiogroup" id="{id}">
  <span class="single">
    <md-radio
            id="trueOne"
            name="group"
            role="radio"
            tabindex="0"
            aria-checked={currentValue === true}
            value={true}
            checked={currentValue === true}
            aria-label="radio-control-true"
            on:click={onClick}
            on:change={onChange}
            on:keydown={onKeyDown}
            bind:this={trueElement}
    ></md-radio>
    <label for="trueOne" class="radiolabel">{box.labels.yes}</label>
  </span>
  <span class="single">
    <md-radio
            id="falseOne"
            name="group"
            role="radio"
            tabindex="0"
            aria-checked={currentValue === false}
            value={false}
            checked={currentValue === false}
            aria-label="radio-control-false"
            on:click={onClick}
            on:change={onChange}
            on:keydown={onKeyDown}
            bind:this={falseElement}
    ></md-radio>
    <label for="falseOne">{box.labels.no}</label>
  </span>
</span>

<style>
    .radiogroup {
      font-size: var(--freon-boolean-font-size);
      font-style: var(--freon-boolean-font-style);
      font-weight: var(--freon-boolean-font-weight);
      font-family: var(--freon-boolean-font-family),sans-serif;
      margin: var(--freon-boolean-margin);
      padding: var(--freon-boolean-padding);
      padding-top: 2px;
      border: none;
      color: var(--freon-boolean-text-color, var(--mdc-theme-primary));
      background-color: var(--freon-boolean-background-color, var(--mdc-theme-background));
      /*border: 1px solid var(--mdc-theme-text-hint-on-background, #ccc);*/
      --md-sys-color-primary: var(--freon-boolean-color, var(--mdc-theme-primary));
      /*--md-sys-color-on-surface-variant: red; color for the one that is not checked */
      /* the following three variables determine the manner in which the focus-ring is shown */
      --md-focus-ring-duration: 0s; /* disabled animation */
      --md-focus-ring-active-width: 0px;
      --md-focus-ring-width: 0px;
    }
    .radiogroup:hover,
    .radiogroup:focus-within {
      border-radius: 0.1em;
      outline: var(--freon-boolean-color, var(--mdc-theme-primary)) solid 1px;
      box-shadow: 0px 0px 10px var(--freon-boolean-color, var(--mdc-theme-primary));
    }
    .single {
      padding-top: 0.2em;
      padding-bottom: 0.2em;
    }
</style>
