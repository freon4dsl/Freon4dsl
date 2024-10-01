# Expected Behaviour of a Text (Dropdown) Component

Because the TextComponent and TextDropdownComponent are very complex, this document explains
what is the expected behaviour of these two components, and how these expectations are translated into code.

## A Singular (i.e. non-drop-down) TextComponent

This component should react as follows.

Selection can be done by one of these keystrokes and events.
1. Tabbing into the component, the cursor should be either right or left of the text, depending on tab, or shift-tab.
2. Arrows (all four of them), the cursor should respond like tabbing.
3. Mouse click, the cursor should be at the position of the mouse click.
   1. Note that in Firefox this feature is not functioning!
4. Programmatically, e.g. from error pane, the cursor should be at the left of the text.

When selected, the component should react to the following keystrokes and events.
1. Backspace, delete, add character should act 'normal'.
   1. When the text is empty, and the box has 'deleteWhenEmpty' set to true, and the user types Backspace or Delete,
      the node of the box should be removed. For instance, when it is part of an optional box, but also in other cases.
   2. When the cursor is at the end or start of the text, and the added character is not allowed (see box.isCharAllowed), 
      it should be pushed to the next or previous box.
   2. When the cursor is on the start of the text, then on Backspace nothing happens. The user needs to use arrow left or 
      Shift TAB to move to previous field.
   3. When the cursor is on the end of the text, then on Delete nothing happens. The user needs to use arrow right or 
      TAB to move to next field.
4. Mouse click: the user should be able to add a character, backspace, delete at the clicked position.
    1. Note that in Firefox this feature is not functioning!
5. Mouse drag: the text between start and end should be selected, and the component should thereafter react using this 
   selection to adding a character, backspace, delete, or to cut, paste, etc.
6. Ctrl-arrow left or right should go to the end or start of the text.
7. Ctrl-shift-arrow left or right should select part of the text.

Deselection can be done by:
1. Arrow up or down
   1. The current text should be saved.
   2. The component above or below should be selected.
2. Arrow left or right, if the 'end' of the text is reached
   1. The current text should be saved.
   2. The component previous or next should be selected.
3. Tab, shift-tab
   1. The current text should be saved.
   2. The next or previous editable component should be selected.
4. Mouse click elsewhere
   1. The current text should be saved.
   2. The component that is clicked should be selected.

# As Part of a TextDropdownComponent

The whole of the combination of TextComponent, TextDropdownComponent, and DropDownComponent should act as follows. (Text 
that is not bold is behaviour that is equal to a singular text component)

Selection can be done by one of these keystrokes and events.
1. Tabbing into the component, the cursor should be either right or left of the text, depending on tab, or shift-tab.
   1. **The dropdown should not be shown, until the user enters a key**
2. Arrows (all four of them), the cursor should respond like tabbing.
   1. **The dropdown should not be shown, until the user enters a key**
3. Mouse click, the cursor should be at the position of the mouse click.
   1. **The dropdown should be shown, and filtered based on position of mouse click**
   2. Note that in Firefox this feature is not functioning!
4. Programmatically, e.g. from error pane, the cursor should be at the left of the text.
   1. **The dropdown should not be shown**

When selected, the component should react to the following keystrokes and events.
1. **Enter: when the dropdown not shown, it should be made visible. When the dropdown is shown: use the selected option in 
the dropdown to set the value in the model**
2. Backspace, delete, add character should act 'normal'.
   1. **When the dropdown is not shown, it should show.**
   2. **Only when the component shows an action box: when the text matches a regular expression, the action should be executed.**
   3. When the text is empty, and the box has 'deleteWhenEmpty' set to true, and the user types Backspace or Delete,
      the node of the box should be removed. For instance, when it is part of an optional box, but also in other cases.
   4. When the cursor is at the end or start of the text, and the added character is not allowed (see box.isCharAllowed),
      it should be pushed to the next or previous box.
   5. When the cursor is on the start of the text, then on Backspace nothing happens. The user needs to use arrow left or
      Shift TAB to move to previous field.
   6. When the cursor is on the end of the text, then on Delete nothing happens. The user needs to use arrow right or
      TAB to move to next field.
