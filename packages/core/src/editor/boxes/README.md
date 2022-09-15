# The Box Model

Notes on how a box model is constructed. 

The following boxes have a model element by indirection. The distinction 
between the id of such a box and the id of the box that holds the actual model element
is purely in its role.

1. AbstractChoiceBox.inner: TextBox (ActionBox and SelectBox inherit)
2. GridBox.cells: GridCellBox[]
3. GridCellBox.content: Box
4. IndentBox.content: Box
5. Listbox.children: Box[]
6. OptionalBox.content: Box, 
   OptionalBox.placeholder: ActionBox
