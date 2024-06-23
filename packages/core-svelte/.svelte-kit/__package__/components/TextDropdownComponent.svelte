<script>import TextComponent from "./TextComponent.svelte";
import DropdownComponent from "./DropdownComponent.svelte";
import { clickOutsideConditional, componentId, selectedBoxes } from "./svelte-utils/index.js";
import {
  ARROW_DOWN,
  ARROW_UP,
  ENTER,
  ESCAPE,
  isSelectBox,
  FreEditor,
  FreLogger,
  TextBox
} from "@freon4dsl/core";
import { runInAction } from "mobx";
import { afterUpdate, onMount } from "svelte";
const LOGGER = new FreLogger("TextDropdownComponent");
export let box;
export let editor;
let textBox;
$: textBox = box?.textBox;
let id;
id = !!box ? componentId(box) : "textdropdown-with-unknown-box";
let isEditing = false;
let dropdownShown = false;
let text = "";
let selectedId;
let filteredOptions;
let allOptions;
let textComponent;
let setText = (value) => {
  if (value === null || value === void 0) {
    text = "";
  } else {
    text = value;
  }
};
const noOptionsId = "noOptions";
let getOptions = () => {
  let result = box?.getOptions(editor);
  if (result === null || result === void 0) {
    result = [{ id: noOptionsId, label: "<no known options>" }];
  }
  return result;
};
const setFocus = () => {
  LOGGER.log("setFocus " + box.kind + id);
  if (!!textComponent) {
    textComponent.setFocus();
  } else {
    console.error("TextDropdownComponent " + id + " has no textComponent");
  }
};
const refresh = (why) => {
  LOGGER.log("refresh: " + why);
  if (isSelectBox(box)) {
    let selectedOption = box.getSelectedOption();
    if (!!selectedOption) {
      box.textHelper.setText(selectedOption.label);
      setText(box.textHelper.getText());
    }
  }
};
afterUpdate(() => {
  box.setFocus = setFocus;
  box.refreshComponent = refresh;
});
onMount(() => {
  LOGGER.log("onMount for role [" + box.role + "]");
  box.setFocus = setFocus;
  box.refreshComponent = refresh;
});
const textUpdate = (event) => {
  LOGGER.log("textUpdate: " + JSON.stringify(event.detail));
  dropdownShown = true;
  setText(event.detail.content);
  if (!allOptions) {
    allOptions = getOptions();
  }
  filteredOptions = allOptions.filter((o) => o.label.startsWith(text.substring(0, event.detail.caret)));
  makeUnique();
};
function makeUnique() {
  const seen = [];
  const result = [];
  filteredOptions.forEach((option) => {
    if (seen.includes(option.label)) {
      console.error("Option " + JSON.stringify(option) + " is a duplicate");
    } else {
      seen.push(option.label);
      result.push(option);
    }
  });
  filteredOptions = result;
}
function selectLastOption() {
  if (dropdownShown) {
    if (filteredOptions?.length !== 0) {
      selectedId = filteredOptions[filteredOptions.length - 1].id;
    } else {
      editor.setUserMessage("no valid selection");
    }
  }
}
function selectFirstOption() {
  if (dropdownShown) {
    if (filteredOptions?.length !== 0) {
      selectedId = filteredOptions[0].id;
    } else {
      editor.setUserMessage("No valid selection");
    }
  }
}
const onKeyDown = (event) => {
  LOGGER.log("onKeyDown: " + id + " [" + event.key + "] alt [" + event.altKey + "] shift [" + event.shiftKey + "] ctrl [" + event.ctrlKey + "] meta [" + event.metaKey + "], selectedId: " + selectedId + " dropdown:" + dropdownShown + " editing:" + isEditing);
  if (dropdownShown) {
    if (!event.ctrlKey && !event.altKey) {
      switch (event.key) {
        case ESCAPE: {
          dropdownShown = false;
          event.preventDefault();
          event.stopPropagation();
          break;
        }
        case ARROW_DOWN: {
          if (!selectedId || selectedId.length == 0) {
            selectFirstOption();
          } else {
            const index = filteredOptions.findIndex((o) => o.id === selectedId);
            if (index + 1 < filteredOptions.length) {
              selectedId = filteredOptions[index + 1].id;
            } else if (index + 1 === filteredOptions.length) {
              selectFirstOption();
            }
          }
          event.preventDefault();
          event.stopPropagation();
          break;
        }
        case ARROW_UP: {
          if (!selectedId || selectedId.length == 0) {
            selectLastOption();
          } else {
            const index = filteredOptions.findIndex((o) => o.id === selectedId);
            if (index > 0) {
              selectedId = filteredOptions[index - 1].id;
            } else if (index === 0) {
              selectLastOption();
            }
          }
          event.preventDefault();
          event.stopPropagation();
          break;
        }
        case ENTER: {
          let chosenOption = null;
          if (filteredOptions.length === 1) {
            if (filteredOptions.length !== 0) {
              chosenOption = filteredOptions[0];
            } else {
              editor.setUserMessage("No valid selection");
            }
          } else {
            const index = filteredOptions.findIndex((o) => o.id === selectedId);
            if (index >= 0 && index < filteredOptions.length) {
              chosenOption = filteredOptions[index];
            }
          }
          if (!!chosenOption) {
            storeAndExecute(chosenOption);
          } else {
            setText(textBox.getText());
            isEditing = false;
            dropdownShown = false;
          }
          event.preventDefault();
          event.stopPropagation();
          break;
        }
        default: {
          isEditing = false;
          dropdownShown = false;
        }
      }
    }
  } else {
    if (!event.ctrlKey && !event.altKey) {
      switch (event.key) {
        case ENTER: {
          startEditing();
          event.stopPropagation();
          event.preventDefault();
        }
      }
    }
  }
};
function clearText() {
  box.textHelper.setText("");
  setText("");
}
const itemSelected = () => {
  LOGGER.log("itemSelected " + selectedId);
  const index = filteredOptions.findIndex((o) => o.id === selectedId);
  if (index >= 0 && index < filteredOptions.length) {
    const chosenOption = filteredOptions[index];
    if (!!chosenOption) {
      storeAndExecute(chosenOption);
    }
  }
  if (!isSelectBox(box)) {
    clearText();
  }
  isEditing = false;
  dropdownShown = false;
};
const startEditing = (event) => {
  LOGGER.log("TextDropdownComponent: startEditing" + JSON.stringify(event?.detail));
  isEditing = true;
  dropdownShown = true;
  editor.selectElementForBox(box);
  allOptions = getOptions();
  if (!!event) {
    if (text === void 0 || text === null) {
      filteredOptions = allOptions.filter((o) => true);
    } else {
      filteredOptions = allOptions.filter((o) => {
        LOGGER.log(`startsWith text [${text}], option is ${JSON.stringify(o)}`);
        return o?.label?.startsWith(text.substring(0, event.detail.caret));
      });
    }
  } else {
    filteredOptions = allOptions.filter((o) => o?.label?.startsWith(text.substring(0, 0)));
  }
  makeUnique();
};
function storeAndExecute(selected) {
  LOGGER.log("executing option " + selected.label);
  isEditing = false;
  dropdownShown = false;
  runInAction(() => {
    box.selectOption(editor, selected);
    if (isSelectBox(box)) {
      box.textHelper.setText(selected.label);
      setText(selected.label);
    } else {
      clearText();
    }
  });
}
const endEditing = () => {
  LOGGER.log("endEditing " + id + " dropdownShow:" + dropdownShown + " isEditing: " + isEditing);
  if (isEditing === true) {
    isEditing = false;
  } else {
    if (dropdownShown === true) {
      dropdownShown = false;
    }
    return;
  }
  if (dropdownShown) {
    if (allOptions === void 0 || allOptions === null) {
      allOptions = getOptions();
    }
    let validOption = allOptions.find((o) => o.label === text);
    if (!!validOption && validOption.id !== noOptionsId) {
      storeAndExecute(validOption);
    } else {
      setText(textBox.getText());
    }
    dropdownShown = false;
  }
};
const onBlur = () => {
  LOGGER.log("onBlur " + id);
  if (!document.hasFocus() || !$selectedBoxes.includes(box)) {
    endEditing();
  }
};
const onFocusOutText = () => {
  LOGGER.log("onFocusOutText " + id);
  if (isEditing) {
    isEditing = false;
  }
};
const onClickOutside = () => {
  LOGGER.log("onClickOutside");
  endEditing();
};
refresh();
</script>


<span id="{id}"
      on:keydown={onKeyDown}
      use:clickOutsideConditional={{enabled: dropdownShown}}
      on:click_outside={onClickOutside}
      on:blur={onBlur}
      on:contextmenu={(event) => endEditing()}
      class="dropdown"
>
    <TextComponent
            bind:isEditing={isEditing}
            bind:text={text}
            bind:this={textComponent}
            partOfActionBox={true}
            box={textBox}
            editor={editor}
            on:textUpdate={textUpdate}
            on:startEditing={startEditing}
            on:endEditing={endEditing}
            on:onFocusOutText={onFocusOutText}
    />
    {#if dropdownShown}
        <DropdownComponent
                bind:selectedId={selectedId}
                bind:options={filteredOptions}
                on:freItemSelected={itemSelected}/>
    {/if}
</span>

<style>
    /* The container styling - needed to position the dropdown content */
    .dropdown {
        position: relative;
        display: inline-block;
    }
</style>