3. Mouse click: the user should be able to add a character, backspace, delete at the clicked position.
   1. Note that in Firefox this feature is not functioning!
5. Mouse drag: the text between start and end should be selected, and the component should thereafter react using this
   selection to adding a character, backspace, delete, or to cut, paste, etc.
6. **Arrow up and down are used to select an option in the dropdown, but only when it is already shown. Otherwise, the 
keys should react as in a singular text component.**
7. **Escape: the dropdown is no longer visible**

**In all cases the dropdown should be filtered to include options that fit the text. The match should be against the 
start of the text until start of the cursor position, or in case of a mouse drag, the start of the selected text.**

Deselection can be done by:
1. Arrow up or down, **but only when the dropdown is not visible**
   1. The current text should be saved.
   2. The component above or below should be selected.
2. Arrow left or right
   1. The current text should be saved.
   2. The component previous or next should be selected.
3. Tab, shift-tab
   1. The current text should be saved.
   2. The next or previous editable component should be selected.
4. Mouse click elsewhere
   1. The current text should be saved.
   2. The component that is clicked should be selected.

**In all cases the dropdown should be hidden. When this is an action box, the text should be emptied. In case of a 
select box, the current text should be saved, but not if it is incorrect.****

## Translation into code

As all events/keystrokes are entered through the TextComponent, this component should react to each event/keystroke as follows.
Note that in all of this 'end editing' means that the text component switches from showing an input field to showing a span. 
Likewise, 'start editing' means the switch from span to input field.

1. When the component gets selected through one of the editor.selectXX() methods, e.g. after Tab or Shift-tab or one of the arrow keys, or from the Error pane.
   1. When not part of dropdown
      3. Start editing.
      4. Set the cursor either right or left of the text, based on what the editor demands.
   3. When part of dropdown
      4. Start editing.
      5. Set the cursor either right or left of the text, based on what the editor demands.
      6. Do not show the dropdown until the user enters a key within the component.

1. Tab, shift-tab
   1. When editing, and not part of dropdown
      2. End editing.
      3. Save the current text.
      4. Select the next or previous editable component. 
   3. When editing, and part of dropdown
      2. End editing.
      1. Hide the dropdown. 
      2. When this is an action box
         3. Empty the text, both in the box and the component. 
      3. When this is a select box
         4. If current text is valid selection, execute select(), otherwise set back to previous text.
      4. Select the next or previous editable component.

2. Arrow up or down
   1. When editing, and not part of dropdown
      2. End editing.
      3. Save the current text.
      2. Select the component above or below.
   6. When editing, and part of dropdown
      7. If dropdown is shown, 
         8. Select an option in the dropdown.
      6. If dropdown is not shown, 
         2. End editing.
         2. When this is an action box
            3. Empty the text, both in the box and the component.
         3. When this is a select box
            4. If current text is valid selection, execute select(), otherwise set back to previous text.
         4. Select the next or previous editable component.

2. Arrow left or right
   3. When editing, and not part of dropdown,
      1. When the 'end' of the text not is reached, 
         4. Change cursor position
      1. When the 'end' of the text is reached,
         2. End editing.
         3. Save the current text.
         3. Select the previous or next component.  
   1. When editing, and part of dropdown, 
      2. When dropdown is not shown
         3. When the 'end' of the text not is reached,
            2. Show dropdown
            3. Filter the dropdown.
         6. When the 'end' of the text is reached
            2. End editing.
            2. When this is an action box
               3. Empty the text, both in the box and the component.
            3. When this is a select box
               4. If current text is valid selection, execute select(), otherwise set back to previous text.
            4. Select the next or previous editable component.
      2. When dropdown is shown, 
         3. When the 'end' of the text not is reached, 
            2. Filter the dropdown.
         6. When the 'end' of the text is reached, 
            6. End editing.
            7. Hide the dropdown. 
            2. When this is an action box
               3. Empty the text, both in the box and the component.
            3. When this is a select box
               4. If current text is valid selection, execute select(), otherwise set back to previous text.
            3. Select the previous or next component.

