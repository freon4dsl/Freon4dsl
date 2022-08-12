<script>
    // This component is a combination of a TextComponent and a DropdownComponent.
    // The TextComponent is shown in non-editable state until it gets focus,
    // then the Dropdown also appears. When the text in the TextComponent alters,
    // the options in the dropdown are filtered based on the text and the caret position
    // within the text.
    import { onMount } from "svelte";
    import TextComponent from "./TextComponent.svelte";
    import DropdownComponent from "./DropdownComponent.svelte";

    let textComponent;
    let dropdownComponent;
    let id = "alias-test" ;
    let isEditing = false; // becomes true when the text field gets focus
    let text = '';					// the text in the text field
    let selectedId;					// the id of the selected option in the dropdown
    let options;
    let all_options;

    const KEY_BACKSPACE = "Backspace";
    const KEY_TAB = "Tab";
    const KEY_ENTER = "Enter";
    const KEY_SHIFT = "Shift";
    const KEY_CONTROL = "Control";
    const KEY_ALT = "Alt";
    const KEY_ESCAPE = "Escape";
    const KEY_SPACEBAR = " ";
    const KEY_ARROW_LEFT = "ArrowLeft";
    const KEY_ARROW_UP = "ArrowUp";
    const KEY_ARROW_RIGHT = "ArrowRight";
    const KEY_ARROW_DOWN = "ArrowDown";
    const KEY_DELETE = "Delete";
    const KEY_INSERT = "Insert";

    onMount(() => {
        console.log('TextDropdownComponent onMount');
        getOptions();
    });

    export let getOptions; //: () => [];

    const textUpdate = (event) => {
        text = event.detail.content;
        // TODO filter options
        all_options = getOptions();
        options = all_options.filter(o => o.label.startsWith(text.substring(0, event.detail.caret)));
//         console.log('setting text to: '+ text + ", caret: " + event.detail.caret);
    }

    const onKeyDown = (event) => { // redirect the arrow keys to the dropdown
        console.log("TextDropdownComponent onKeyDown: [" + event.key + "] alt [" + event.altKey + "] shift [" + event.shiftKey + "] ctrl [" + event.ctrlKey + "] meta [" + event.metaKey + "]" + ', selectedId: ' + selectedId);
        switch(event.key) {
            case KEY_ARROW_DOWN: {
                if (!selectedId || selectedId.length == 0) {
                    selectedId = options[0].id;
                } else {
                    const index = options.findIndex(o => o.id === selectedId);
                    if (index + 1 < options.length) {
                        selectedId = options[index + 1].id;
                    } else if (index + 1 === options.length) {
                        selectedId = options[0].id;
                    }
                }

                break;
            }
            case KEY_ARROW_UP: {
                if (!selectedId || selectedId.length == 0) {
                    selectedId = options[options.length - 1].id;
                } else {
                    const index = options.findIndex(o => o.id === selectedId);
                    if (index > 0) {
                        selectedId = options[index - 1].id;
                    } else if (index === 0) {
                        selectedId = options[options.length - 1].id;
                    }
                }
                break;
            }
            case KEY_ENTER: {
                if (options.length === 1) {
                    text = options[0].label;
                } else {
                    const index = options.findIndex(o => o.id === selectedId);
                    if (index >= 0 && index < options.length) {
                        text = options[index].label;
                    }
                }
                isEditing = false;
                break;
            }
        }
    }

    const itemSelected = ()=> {
        const index = options.findIndex(o => o.id === selectedId);
        if (index >= 0 && index < options.length) {
            text = options[index].label;
        }
        isEditing = false;
    }
</script>

<span id="{id}" on:keydown={onKeyDown}>
    <TextComponent
            bind:isEditing={isEditing}
            bind:this={textComponent}
            bind:text={text}
            partOfAlias={true}
            on:textUpdate={textUpdate}
    />
    {#if isEditing}
        <DropdownComponent
                bind:this={dropdownComponent}
                bind:selectedId={selectedId}
                bind:options={options}
                on:piItemSelected={itemSelected}/>
    {/if}
</span>
<br>
<p>

</p>
<br>
<p>

</p>
<br>
<p>

</p>
<br>
<p>

</p>
<div>dropdown selection: '{selectedId}'</div>
<div>text in input field: '{text}'</div>

