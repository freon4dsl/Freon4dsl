# Streamlining Actions in Freon
# Current situation
Right now we have MenuItem class for context menu items,
and a SelectOption interface for the item in a regular dropdown menu.
In the first a sub-menu is possible. In the second, it is not.
In the second, a description is present. This could be used when hovering over
an item (currently, it is not used in the editor). In the first, it is not.
Furthermore, the action part is completely different:
`action?: FreAction;` versus `handler: (element: FreNode, index: number, editor: FreEditor) => void`

Currently, we have a number of generic actions on lists in ListUtil, like moveListElement, cutListElement, 
copyListElement, pasteListElement, etc. These are only used in the context menu, but should be exposed for 
use in external components as well.

Currently, there are no refactorings. These should be a type of 'action', such that the language 
developer would be able to add custom refactorings.

Currently, the action mechanism is unrelated to the UndoManager.

# Ideal situation
*  A selection of native actions, like the ones on lists, should be exposed to the language developer.
There should be a simple mechanism to couple one of these to a box, for instance, to a button box, or to an external component,
for instance, a menu item.
* The language engineer should be able to add custom actions and refactorings. The same mechanism as above should be used
to couple these to boxes.
* The undo mechanism should be able to undo all of these actions, custom or native, each in a single mobx runInAction.
* When roles are used to couple actions to boxes, these roles should be clear to the language engineer.
* Actions should have multiple manners of triggering: by keyboard, or by mouse event. We do not need to take care of touch events, do we?
* Actions should have a certain type, like 'refactoring', to be able to fill a context menu in a clear manner. 
* The editor should react to all 'common' keyboard events, like ctrl-z, whatever node is currently selected.

# How to do all this
### Core-Svelte:
1. `FreonComponent` or `RenderComponent` should react to all keyboard events, except the ones that are caught by other components. 
It should determine which action to perform and direct the editor to do so. The editor will use the UndoManager for some of these, and
maybe other helper classes for others. Letting `RenderComponent` handle this should remove the "a11y-no-noninteractive-element-interactions", and
"a11y-click-events-have-key-events" warnings in `FreonComponent`.
2. `RenderComponent` should have functionality to show the context menu. This menu should be filled with the options from the shown box.
Most boxes will only have a common set of menu items/options, like copy, paste, etc. Here user-defined actions, like custom refactorings,
should be added.
3. Maybe some common functionality can be removed from `TextComponent`.
4. Drag and drop should be implemented using the common functionality from the editor. (There should be a drag handle!)

### Core:
1. `Action` should be redefined. It should merge the attributes of `MenuItem` and `Action`. There should be some 'category' attribute 
which indicates where the action is to be in a context menu.
2. Box roles for native boxes should be generated within `core` solely. The algorithm should be simple and understandable for users. This
means that a better distinction between id and role is needed.
3. `BehaviourUtil`, `ListUtil` and possibly other classes should be redesigned according to the new `Action` class/interface.
4. `FreEditor`, or a helper class, should have methods for all 'normal' actions:
   * delete
   * copy
   * paste
   * cut
   * select previous
   * select next
   * select above
   * select below
   * for references: goto definition
   * for lists: move element up and move element down
5. `FreEditor`, or a helper class, should be able to execute all custom actions.