1. Backspace
   1. When editing, and not part of dropdown 
      2. When the text is empty, and the box has 'deleteWhenEmpty' set to true
         1. Remove the node of the box.
         2. Next selection???
      3. When the cursor is on the start of the text 
         3. Do nothing. The user needs to use arrow left or Shift TAB to move to previous field.
      2. When the cursor is not on the start of the text,
         3. Delete the character before the cursor. Let browser handle this.
   4. When editing, and part of dropdown 
      2. When the text is empty, and the box has 'deleteWhenEmpty' set to true
         1. Remove the node of the box.
         2. Next selection???
         3. Hide dropdown
      3. When the cursor is on the start of the text
         3. Do nothing. The user needs to use arrow left or Shift TAB to move to previous field.
      3. When the cursor is not on the start of the text,
         3. Delete the character before the cursor. Let browser handle this.
         5. When the dropdown is not shown
            5. Show dropdown. 
            6. Filter the dropdown to include options that fit the text. The match
               should be from the start of the text until the start of the cursor position.
         5. When the dropdown is shown 
            5. Filter the dropdown to include options that fit the text. The match
               should be from the start of the text until the start of the cursor position.
   
2. Delete
   1. When editing, and not part of dropdown 
      2. When the text is empty, and the box has 'deleteWhenEmpty' set to true, 
         1. Remove the node of the box.
         2. Next selection???
      4. When the cursor is on the end of the text
         3. Do nothing. The user needs to use arrow right or TAB to move to previous field.
      4. In other cases
         3. Delete the character after the cursor. Let browser handle this.
   5. When editing, and part of dropdown 
      2. When the text is empty, and the box has 'deleteWhenEmpty' set to true
         1. Remove the node of the box.
         2. Next selection???
         3. Hide dropdown      
      4. When the cursor is on the end of the text
         3. Do nothing. The user needs to use arrow right or TAB to move to previous field.
      3. When the cursor is not on the end of the text,
         3. Delete the character after the cursor. Let browser handle this.
         5. When the dropdown is not shown
            5. Show dropdown.
            6. Filter the dropdown to include options that fit the text. The match
               should be from the start of the text until the start of the cursor position.
         5. When the dropdown is shown
            5. Filter the dropdown to include options that fit the text. The match
               should be from the start of the text until the start of the cursor position.
   
4. Add character
   2. When editing, and not part of dropdown, 
      3. When the cursor is not at the end or start of the text, 
         3. Add the character to the text in the component, but do not set it in the model.
      3. When the cursor is at the end or start of the text, and the added character is allowed (see box.isCharAllowed)
         3. Add the character to the text in the component, but do not set it in the model.
      3. When the cursor is at the end or start of the text, and the added character is not allowed (see box.isCharAllowed)
         1. Push the char to the next or previous box.   
   3. When editing, and part of dropdown, 
      4. When the dropdown is not shown
         3. When the cursor is not at the end or start of the text,
            3. Add the character to the text in the component, but do not set it in the model.
         3. When the cursor is at the end or start of the text, disregard the 'is allowed' of the character (see box.isCharAllowed)
            3. Add the character to the text in the component, but do not set it in the model.
         5. Show dropdown.
         6. Filter the dropdown to include options that fit the text. The match
           should be from the start of the text until the start of the cursor position.
      5. When the dropdown is shown
         3. When the cursor is not at the end or start of the text,
            3. Add the character to the text in the component, but do not set it in the model.
         3. When the cursor is at the end or start of the text, disregard the 'is allowed' of the character (see box.isCharAllowed)
            3. Add the character to the text in the component, but do not set it in the model.
         6. Filter the dropdown to include options that fit the text. The match
            should be from the start of the text until the start of the cursor position.
      5. When the new text (the complete text in the field) fully matches the one remaining option in the dropdown (after filtering)
         6. End editing.
         7. Hide the dropdown.
         2. When this is an action box
            3. Execute the action
            3. Empty the text, both in the box and the component.
            4. Select the component indicated by the action.
         3. When this is a select box
            4. Execute the select.
            3. Select the previous or next component.
      7. When this is an action box, and not When the new text (the complete text in the field) fully matches the one remaining option in the dropdown
         8. When the text matches a regular expression
         6. End editing.
         7. Hide the dropdown.
         4. Execute the action
         5. Empty the text, both in the box and the component.
         3. Select the component indicated by the action as next, and set the next cursor position as indicated by the action.

