<!-- This component switches between a <span> and an <input> HTML element. -->
<!-- This means that there is extra functionality to set the caret position -->
<!-- (cursor or selected text), when the switch is being made. -->

<script>import { afterUpdate, beforeUpdate, createEventDispatcher, onMount } from "svelte";
import { componentId, executeCustomKeyboardShortCut, setBoxSizes } from "./svelte-utils/index.js";
import {
  ActionBox,
  ALT,
  ARROW_DOWN,
  ARROW_LEFT,
  ARROW_RIGHT,
  ARROW_UP,
  BACKSPACE,
  CharAllowed,
  CONTROL,
  DELETE,
  ENTER,
  ESCAPE,
  isActionBox,
  isActionTextBox,
  isSelectBox,
  FreCaret,
  FreCaretPosition,
  FreEditor,
  FreLogger,
  SelectBox,
  FreErrorSeverity,
  SHIFT,
  TAB,
  TextBox,
  isRegExp,
  triggerTypeToString
} from "@freon4dsl/core";
import { runInAction } from "mobx";
import { replaceHTML } from "./svelte-utils/index.js";
const LOGGER = new FreLogger("TextComponent");
const dispatcher = createEventDispatcher();
export let box;
export let editor;
export let isEditing = false;
export let partOfActionBox = false;
export let text;
let id;
id = !!box ? componentId(box) : "text-with-unknown-box";
let spanElement;
let inputElement;
let placeholder = "<..>";
let originalText;
let editStart = false;
let from = -1;
let to = -1;
let placeHolderStyle;
$: placeHolderStyle = partOfActionBox ? "actionPlaceholder" : "placeholder";
let boxType = "text";
$: boxType = !!box.parent ? isActionBox(box?.parent) ? "action" : isSelectBox(box?.parent) ? "select" : "text" : "text";
export async function setFocus() {
  LOGGER.log("setFocus " + id + " input is there: " + !!inputElement);
  if (!!inputElement) {
    inputElement.focus();
  } else {
    isEditing = true;
    editStart = true;
    originalText = text;
    setCaret(editor.selectedCaretPosition);
  }
}
function setFromAndTo(inFrom, inTo) {
  if (inFrom < inTo) {
    from = inFrom;
    to = inTo;
  } else {
    from = inTo;
    to = inFrom;
  }
}
const setCaret = (freCaret) => {
  LOGGER.log(`setCaret ${freCaret.position} [${freCaret.from}, ${freCaret.to}]`);
  switch (freCaret.position) {
    case FreCaretPosition.RIGHT_MOST:
      from = to = text.length;
      break;
    case FreCaretPosition.LEFT_MOST:
    case FreCaretPosition.UNSPECIFIED:
      from = to = 0;
      break;
    case FreCaretPosition.INDEX:
      setFromAndTo(freCaret.from, freCaret.to);
      break;
    default:
      from = to = 0;
      break;
  }
  if (isEditing && !!inputElement) {
    inputElement.selectionStart = from >= 0 ? from : 0;
    inputElement.selectionEnd = to >= 0 ? to : 0;
    inputElement.focus();
  }
};
function startEditing(event) {
  LOGGER.log("startEditing " + id);
  editor.selectElementForBox(box);
  isEditing = true;
  editStart = true;
  originalText = text;
  let { anchorOffset, focusOffset } = document.getSelection();
  setFromAndTo(anchorOffset, focusOffset);
  event.preventDefault();
  event.stopPropagation();
  dispatcher("startEditing", { content: text, caret: from });
}
function onClick(event) {
  if (!!inputElement) {
    LOGGER.log("onClick: " + id + ", " + inputElement?.selectionStart + ", " + inputElement?.selectionEnd);
    setFromAndTo(inputElement.selectionStart, inputElement.selectionEnd);
  }
  if (partOfActionBox) {
    LOGGER.log("dispatching from on click");
    dispatcher("textUpdate", { content: text, caret: from });
  }
  event.stopPropagation();
}
function endEditing() {
  LOGGER.log(" endEditing " + id);
  if (isEditing) {
    isEditing = false;
    from = -1;
    to = -1;
    if (!partOfActionBox) {
      LOGGER.log(`   save text using box.setText(${text})`);
      runInAction(() => {
        if (box.deleteWhenEmpty && text.length === 0) {
          editor.deleteBox(box);
        } else if (text !== box.getText()) {
          LOGGER.log(`   text is new value`);
          box.setText(text);
        }
      });
    } else {
      dispatcher("endEditing");
    }
  }
}
function getCaretPosition(event) {
  const target = event.target;
  setFromAndTo(target.selectionStart, target.selectionEnd);
}
const onKeyDown = (event) => {
  LOGGER.log("onKeyDown: [" + event.key + "] alt [" + event.altKey + "] shift [" + event.shiftKey + "] ctrl [" + event.ctrlKey + "] meta [" + event.metaKey + "]");
  if (event.altKey || event.ctrlKey) {
    executeCustomKeyboardShortCut(event, 0, box, editor);
    if (event.ctrlKey && !event.altKey && event.key === "z") {
    } else if (event.ctrlKey && event.altKey && event.key === "z" || !event.ctrlKey && event.altKey && event.key === BACKSPACE) {
    } else if (event.ctrlKey && !event.altKey && event.key === "h") {
      event.stopPropagation();
    } else if (event.ctrlKey && !event.altKey && event.key === "x") {
      event.stopPropagation();
    } else if (event.ctrlKey && !event.altKey && event.key === "c") {
      event.stopPropagation();
      navigator.clipboard.writeText(text).then(() => {
        editor.setUserMessage("Text copied to clipboard", FreErrorSeverity.Info);
      }).catch((err) => {
        editor.setUserMessage("Error in copying text: " + err.message);
      });
    } else if (event.ctrlKey && !event.altKey && event.key === "v") {
      event.stopPropagation();
      event.preventDefault();
    } else if (event.key === SHIFT || event.key === CONTROL || event.key === ALT) {
      LOGGER.log("SHIFT: stop propagation");
      event.stopPropagation();
    }
  } else {
    switch (event.key) {
      case ARROW_DOWN:
      case ARROW_UP:
      case ENTER:
      case ESCAPE:
      case TAB: {
        LOGGER.log("Arrow up, arrow down, enter, escape, or tab pressed: " + event.key);
        if (!partOfActionBox && isEditing) {
          endEditing();
        }
        break;
      }
      case ARROW_LEFT: {
        getCaretPosition(event);
        LOGGER.log("Arrow-left: Caret at: " + from);
        if (from !== 0) {
          event.stopPropagation();
          LOGGER.log("dispatching from arrow-left");
          dispatcher("textUpdate", { content: text, caret: from - 1 });
        } else {
          endEditing();
        }
        break;
      }
      case ARROW_RIGHT: {
        getCaretPosition(event);
        LOGGER.log("Arrow-right: Caret at: " + from);
        if (from !== text.length) {
          event.stopPropagation();
          LOGGER.log("dispatching from arrow-right");
          dispatcher("textUpdate", { content: text, caret: from + 1 });
        } else {
          endEditing();
        }
        break;
      }
      case BACKSPACE: {
        if (!event.ctrlKey && event.altKey && !event.shiftKey) {
        } else if (!event.ctrlKey && event.altKey && event.shiftKey) {
        } else {
          getCaretPosition(event);
          LOGGER.log("Caret at: " + from);
          if (from !== 0) {
            event.stopPropagation();
          } else if (text === "" || !!text) {
            if (box.deleteWhenEmptyAndErase) {
              editor.deleteBox(box);
              event.stopPropagation();
              return;
            }
            editor.selectPreviousLeaf();
          } else {
            endEditing();
            editor.selectPreviousLeaf();
          }
        }
        break;
      }
      case DELETE: {
        if (!event.ctrlKey && !event.altKey && event.shiftKey) {
        } else {
          event.stopPropagation();
          getCaretPosition(event);
          if (to !== text.length) {
            event.stopPropagation();
          } else if (text === "" || !text) {
            if (box.deleteWhenEmptyAndErase) {
              editor.deleteBox(box);
              return;
            } else {
              endEditing();
              editor.selectNextLeaf();
            }
          }
        }
        break;
      }
      default: {
        getCaretPosition(event);
        switch (box.isCharAllowed(text, event.key, from)) {
          case CharAllowed.OK:
            LOGGER.log("CharAllowed");
            event.stopPropagation();
            if (editor.selectedBox.kind === "ActionBox") {
              const matchingOption = editor.selectedBox.getOptions(editor).find((option) => {
                if (isRegExp(option.action.trigger)) {
                  if (option.action.trigger.test(event.key)) {
                    LOGGER.log("Matching regexp" + triggerTypeToString(option.action.trigger));
                    return true;
                  }
                  return false;
                }
              });
              if (!!matchingOption) {
                let execresult = null;
                runInAction(() => {
                  runInAction(() => {
                    const command = matchingOption.action.command(box);
                    execresult = command.execute(box, event.key, editor, 0);
                  });
                  if (!!execresult) {
                    execresult();
                  }
                });
                event.preventDefault();
                event.stopPropagation();
              }
            } else {
              LOGGER.log("     is NOT an action box, but: " + editor.selectedBox.kind);
            }
            break;
          case CharAllowed.NOT_OK:
            LOGGER.log("KeyPressAction.NOT_OK");
            event.preventDefault();
            event.stopPropagation();
            break;
          case CharAllowed.GOTO_NEXT:
            LOGGER.log("KeyPressAction.GOTO_NEXT");
            if (from === 0) {
              editor.selectNextLeaf();
            } else if (to === text.length) {
              editor.selectPreviousLeaf();
            } else {
            }
            LOGGER.log("    NEXT LEAF IS " + editor.selectedBox.role);
            if (isActionTextBox(editor.selectedBox)) {
              LOGGER.log("     is an action box");
              editor.selectedBox.parent.triggerKeyPressEvent(event.key);
            } else {
              LOGGER.log("     is NOT an action box");
            }
            event.preventDefault();
            event.stopPropagation();
            break;
        }
      }
    }
  }
};
const onFocusOut = (e) => {
  LOGGER.log("onFocusOut " + id + " partof:" + partOfActionBox + " isEditing:" + isEditing);
  if (!partOfActionBox && isEditing) {
    endEditing();
  } else {
    dispatcher("onFocusOutText");
  }
};
const refresh = () => {
  LOGGER.log("REFRESH " + box?.element?.freId() + " (" + box?.element?.freLanguageConcept() + ")");
  placeholder = box.placeHolder;
  if (!isEditing) {
    text = box.getText();
  }
  boxType = box.parent instanceof ActionBox ? "action" : box.parent instanceof SelectBox ? "select" : "text";
  setInputWidth();
};
beforeUpdate(() => {
  if (editStart && !!inputElement) {
    LOGGER.log("Before update : " + id + ", " + inputElement);
    setInputWidth();
    inputElement.focus();
    editStart = false;
  }
});
afterUpdate(() => {
  if (editStart && !!inputElement) {
    LOGGER.log("    editStart in afterupdate for " + id);
    inputElement.selectionStart = from >= 0 ? from : 0;
    inputElement.selectionEnd = to >= 0 ? to : 0;
    setInputWidth();
    inputElement.focus();
    editStart = false;
  }
  if (isEditing && partOfActionBox) {
    if (text !== originalText) {
      LOGGER.log("dispatching event with text " + text + " from afterUpdate");
      dispatcher("textUpdate", { content: text, caret: from + 1 });
    }
  }
  setInputWidth();
  placeholder = box.placeHolder;
  box.setFocus = setFocus;
  box.setCaret = setCaret;
  box.refreshComponent = refresh;
});
onMount(() => {
  LOGGER.log("onMount for element " + box?.element?.freId() + " (" + box?.element?.freLanguageConcept() + ")");
  originalText = text = box.getText();
  placeholder = box.placeHolder;
  setInputWidth();
  box.setFocus = setFocus;
  box.setCaret = setCaret;
  box.refreshComponent = refresh;
});
function setInputWidth() {
  if (!!widthSpan && !!inputElement) {
    let value = inputElement.value;
    if (value !== void 0 && value !== null && value.length === 0) {
      value = placeholder;
      if (placeholder.length === 0) {
        value = " ";
      }
    }
    widthSpan.innerHTML = replaceHTML(value);
    const width = widthSpan.offsetWidth + "px";
    inputElement.style.width = width;
  } else {
  }
}
function onDragStart(event) {
  LOGGER.log("on drag start");
  event.stopPropagation();
  event.preventDefault();
}
let widthSpan;
function onInput(event) {
  setInputWidth();
}
refresh();
</script>

