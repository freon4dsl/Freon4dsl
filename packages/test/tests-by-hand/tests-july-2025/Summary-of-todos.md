# Issues found during testing july 2025

## Test web pages in core-svelte

### CW1

The context menu is not correctly placed.

### CW2
The button component in Basic test is completely black, as is the inner switch component. 
The BooleanSwitchComponent on the other hand misses the container color.

### CW3
The font size of the text component changes when it is selected.

### CW4
In Drag and drop tests, the elements in the tables don't have drag handles and can't be dragged.


## Editor Web Actions

### EW1
After _Undo_ or _Redo_ from the menu, the cursor and therefore the HTML focus is **not** in the editor.
That is probably why _Ctrl-z_ and _Ctrl-y_ don't work. They do work if I put the cursor in the editor using a mouse-click

### EW2
Ctrl-v does not function. Ctrl-c does not function. _Ctrl-z_ and _Ctrl-y_ both work in (Edge browser, MacOs) according to 
april test, but not in (Chrome, Windows).

### EW3
Using Delete in TextComponent does not remove the component when its empty, Backspace does.

### EW4
When pasting while first element of gradeA is selected, the cursor moves to the second element, the '==' sign.

### EW5
In test Scenario 5 text changes in `pie1`, but the cursor and focus remains in `pie2`. Undo and redo work properly,
but the selection is not set correctly.


## Remaining Issues from CRCHub

### CH1
Do all relevant divs and spans have a corresponding css-class that can be set from the outside?

### CH2
Can the indent component not add a new span, but indent it child using css?

### CH3
Is the way Graham uses `initialize` and `singularity` the right way to stop the effects from looping? 


## Other Remaining Issues

### OR1
In the example external components to be used with Flowbite, change the use of SMUI in favor of Flowbite.

### OR2
Remove one of OptionalBox and OptionalBox2.

### OR3
Redo the save mechanism now that a rename is able to make changes in many units.

### OR4
For CI only: silence the error message in core.

### OR5
Create more developer documentation.

### OR6
Check whether the isValidName method that is generated, is correct with regard to 
the new rules for identifiers.

### OR7
The 2 columns in the table in Edu-Test/StartFlow are not on the same line.

### OR8
After changing the views/projections, there is no selection on the page.

### OR9
After a text search is done the search field is still the selected color. 
When removing the text in the field the freon color comes back. 

## On documentation project

### DP1
Get the documentation project back in working order => build new demo. Use the 
main/doc-demo branch to see if creating the demo can be easier.

### DP2
Check out _Jupiter Notebook_ for creating working examples.

## On create freon languages

### CL1
Adapt to new syntax and adapt to flowbite webapp.

