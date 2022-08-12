# The components in core-svelte

## Overall behaviour of the editor
A component loses focus by:
   1. click outside (focus goes to the clicked component)
   2. tab (focus goes to next editable component)
   3. shift tab (focus goes to previous editable component)
   4. arrow up and down (focus goes to the editable component that is visible above/below)
   5. the arrow left and right keys, when the end of the text is reached (focus goes to previous/next
      editable component)
   6. ctrl up (focus goes to parent component, note that this might be a non-editable structure)
   7. ctrl down (focus goes to first child component, note that this might be a non-editable structure)
   8. ctrl left (focus goes to previous sibling component, if present, else warning, 
   note that this might be a non-editable structure)
   9. ctrl right (focus goes to next sibling component, if present, else warning,
   note that this might be a non-editable structure)

Right-click on any component shows a context menu with the actions that are possible for that component. 
Some actions might also be associated with a single key-event or with a string trigger.

## RenderComponent
Shows any box picking the component to use based on the type of box.

## ProjectItComponent
Used to start the editor. It shows the rootBox in the editor using RenderComponent.

## EmptyLineComponent
The most simple component. It shows an empty line, which cannot be selected.

## LabelComponent
Another simple component. It shows a piece of text that is unchangeable by the user. 
It is never selectable/focusable, either by clicking or through the keyboard.

## IndentComponent
Indents its child component with a certain margin. It is never selectable/focusable, either 
by clicking or through the keyboard.

## SvgComponent
Shows an SVG image. It is never selectable/focusable, either
by clicking or through the keyboard.

## TextComponent
Shows a text that is changable by the user. It has the following behaviour.
1. When the text is empty or not present, the placeholder from the box, which may or not be an 
empty string, is shown. When the placeholder is an empty string there is a non-visible component
on the screen where the user may enter some text (used for e.g. expressions).
3. When the component is selected by click or tab, the text becomes editable and the component 
   is resizeable.
4. When editable, the behaviour is as follows.
   1. when a character is entered, it is checked whether this char is allowed in the corresponding box. 
   If not, the character and caret position are given to the editor/box to deal with. (How should 
   they deal with it???)
   2. the arrow left and right keys function within the text, until the end of the text is reached, then 
   the text becomes un-editable and the selection goes to another component.
   3. the arrow up and down keys function make the text un-editable, the selection goes to another component.
   4. the return, tab, and escape keys make the text un-editable.
   5. the backspace and delete keys, like the arrow keys, function as expected within the text, until 
      the end of the text is reached, then the text becomes un-editable and the selection goes to 
      another component.
5. Every time the text goes from editable to un-editable, the text is stored in the corresponding box.

## TextDropdownComponent
Combines a textComponent with a dropdown menu. Does the same as a TextComponent, except that ...
1. The arrow up and down keys select another option in the dropdown. The Enter key then selects the option.
2. When the component is selected by click, the dropdown is shown, but when the component is 
selected by keyboard, the dropdown is not shown, until the user enters a character. (TODO test this when the boxes are used.)
3. The component never allows entering text that is not in the dropdown options list. This text is ignored.
4. When the chosen option equals a string trigger for a registered keyPressAction, this action is executed.

## ListComponent
Shows a 'true' list, that is a list from the model. It has the following behaviour.
1. There is a placeholder item at the end of the list where the user can add a new element. This placeholder
becomes a Dropdown component when the type of the elements in the list has subclasses. Then any of the 
concrete subclasses can be chosen.
2. The user can move an element up or down in the list either using drag and drop.
3. The user can add a new element anywhere in the list using the context menu.
Note that the whole list can also be selectable, e.g. when the user wants to delete it completely.

## GridComponent
Shows a 'true' list, that is a list from the model, in a table format. It has the following behaviour.
1. There is a placeholder item at the end of the table where the user can add a new element by selecting 
it and using the Enter key.
2. The user can select a complete line/column (e.g. by using ctrl-up) and move it up or down in the 
list either using shift-left or shift-down, or a context menu.
3. The user can select a complete line/column and add a new element anywhere in the table using
   the context menu.
Note that the whole table can also be selectable, e.g. when the user wants to delete it completely.

## LayoutComponent
Shows a list of boxes, either horizontally or vertically. The boxes can be of any kind. No behaviour,
because the user cannot change anything in the layout.
It may be selectable through ctrl-up or down, etc.

## OptionalComponent
Shows an optional model element.
1. When the element is not present, it depends on the box-condition whether the placeholder is a 
'non-visible' or a visible TextDropdown component.
2. The placeholder is always a TextDropdown component, where all options are couple to actiosn that 
create a certain element. No non-option entry is allowed.

Is this really a separate component???? Why??? It could be a TextDropdown.
