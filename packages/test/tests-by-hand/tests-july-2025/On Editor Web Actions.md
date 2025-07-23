# Test Scenarios Editor Actions

These scenarios test the functionality available through the webapp, like cut/copy, paste, validate, search.
At the start of these scenarios, a model unit is available in the editor.

## Cut, Copy, Paste

### Scenario 1: correct placement of pasted element

|      | Action                                                                       | Expected result                             |
|:-----|:-----------------------------------------------------------------------------|:--------------------------------------------|
|      | Open language Education, model Edu-test, unit Fractions101                   | Freon is opened, Fractions101 unit is shown |
|      | Select first question (_pie_) from _Theory101_ completely, choose _Cut_      | The question is removed                     |
|      | Select first question from _Practice1_ (_lollipops1_), choose _Paste_ button | The question appears below (_lollipops1_)   |
| ERR1 | Select placeholder for questions from _Practice1_, type _Ctlr-v_             | The question appears above the placeholder  |
|      | Select a line of content from _Theory101_, type _Ctlr-c_                     | Message: text is copied to clipboard        |
| ERR2 | Select <content> placeholder from _Example1_, choose _Paste_ button          | The text appears above the placeholder      |
|      | Select Score>GradeA from _Theory101_, type _Ctlr-x_                          | The Grade disappears                        |
|      | Select Score>GradeA from _Practice1_, choose _Paste_ button                  | The Grade appears above the placeholder     |
| DONE |                                                                              |                                             |

ERR1: Ctrl-v does not function
ERR2: Ctrl-c does not function
ERR*: using Delete in TextComponent does not remove the component when its empty, Backspace does

### Scenario 2: incorrect placement of pasted element

|      | Action                                                                    | Expected result                             |
|:-----|:--------------------------------------------------------------------------|:--------------------------------------------|
|      | Open language Education, model Edu-test, unit Fractions101                | Freon is opened, Fractions101 unit is shown |
|      | Select first question (_pie_) from _Theory101_ completely, choose _Cut_   | The question is removed                     |
|      | Select Score>GradeA from _Theory101_, choose _Paste_                      | Message: cannot paste a Question here       |
|      | Select a line of content from _Theory101_, choose _Paste_                 | Message: cannot paste a Question here       |
|      | Select first question (_pie2_) from _Theory101_ completely, choose _Copy_ | The question is copied, no external changes |
|      | Select Score>GradeA from _Theory101_, choose _Paste_                      | Message: cannot paste a Question here       |
|      | Select a line of content from _Theory101_, choose _Paste_                 | Message: cannot paste a Question here       |
|      | Repeat this type of behavior for whatever element you like                | ...                                         |
| DONE |                                                                           |                                             |

ERR: when pasting in gradeA the cursor moves to the '==' sign

## Undo, Redo

### Scenario 3: undo, redo adding an element

|      | Action                                                                   | Expected result                                   |
|:-----|:-------------------------------------------------------------------------|:--------------------------------------------------|
|      | Open language Education, model Edu-test, unit Fractions101               | Freon is opened, Fractions101 unit is shown       |
|      | Select <content> placeholder from _Theory101_, add a Line with some text | The text appears above the placeholder            |
|      | Select _Undo_                                                            | The Line disappears                               |
|      | Select _Redo_                                                            | The Line appears again  :b:                       |
| ERR  | Type _Ctrl-z_                                                            | The Line disappears    (NOT FUNCTIONING YET) :o2: |
|      | Type _Ctrl-y_                                                            | The Line appears again (NOT FUNCTIONING YET) :o2: |
| DONE |                                                                          |                                                   |

NB The _Redo_ redo's adding the line and adding the text in two steps. This is normal behaviour.

ERR: _Ctrl-z_ and _Ctrl-y_ both work (Edge browser, MacOs), but not in (Chrome, Windows)

### Scenario 4: undo, redo with multiple editor tabs

