# Expected behaviour of a text (drop down) component

## A singular (non-drop-down) text component

This component should react as follows.

Selection can be done by:
1. tabbing into the component, the cursor should be either right or left of the text, depending on tab, or shift-tab.
2. arrows (all four of them), the cursor should respond like tabbing
3. mouse click, the cursor should be at the position of the mouse click
4. programmatically, e.g. from error pane, the cursor should be at the left of the text

When selected:
1. backspace, delete, add character should act 'normal'.
   1. when all chars are removed, and the component has 'deleteWhenEmpty' set to true, the component/box/node should be removed. 
   For instance, when it is part of an optional box. (Anneke: only when it is part of Optional?)
2. mouse click: the user should be able to add a character, backspace, delete at the clicked position
3. mouse drag: the text between start and end should be selected and react to character, backspace, delete, or to cut, paste, etc.

Deselection can be done by:
1. escape
2. arrow up or down
3. tab, shift-tab
4. mouse click elsewhere

# As part of a text drop down component

The whole of the combination of TextComponent, TextDropdownComponent, and DropDownComponent should act as follows. (Text 
that is not bold is behaviour that is equal to a singular text component)

Selection can be done by:
1. tabbing into the component, the cursor should be either right or left of the text, depending on tab, or shift-tab.
   1. **dropdown should not be shown, until the user enters a key**
2. arrows (all four of them), the cursor and drop down should respond like tabbing
3. mouse click, the cursor should be at the position of the mouse click
   1. **dropdown should be shown**
4. programmatically, e.g. from error pane, the cursor should be at the left of the text
   1. **dropdown should be shown ???**

When selected:
1. backspace, delete, add character should act 'normal'.
   1. **when drop down is not shown, it should show**
   2. when all chars are removed, and the component has 'deleteWhenEmpty' set to true, the component/box/node should be removed.
       For instance, when it is part of an optional box. (Anneke: only when it is part of Optional?)
2. mouse click: the user should be able to add a character, backspace, delete at the clicked position
3. mouse drag: the text between start and end should be selected and react to character, backspace, delete, or to cut, paste, etc.

**When the component shows an action box:**
1. when a char is added that does not fit the box type, the action should be executed
2. when the text matched a regular expression, the action should be executed
3. more ???

**In all cases the dropdown should be filtered to include options that fit the text.**

Deselection can be done by:
1. escape
2. arrow up or down
3. tab, shift-tab
4. mouse click elsewhere
**In all cases the dropdown should be hidden.**