4. Mouse click in the component,
   4. When not editing, and not part of dropdown
      5. Start editing.
      6. Set the cursor at the position of the mouse click.
      3. Remember the clicked position and let the user add a character, backspace, delete at the clicked position.
   1. When editing, and not part of dropdown
      6. Set the cursor at the position of the mouse click.
      3. Remember the clicked position and let the user add a character, backspace, delete at the clicked position.
   5. When not editing, and part of dropdown, 
      5. Start editing.
      6. Set the cursor at the position of the mouse click.
      3. Remember the clicked position and let the user add a character, backspace, delete at the clicked position.
      5. Show dropdown.
      6. Filter the dropdown to include options that fit the text. The match
         should be from the start of the text until the clicked position.
         1. Note that in Firefox this feature is not functioning!
   4. When editing, and part of dropdown, and the dropdown is shown, 
      6. Set the cursor at the position of the mouse click.
      3. Remember the clicked position and let the user add a character, backspace, delete at the clicked position.
      5. Filter the dropdown to include options that fit the text. The match
         should be from the start of the text until the clicked position.
   4. When editing, and part of dropdown, and the dropdown not is shown,
      6. Set the cursor at the position of the mouse click.
      3. Remember the clicked position and let the user add a character, backspace, delete at the clicked position.
      5. Show dropdown.
      6. Filter the dropdown to include options that fit the text. The match
         should be from the start of the text until the clicked position.
         1. Note that in Firefox this feature is not functioning!
      
5. Mouse click elsewhere
   1. When editing, and not part of dropdown,
      6. End editing.
      7. Save the current text.
      8. Select the component that is clicked.
   3. When editing, and part of dropdown, 
      6. End editing.
      7. Hide the dropdown.
      2. When this is an action box
         3. Empty the text, both in the box and the component.
      3. When this is a select box
         4. if the text is a match with a select option, execute the select
      3. Select the component that is clicked.

9. Mouse drag 
   6. When editing, and not part of dropdown, 
      7. Select the text between start and end of the drag, and the component should thereafter react using this
         selection to adding a character, backspace, delete, or to cut, paste, etc.
   4. When editing, and part of dropdown, 
      1. Select the text between start and end of the drag, and the component should thereafter react using this
         selection to adding a character, backspace, delete, or to cut, paste, etc.
         5. When the dropdown is shown, do not change options.
   
1. Enter
   2. When editing, and not part of dropdown,
      3. End editing
      4. Select the next component
   2. When editing and part of dropdown, 
      3. When the dropdown not shown 
         4. Show dropdown. 
         5. Filter the dropdown to include options that fit the text. The match
            should be against the start of the cursor position, or in case of a mouse drag, the end of the selected text.
      4. When the dropdown is shown: 
         6. End editing.
         7. Hide the dropdown.
         2. When this is an action box
            3. Execute the action, use the selected option in the dropdown, never mind the text.
            3. Empty the text, both in the box and the component.
         3. When this is a select box
            3. Execute the select, use the selected option in the dropdown, never mind the text.
         3. Select the next component.

7. Escape
   8. When editing, and part of dropdown, and dropdown is shown 
      9. Hide dropdown.  
   2. otherwise, do nothing.
