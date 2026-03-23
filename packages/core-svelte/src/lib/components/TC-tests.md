# Tests for TextComponent2

## Getting to / from the component

- [x] place selection in element before TC and hit Tab  
=> TC gets focus, all text selected, no crash :-)

- [x] place selection in element after TC and hit Shift+Tab  
=> TC gets focus, all text selected

- [x] click inside TC  
=> TC gets focus, all text selected

- [x] click inside TC when already focused  
=> caret moves correctly

- [x] press Enter inside TC  
=> editing ends, value stored, next element has focus

- [x] press Escape inside TC after typing  
=> value restored to original, next element has focus

- [ ] programmatically set focus (editor)  TODO
=> TC gets focus, caret position matches editor

--- 7

## Typing & basic editing

### Starting with empty text

- [x] type "aap"  
=> text becomes "aap", width grows correctly

- [x] type "aap", then Backspace 3x  
=> text becomes empty, width shrinks correctly

- [x] type "aap", then Delete at end  
=> no change

--- 3 (+7)

### Starting with text "mies"

- [x] click, type "aap"  
=> text becomes "miesaap" (or selection replaced depending on caret)

- [x] select all, type "aap"  
=> text becomes "aap"

- [x] type "aap", press Enter  
=> text stored as "aap", focus moves to next element

--- 3 (+3+7)

## Caret movement

- [x] ArrowLeft within text  
=> caret moves left

- [x] ArrowRight within text  
=> caret moves right

- [x] ArrowLeft at start  
=> focus moves to previous element (Freon navigation)

- [x] ArrowRight at end  
=> focus moves to next element

- [x] Home key  
=> caret moves to start

- [x] End key  
=> caret moves to end

--- 6 (+3+3+7)

## Selection behavior

- [x] select part of text with mouse  
=> selection correct

- [x] Shift+Arrow keys  
=> selection expands/shrinks correctly

- [x] Ctrl/Cmd + A  
=> all text selected

--- 3 (+6+3+3+7)

## Deletion behavior

- [x] Backspace in middle  
=> deletes character before caret

- [x] Delete in middle  
=> deletes character after caret

- [ ] Backspace at start  TODO
=> Freon handles (navigate/delete previous element)

- [ ] Delete at end  TODO
=> no change or Freon handles (depending on design)

- [x] Ctrl+Backspace  
=> deletes previous word

- [x] Ctrl+Delete  
=> deletes next word

--- 6 (+3+6+3+3+7)

## Clipboard

- [x] copy selected text  
=> clipboard contains selected text

- [x] paste text  
=> inserted at caret

- [x] cut text  
=> removed + copied

--- 3 (+6+3+6+3+3+7)

## Undo / Redo

- [ ] type text, press Ctrl/Cmd+Z  
=> browser undo works

- [ ] no local changes, press Ctrl/Cmd+Z  
=> Freon undo triggered

- [ ] redo (Ctrl+Y / Cmd+Shift+Z)  
=> correct behavior

--- 3 (+3+6+3+6+3+3+7)

## Validation / CharAllowed

- [ ] type allowed character  
=> appears in input

- [ ] type NOT allowed character  
=> nothing inserted

- [ ] type character that triggers GOTO_NEXT  
=> focus moves to next element

- [ ] type character that triggers GOTO_PREVIOUS  
=> focus moves to previous element

--- 4 (+3+3+6+3+6+3+3+7)

## Focus & lifecycle

- [x] type text, click outside  
=> endEditing triggered, value stored

- [x] type text, navigate with arrows out of component  
=> endEditing triggered

- [x] press Escape  
=> value restored, NOT stored

- [ ] after Escape, no extra commit occurs (no double save)

--- 4 (+4+3+3+6+3+6+3+3+7)

## Auto-sizing

- [x] type short text  
=> input width matches content

- [x] type long text  
=> input grows correctly

- [x] delete text  
=> input shrinks correctly

- [ ] empty text with placeholder  
=> width matches placeholder

--- 4 (+4+4+3+3+6+3+6+3+3+7)

## Readonly mode

- [ ] TC in readonly  
=> renders as span, no caret

- [ ] click readonly TC  
=> no editing starts

- [ ] text visually identical to editable (unfocused)

--- 3 (+4+4+4+3+3+6+3+6+3+3+7)

## Edge cases

- [ ] empty string vs undefined  
=> stored correctly (optional string logic)

- [ ] very fast typing  
=> no glitches

- [ ] rapid focus switching  
=> no crashes or lost state

- [ ] selection + paste  
=> replaces selection correctly

- [ ] caret at boundaries + typing  
=> correct navigation / insertion

--- 5 (+3+4+4+4+3+3+6+3+6+3+3+7)