|      | Action                                                                   | Expected result                              |
|:-----|:-------------------------------------------------------------------------|:---------------------------------------------|
|      | Open language Education, model Edu-test, unit Fractions101               | Freon is opened, Fractions101 unit is shown  |
|      | Select <content> placeholder from _Theory101_, add a Line with some text | The text appears above the placeholder       |
|      | Open unit Fractions103                                                   | Unit Fractions103 is shown                   |
|      | Select <content> placeholder from _Theory103_, add a Line with some text | The text appears above the placeholder       |
|      | Select _Undo_                                                            | The Line from Fractions103 disappears        |
|      | Select _Redo_                                                            | The Line appears again                       |
|      | Type _Ctrl-z_                                                            | The Line disappears    (NOT FUNCTIONING YET) |
|      | Type _Ctrl-y_                                                            | The Line appears again (NOT FUNCTIONING YET) |
|      | Select _Undo_                                                            | The Line from Fractions103 disappears        |
|      | Go back to unit Fractions101                                             | Unit Fractions101 is shown                   |
|      | Select _Undo_                                                            | The Line from Fractions101 disappears        |
|      | Select _Redo_                                                            | The Line appears again                       |
|      | Type _Ctrl-z_                                                            | The Line disappears    (NOT FUNCTIONING YET) |
|      | Type _Ctrl-y_                                                            | The Line appears again (NOT FUNCTIONING YET) |
|      | Repeat this type of behavior                                             |                                              |
| DONE |                                                                          |                                              |

### Scenario 5: undo, redo within a text component

|      | Action                                                             | Expected result                                              |
|:-----|:-------------------------------------------------------------------|:-------------------------------------------------------------|
|      | Open language Education, model Edu-test, unit Fractions101         | Freon is opened, Fractions101 unit is shown                  |
|      | Select the text of the first question (_pie_) from _Theory101_     | The text appears editable                                    |
|      | Change something in the text, like deleting or adding a character  | The text is changed                                          |
|      | Type Ctrl-z                                                        | The text becomes as it was before the change                 |
|      | Type Ctrl-y                                                        | The text is changed back                                     |
|      | Select the text of the second question (_pie2_) from _Theory101_   | The text from pie2 appears editable                          |
| ERR  | Select Undo                                                        | The text appears again in pie1, and this element is selected |
|      | Select Redo                                                        | The text disappears again, pie1 is still selected            |
|      | Select the text of the second question (_pie2_) from _Theory101_   | The text from pie2 appears editable                          |
|      | Change something in the text, like deleting or adding characters   | The text is changed                                          |
|      | Select Undo                                                        | The text appears again                                       |
|      | Select Redo                                                        | The text appears again                                       |
|      | Repeat this type of behavior for whatever element you like         | ...                                                          |
| DONE |                                                                    |                                                              |

ERR: selection is not correct.

## Validate, Interpret

### Scenario 6: validate

|      | Action                                                  | Expected result                              |
|:-----|:--------------------------------------------------------|:---------------------------------------------|
|      | Open language Education, model Edu-test, unit StartFlow | Freon is opened, Fractions101 unit is shown  |
|      | Select _Validate_                                       | Errors found shown                           |
|      | Select arrow button after one of the messages           | The faulty element is selected in the editor |
|      | Open unit TestB                                         | TestB unit is shown                          |
|      | Select _Interpret_                                      | Interpreter results shown                    |
| DONE |                                                         |                                              |


NB Result in interpreter pane: `Error: Next page of step Theory102 => should be Theory103, not Video1.`
This is ok.

## Views

### Scenario 7: views

|      | Action                                                       | Expected result                          |
|:-----|:-------------------------------------------------------------|:-----------------------------------------|
|      | Open language Education, model Edu-test, unit _StartFlow_    | Freon is opened, StartFlow unit is shown |
|      | Select _View(s)_                                             | View dialog shown                        |
|      | Select or deselect some of the views, choose _Apply changes_ | The editor shows the correct view        |
| DONE |                                                              |                                          |


## Search

### Scenario 8: search text

|      | Action                                                     | Expected result                             |
|:-----|:-----------------------------------------------------------|:------------------------------------------- |
|      | Open language Education, model Edu-test, unit Fractions101 | Freon is opened, Fractions101 unit is shown |
|      | Select _Search_, and enter 'pie', ENTER key                | Search results (4) are shown                |
|      | Select arrow button after one of the messages              | The found element is selected in the editor |
| DONE |                                                            |                                              |

### Scenario 9: search on element type

|      | Action                                                     | Expected result                             |
|:-----|:-----------------------------------------------------------|:------------------------------------------- |
|      | Open language Education, model Edu-test, unit Fractions101 | Freon is opened, Fractions101 unit is shown |
|      | Select _Element..._                                        | Search element dialog is shown              |
|      | Enter some text, ENTER key                                 | Search results are shown                    |
|      | Select arrow button after one of the messages              | The found element is selected in the editor |
| DONE |                                                            |                                              |
