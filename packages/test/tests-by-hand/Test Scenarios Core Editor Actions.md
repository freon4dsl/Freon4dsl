# Test Scenarios Core Editor Actions

These scenarios test the functionality of the core editor.

## Moving Around: tab and arrow keys
These scenarios test the functionality concerning selecting and deselecting the current element in the core editor.

### Scenario 1: tabbing
|  | Action                                                     | Expected result                                                                        |
|:-|:-----------------------------------------------------------|:---------------------------------------------------------------------------------------|
|  | Open language Education, model Edu-test, unit Fractions101 | selected element: 'box: Topic-main-referencebox BOX-4 elem: ID-8 - Topic  "NotTextBox" |
|  | Type _TAB_                                                 | selected changes to the following editable element: `Fractions101`                     |
|  | Select any element                                         | selected changes to the following editable element: `Mathematics...`                   |
|  | Type _TAB_                                                 | selected changes to the following editable element: `Theory101`                        |
|  | Type _Shift-TAB_                                           | selected changes to the previous editable element: `Mathematics...`                    |
|  | Repeat behavior as you like                                | selected changes to the editable element                                               |

### Scenario 2: arrow
|  | Action                                                     | Expected result                                                                           |
|:-|:-----------------------------------------------------------|:------------------------------------------------------------------------------------------|
|  | Open language Education, model Edu-test, unit Fractions101 | selected element: box: Topic-main-referencebox BOX-4 elem: ID-8 - Topic  "NotTextBox"     |
|  | Select the 12 in _marbles2_                                | selected element: box: Fraction-denominator-numberbox BOX-76 elem: ID-31 - Fraction  "12" |
|  | Type _arrow-up_                                            | selected element: box: Question-content-textbox BOX-70 elem: ID-30 - Question             |
|  | Type _arrow-down_                                          | selected element: box: Fraction-numerator-numberbox BOX-74  elem: ID-31 - Fraction  "5"   |
|  | Scroll down                                                | no changes in selection                                                                   |
|  | Type _arrow-up_                                            | selected element: box: Question-content-textbox BOX-70, selection is scrolled in view     |
|  | Repeat behavior as you like                                | selected element changes                                                                  |

### Scenario 3: ctrl-arrow
|  | Action                                                     | Expected result                                                                          |
|:-|:-----------------------------------------------------------|:-----------------------------------------------------------------------------------------|
|  | Open language Education, model Edu-test, unit Fractions101 | selected element: box: Topic-main-referencebox BOX-4 elem: ID-8 - Topic  "NotTextBox"    |
|  | Select the 12 in _marbles2_                                | selected element: box: Fraction-hlist-line-0 BOX-77 elem: ID-31 - Fraction  "NotTextBox" |
|  | Type _ctrl-arrow-up_                                       | selected element: box: Question-content-textbox BOX-70 elem: ID-30 - Question            |
|  | Type _ctrl-arrow-up_                                       | selected element: box: Question-overall BOX-80 elem: ID-30 - Question  "NotTextBox"      |
|  | Type _ctrl-arrow-down_                                     | selected element: box: Question-name-textbox BOX-67 elem: ID-30 - Question  "marbles2"   |
|  | Repeat behavior as you like                                | selected element changes                                                                 |

### Scenario 4: various combinations
|     | Action                                                     | Expected result                                                                                   |
|:----|:-----------------------------------------------------------|:--------------------------------------------------------------------------------------------------|
|     | Open language Education, model Edu-test, unit Fractions101 | selected element: box: Topic-main-referencebox BOX-4 elem: ID-8 - Topic  "NotTextBox"             |
|     | Select the 7 in _pie_                                      | selected element: box: SimpleNumber-value-numberbox BOX-38 elem: ID-20 - SimpleNumber  "7"        |
|     | Type _ctrl-arrow-down_                                     | No change                                                                                         |
| :a: | Type _ctrl-arrow-up_                                       | selected element: box: Question-overall BOX-41 elem: ID-13 - Question  "NotTextBox"               |
| :b: | Type _TAB_                                                 | selected element:  box: Question-content-textbox BOX-34 elem: ID-13 - Question                    |
| :b: | Type _arrow-up_                                            | selected element: box: action-Theory-content-new-list-item-textbox BOX-27 elem: ID-9 - Theory  "" |
|     | Repeat behavior as you like, including scrolling           | selected element changes                                                                          |

:a: Need to do _ctrl-arrow-up_ twice, the first one seems to do nothing.

:b: Resulting selection is Question0name0box-38, elemL ID-31, which I think is the correct one.
Next _arrow-up_ is ok when started in the name box.

## Drag and Drop
These scenarios test the functionality concerning drag and drop in the core editor.

### Scenario 5a: moving an element in a list
|  | Action                                                                        | Expected result                                              |
|:-|:------------------------------------------------------------------------------|:-------------------------------------------------------------|
|  | Open language Education, model Edu-test, unit Fractions101                    |                                                              |
|  | Use the drag handle before _pie_, and drag it to the _content_ of _Theory101_ | Error: Drop is not allowed here ... (Question ... Line). :a: |
|  | Drag _pie_ to the _questions_ placeholder of _Theory101_                      | Question _pie_ moves to the last in the list                 |
|  | Drag _pie_ to the _questions_ placeholder of _Practice1_                      | Question _pie_ moves to the last in the list of _Practice1_  |
|  | Repeat behavior as you like, save unit to be sure the changes are persisted   | changes in various lists                                     |

:a: After the error message the HTML focus is not in the editor anymore, although there is a selected element with a border around it.
**Solved** by making a change in ErrorMessage.svelte to set the HTML focus on the selected element though the FreEditor.