<!-- todo there is a double selection here: two borders are showing -->
<span on:click={onClick} id="{id}">
	{#if isEditing}
		<span class="inputtext">
			<input type="text"
                   class="inputtext"
				   id="{id}-input"
                   bind:this={inputElement}
				   on:input={onInput}
                   bind:value={text}
                   on:focusout={onFocusOut}
                   on:keydown={onKeyDown}
				   draggable="true"
				   on:dragstart={onDragStart}
                   placeholder="{placeholder}"/>
			<span class="inputttext width" bind:this={widthSpan}></span>
		</span>
	{:else}
		<!-- contenteditable must be true, otherwise there is no cursor position in the span after a click,
		     But ... this is only a problem when this component is inside a draggable element (like List or table)
		-->
		<span class="{box.role} text-box-{boxType} text"
              on:click={startEditing}
              bind:this={spanElement}
			  contenteditable=true
			  spellcheck=false
              id="{id}-span">
			{#if !!text && text.length > 0}
				{text}
			{:else}
				<span class="{placeHolderStyle}">{placeholder}</span>
			{/if}
		</span>
	{/if}
</span>

<style>
	.width {
		position: absolute;
		left: -9999px;
		display: inline-block;
		line-height: 6px;
		margin: var(--freon-text-component-margin, 1px);
		border: none;
		box-sizing: border-box;
		padding: var(--freon-text-component-padding, 1px);
		font-family: var(--freon-text-component-font-family, "Arial");
		font-size: var(--freon-text-component-font-size, 14pt);
		font-weight: var(--freon-text-component-font-weight, inherit);
		font-style: var(--freon-text-component-font-style, inherit);
	}

    .inputtext {
        /* To set the height of the input element we must use padding and line-height properties. The height property does not function! */
		color: var(--freon-text-component-color, blue);
		padding: var(--freon-text-component-padding, 1px);
        line-height: 6px;
        width: 100%;
        box-sizing: border-box;
		margin: var(--freon-text-component-margin, 1px);
        border: none;
        background: var(--freon-selected-background-color, rgba(211, 227, 253, 255));
        font-family: var(--freon-text-component-font-family, "Arial");
        font-size: var(--freon-text-component-font-size, 14pt);
        font-weight: var(--freon-text-component-font-weight, inherit);
        font-style: var(--freon-text-component-font-style, inherit);
    }

    .text {
        color: var(--freon-text-component-color, blue);
        background: var(--freon-text-component-background-color, inherit);
        font-family: var(--freon-text-component-font-family, "Arial");
        font-size: var(--freon-text-component-font-size, 14pt);
        font-weight: var(--freon-text-component-font-weight, inherit);
        font-style: var(--freon-text-component-font-style, inherit);
        padding: var(--freon-text-component-padding, 1px);
        margin: var(--freon-text-component-margin, 1px);
        white-space: normal;
        display: inline-block;
    }

	.placeholder {
		color: var(--freon-text-component-placeholder-color, blue);
		background: var(--freon-text-component-background-color, inherit);
		font-family: var(--freon-text-component-font-family, "Arial");
		font-size: var(--freon-text-component-font-size, 14pt);
		font-weight: var(--freon-text-component-font-weight, inherit);
		font-style: var(--freon-text-component-font-style, inherit);
		padding: var(--freon-text-component-padding, 1px);
		margin: var(--freon-text-component-margin, 1px);
		white-space: normal;
		display: inline-block;
	}
	.actionPlaceholder {
		color: var(--freon-text-component-actionplaceholder-color, darkgrey);
		background: var(--freon-text-component-background-color, inherit);
		font-family: var(--freon-text-component-font-family, "Arial");
		font-size: var(--freon-text-component-font-size, 14pt);
		font-weight: var(--freon-text-component-font-weight, inherit);
		font-style: var(--freon-text-component-font-style, inherit);
		padding: var(--freon-text-component-padding, 1px);
		margin: var(--freon-text-component-margin, 1px);
		white-space: normal;
		display: inline-block;
	}
</style>
