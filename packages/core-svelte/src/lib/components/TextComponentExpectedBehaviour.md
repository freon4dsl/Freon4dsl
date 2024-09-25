# Expected Behaviour of a Text (Dropdown) Component

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

Deselection can be done by:
1. Arrow up or down
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

**In all cases the dropdown should be filtered to include options that fit the text. The match 
should be against the start until the cursor position, or in case of a mouse drag, the end of the selected text.**

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
select box, the current text should be saved, even if it is incorrect.****
