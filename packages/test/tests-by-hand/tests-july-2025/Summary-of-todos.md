# Issues found during testing july 2025

## Test web pages in core-svelte

### CW1
The context menu is not correctly placed.
**FIXED**

### CW2
The button component in Basic test is completely black, as is the inner switch component. 
The BooleanSwitchComponent on the other hand misses the container color.
**FIXED**

### CW3
The font size of the text component changes when it is selected.
**FIXED** Is not an issue anymore, already solved.

## Editor Web Actions

### EW1
After _Undo_ or _Redo_ from the menu, the cursor and therefore the HTML focus is **not** in the editor.
That is probably why _Ctrl-z_ and _Ctrl-y_ don't work. They do work if I put the cursor in the editor using a mouse-click
**FIXED**

### EW2
Ctrl-v does not function. Ctrl-c does not function. _Ctrl-z_ and _Ctrl-y_ both work in (Edge browser, MacOs) according to 
april test, but not in (Chrome, Windows).

### EW3
Using Delete in TextComponent does not remove the component when its empty, Backspace does.

### EW4
When pasting while first element of gradeA is selected, the cursor moves to the second element, the '==' sign.
**PROBABLY FIXED**

### EW5
In test Scenario 5 text changes in `pie1`, but the cursor and focus remains in `pie2`. Undo and redo work properly,
but the selection is not set correctly.
**PROBABLY FIXED**

### EW6
When there is no open model, the user can still create a new unit, which fails with an exception.
**FIXED**

## Core Editor Actions

### CE1
When opening _Fractions101_, although the field _Fractions_ is highlighted, you cannot use the TAB to change selection.
Once you select an element with the mouse, tabbing and arrows work fine.
**FIXED**

### CE2
Deleting a list element: transition is slow and not pretty.

### CE3
After deleting the denominator of a Fraction, what behaviour do we expect from the delete button? (Scenario 7)

### CE4
Upon ENTER a new list element is NOT added in the table after _gradeA_ (WHAT BEHAVIOUR DO WE EXPECT?!!!, Scenario 8).

### CE5
The DELETE key does not remove anything anymore, sometime backspace does, but not in a table. This means that 
table rows can only be deleted by using the context menu.

## Remaining Issues from CRCHub

### CH1
Do all relevant divs and spans have a corresponding css-class that can be set from the outside?

### CH2
Can the indent component not add a new span, but indent it child using css?

### CH3
Is the way Graham uses `initialize` and `singularity` the right way to stop the effects from looping? 
**ANNEKE**

## Other Remaining Issues

### OR1
In the example external components to be used with Flowbite, change the use of SMUI in favor of Flowbite.

### OR2
Remove one of OptionalBox and OptionalBox2.

### OR3
Redo the save mechanism now that a rename is able to make changes in many units.
**IMPORTANT**

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

### OR10
Add version to language definition, and use it while reading/writing models for migration scenario.
**FIXED**

### OR11
The save current model unit ih the flowbite app is too far away, you need to open thye model/unis pane,
then goto the current unit, open the menu and select Save.
We might want to add a save button at the top toolbar.
**FIXED**

### OR12
Remove or comment out console.logs in core and core-svelte (a.o. CommonFunctions,
ListUtil, TableCellComponent, InMemoryModel).

### OR13
When something goes wrong in server communication the user should get a readable error message.
**JOS / ANNEKE**

### OR14
Svelte Layout Component crashed with duplicate key error.
**FIXED**

### OR15
When unparsing Edu-test/Fractions101 the expressions do not have brackets. So when importing that file
there are validation errors.

### OR16
The parser is unable to parse Edu-test/TestB on import.

### OR17
When a row of a table is selected, the arrow keys do not function to alter the selection.

### OR18
When tabbing reaches the end of the document, it continues on other parts of the browser. It should go back to the top.
Arrow keys do not leave the document.

## On documentation project

### DP1
Get the documentation project back in working order => build new demo. Use the 
main/doc-demo branch to see if creating the demo can be easier.

### DP2
Check out _Jupiter Notebook_ for creating working examples.

## On create freon languages

### CL1
Adapt to new syntax and adapt to flowbite webapp.

