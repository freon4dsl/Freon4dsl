# Tests for TextDropdownComponent

## Getting to / from the component

- [x] place selection in element before TDD and hit Tab  
  => TDD gets focus, dropdown does **not** open

- [x] place selection in element after TDD and hit Shift+Tab  
  => TDD gets focus, dropdown does **not** open

- [x] click in TDD input when it does not have focus  
  => TDD gets focus, dropdown opens

- [x] click in TDD input when it already has focus  
  => dropdown stays open or opens correctly, no strange focus jump

- [x] click outside TDD while dropdown is open  
  => editing ends, dropdown closes, value is committed or restored correctly

- [x] resize window while dropdown is open  
  => dropdown closes

- [x] scroll the surrounding pane while dropdown is open  
  => dropdown closes

## Opening the dropdown

- [x] Tab into TDD, then press Enter  
  => dropdown opens

- [x] Tab into TDD, press ArrowDown  
  => dropdown does **not** open

- [x] click in TDD, dropdown opens immediately  
  => all options / matching options are shown correctly

- [x] press Enter while dropdown is closed  
  => dropdown opens, no option executed yet

## Dropdown positioning / overlay

- [x] open dropdown in normal position  
  => dropdown appears below input, aligned with input width

- [x] open dropdown near right edge of viewport  
  => dropdown shifts left to stay visible

- [x] open dropdown near bottom edge of viewport  
  => dropdown flips above input

- [ ] open dropdown with many options  TODO
  => dropdown max height is limited, list remains usable

## Filtering on text and caret position

- [x] open dropdown with empty text  
  => filtered options correspond to empty prefix

- [x] type one character at end of text  
  => filtered options update immediately

- [x] type several characters  
  => filtered options keep tracking current prefix

- [x] move caret left inside text  
  => filtered options update based on text before caret

- [x] move caret right inside text  
  => filtered options update based on text before caret

- [x] press Home  
  => filtered options update based on empty / start prefix

- [x] press End  
  => filtered options update based on full prefix before caret

- [x] click in middle of text  
  => caret moves there, filtered options update accordingly

- [x] drag-select part of the text with the mouse  
  => filtered options update using start of selection as anchor

- [x] press Ctrl+A / Cmd+A  
  => all text selected, filtered options update consistently

## Typing / deleting

- [x] type ordinary text with dropdown open  
  => text changes, width updates, filtered options update

- [x] press Backspace with caret not at start  
  => browser deletes character, filtered options update

- [x] press Delete with caret not at end  
  => browser deletes character, filtered options update

- [x] press Ctrl+Backspace / Cmd+Backspace (depending on platform behavior)  
  => previous word is deleted if possible, filtered options update

- [x] press Ctrl+Delete / Cmd+Delete (depending on platform behavior)  
  => next word is deleted if possible, filtered options update

- [x] paste text into TDD  
  => text changes correctly, width updates, filtered options update

- [x] cut selected text from TDD  Int
  => text changes correctly, width updates, filtered options update

## Navigating in the dropdown

- [x] open dropdown and press ArrowDown  
  => first option becomes selected

- [x] press ArrowDown repeatedly  
  => selection moves down and wraps to first option at end

- [x] open dropdown and press ArrowUp  
  => last option becomes selected

- [x] press ArrowUp repeatedly  
  => selection moves up and wraps to last option at top

- [x] change filter so current selected option disappears  
  => dropdown repairs selected option to a visible one (or undefined if none)

## Choosing an option

- [x] click an option in the dropdown  
  => option is executed, dropdown closes, no double execution

- [x] navigate to an option with ArrowUp / ArrowDown and press Enter  
  => selected option is executed, dropdown closes

- [x] open dropdown, do not move selection, press Enter  
  => currently selected option is executed, or fallback behavior is correct

- [x] when exactly one filtered option remains and it has been fully typed  
  => option is executed automatically, without Enter

- [x] after automatic execution of a unique fully typed option  
  => dropdown closes, no second execution on focusout

## Leaving the component

- [x] with dropdown open and no valid final match, click outside  
  => original value is restored

- [x] with dropdown open and press ArrowLeft at start of text
  => editing ends and selection moves to previous Freon leaf

- [x] with dropdown open and press ArrowRight at end of text  
  => editing ends and selection moves to next Freon leaf

## Escape behavior

- [x] type something, then press Escape  
  => original value is restored

- [x] press Escape while dropdown is open  
  => dropdown closes, selection stays in TDD

## Interaction with model refresh

- [x] trigger refresh while TDD is not focused  
  => text updates from box value

- [ ] trigger refresh while TDD is focused and user is typing  TODO
  => current typing is not overwritten unexpectedly

## Reference button

- [x] for selectable reference, click reference button  
  => referred element is selected

## Action box specifics

- [x] choose an action option from dropdown  
  => action executes, text is cleared if that is intended

- [ ] auto-match path for action box regular expression  TODO
  => correct action executes immediately

- [ ] after action execution by regex or dropdown choice TODO
  => no double execution on focusout or Enter

## Stability / no weirdness

- [x] rapidly type and move caret left/right  
  => no crashes, no stale dropdown state

- [x] open and close dropdown repeatedly  
  => no crashes, no duplicate listeners

- [x] click option with mouse several times in different sessions  
  => no double execution, no focus glitches

- [ ] test any "no selection available" case  TODO
  => component stays stable and does not crash :-)
