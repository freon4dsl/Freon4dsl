# Order of events

When clicking on Textcomponent that is not editing:

    "TextComponent startEditing"

    "TextComponent afterUpdate true"

    "TextComponent onClick while Editing"

    "AliasComponent onClick"

# How a TextDropdownComponent should work

The internal selection must always be on the text field.
The text field dispatches the following events to the alias component:
 1. text changes on user input
    1. TextDropdown filters options based on (complete???) text
 2. arrow keys up and down 
    1. TextDropdown selects another option in the dropdown (opens dropdown first??)
 3. arrow keys left and right
    1. TextDropdown filters options based on text before the caret (or complete text???) if dropdown is open
 4. key to open the drop down (or is it always open?)
 5. Enter key: if dropdown is open, then the selected option replaces the text in the text field, else the text in the textfield is stored and editing is stopped.
 6. Escape: ignore all changes or only close the dropdown?
 7. Tab, alt-tab, click outside: end editing