:a: When typing Enter (or other keys) they are captured by the underlying editor, they should not.
When typing Enter the dialog should be closed. other keys should be ignored.

### Scenario 5b: moving an element in a table
|     | Action                                                                      | Expected result                                                   |
|:----|:----------------------------------------------------------------------------|:------------------------------------------------------------------|
|     | Open language Education, model Edu-test, unit StartFlow                     |                                                                   |
|     | Deselect the _Custom_ and _footing_ views                                   | the list 'Condition - Goto Page' is shown as a table              |
|     | Use the drag handle before _gradeD_, and drag it to the placeholder _rules_ | Error: Drop is not allowed here ... (PageTransition ... FlowRule) |
|     | Drag _gradeD_ to the list of _FromInDepth1_                                 | Grade rule  moves to the list                                     |
|     | Repeat behavior as you like, save unit to be sure the changes are persisted | changes in various lists                                          |
| :x: | Drag _gradeF_ to _gradeB_ in the same table.                                | _gradeF_ is moved     :a:                                         |

:a: Results in Mobx error and _gradeF_ disappears from the editor.
```asciidoc
AstChanger.ts:21 
 AST.change: Error: [MobX] Modification exception: the internal structure of an observable array was changed

```
**Solved** See TableComponent and TableCellComponent

## Adding/deleting list elements
These scenarios test the functionality concerning adding and deleting elements in the core editor.

### Scenario 6: adding a question
|  | Action                                                        | Expected result                                                                             |
|:-|:--------------------------------------------------------------|:--------------------------------------------------------------------------------------------|
|  | Open language Education, model Edu-test, unit Fractions101    |                                                                                             |
|  | Select the 12 in _marbles2_                                   | selected element: box: Fraction-denominator-numberbox BOX-76 elem: ID-31 - Fraction  "12"   |
|  | Type _Enter_                                                  | a new list element is added after _marbles2_, cursor in the name box of the new element     |
|  | Select the placeholder <questions>, type _Enter_              | a new list element is added as last in the list, cursor in the name box of the new element  |
|  | Select the placeholder <questions>, click mouse on _Question_ | a new list element is added as last in the list, cursor in the name box of the new element  |
|  | Repeat behavior as you like                                   | elements are added                                                                          |

### Scenario 7: deleting a question
|  | Action                                                     | Expected result                                                                           |
|:-|:-----------------------------------------------------------|:------------------------------------------------------------------------------------------|
|  | Open language Education, model Edu-test, unit Fractions101 |                                                                                           |
|  | Select _marbles_                                           | selected element is _marbles_                                                             |
|  | Type _Delete_                                              | element _marbles_ is removed                                                              |
|  | Select the 12 in _marbles2_                                | selected element: box: Fraction-denominator-numberbox BOX-76 elem: ID-31 - Fraction  "12" |
|  | Type _Delete_ twice                                        | the number 12 is removed, <denominator> is shown and selected                             |
|  | Type _Delete_                                              | element _denominator_ is NOT removed **(WHAT BEHAVIOUR DO WE EXPECT?!!)**                 |
|  | Repeat behavior as you like                                | elements are deleted                                                                      |


## Adding/deleting list elements in tables
These scenarios test the functionality concerning adding and deleting elements in a table.

### Scenario 6: adding
|  | Action                                                  | Expected result                                                                                  |
|:-|:--------------------------------------------------------|:-------------------------------------------------------------------------------------------------|
|  | Open language Education, model Edu-test, unit StartFlow |                                                                                                  |
|  | Deselect the _Custom_ and _footing_ views               | the list is shown as a table                                                                     |
|  | Select _inDepth1_ after _gradeA_                        | selected element                                                                                 |
|  | Type _Enter_                                            | a new list element is NOT added after _gradeA_ (WHAT BEHAVIOUR DO WE EXPECT?!!!) :a:             |
|  | Select _inDepth1_ after _gradeA_                        | selected element                                                                                 |
|  | Use mouse to show context menu, and select _Add after_  | a new list element is added after _gradeA_, cursor is in the <condition> box of the new element  |
|  | Select _inDepth1_ after _gradeA_                        | selected element                                                                                 |
|  | Use mouse to show context menu, and select _Add before_ | a new list element is added before _gradeA_, cursor is in the <condition> box of the new element |
|  | Repeat behavior as you like                             | elements are added                                                                               |

:a: Enter is overloaded, inside a reference it show the dropdown or selects from the dropdown. Elsewjhere it adds an element to the list.
I think we should not add elements at typing Enter, as it is confusing.

### Scenario 7: deleting
|     | Action                                                  | Expected result                                     |
|:----|:--------------------------------------------------------|:----------------------------------------------------|
|     | Open language Education, model Edu-test, unit StartFlow |                                                     |
|     | Deselect the _Custom_ and _footing_ views               | the list is shown as a table                        |
|     | Select _inDepth1_ after _gradeA_                        | selected element                                    |
|     | Type _Delete_ (multiple times)                          | element _inDepth1_ is emptied, placeholder is shown |
|     | Select _inDepth1_ after _gradeA_                        | selected element                                    |
|     | Use mouse to show context menu, and select _Delete_     | element _gradeA_ is deleted                         |
| :x: | Select complete row _gradeC_ using _ctrl-arrow-up_      | selected element         :a:                        |
|     | Type _Delete_                                           | row _gradeC_ is deleted   :b:                       |
|     | Repeat behavior as you like                             | elements are deleted                                |

:a: On Mac _Ctrol-arrow-up_ should be _Option-arrow-up_

:b: row is never relly selected and does look weird when several cells are selected
