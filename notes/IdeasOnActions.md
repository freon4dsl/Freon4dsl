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
for instance, a button group.
* The language engineer should be able to add custom actions and refactorings. The same mechanism as above should be used
to couple these to boxes.
* The undo mechanism should be able to undo all of these actions, custom or native, in a single mobx runInAction.
* When roles are used to couple actions to boxes, these roles should be clear to the language engineer.
* Actions should have multiple manners of triggering: by keyboard, by selecting from a menu, by pushing a button, ...
* Actions should have a certain type, like 'refactoring', to be able to fill a menu in a clear manner. 
