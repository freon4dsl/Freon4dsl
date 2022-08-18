# Overview of the events that are triggered by the new TextComponent

## on creation of element in editor
autorun
onMOunt
afterUpdate

## on click in text
onCLick
setfocus
afterUpdate

NOTE when clicking on text1 when its already has focus: only onCLick afterUpdate

## on leaving element when first clicked
onBLur

NOTE: element still shows focus, but arrow keys do not function

## when entering char
onKeyDown
onKeyPress
afterUpdate

## when leaving textfield after adding char
setFocus
onBlur

## when using arrow keys
onKeyDown
setFocus
setCaret
setFocus

NOTE: no onblur when moving mouse, only when clicking mouse

# when document.onselectionchange is added

## on click and select (part of)  text
document.onselectionchange
onCLick
afterUpdate
onBlur

## onclick of emtpy text
document.onselectionchange
onClick
setFocus
afterUpdate
onBlur

Unable te reproduce:
ERROR: Uncaught TypeError: _a.parent is null
selectParentBox
onKeyDown

When using ctrl-arrow-up and then ctr-arrow-down: the styling is not correctly adjusted.

## click on label1, then ctrl-arrow-down
document.onselectionchange 
afterUpdate 2 
setFocus 
setCaret 
setCaretPosition: 0 
setFocus 
afterUpdate 
document.onselectionchange

then arrow-right:
onKeyDown 
setFocus 
onBlur 
setCaret 
setCaretPosition: 0 
setFocus 
afterUpdate 
document.onselectionchange

then arrow-left:
onKeyDown 
setFocus 
onBlur
setCaret 
setCaretPosition: 0 
setFocus 
afterUpdate 
document.onselectionchange


# What text component should do

1. onMount: show the text in its textBox or the placeholder in its textBox
2. onClick: ??
3. onKeyPress: 
   1. arrow left or right: move through text
   2. backspace: delete char before caret
   3. delete: delete char after caret
   4. enter: textBox.setText(currentValue)
   5. on symbol of expression: add extra boxes ...???


See https://en.wikipedia.org/wiki/Table_of_keyboard_shortcuts for normal keyboard shortcuts.
