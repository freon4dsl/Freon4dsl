# What every keystroke should do


| Key                               | Where         | What                                                                                                                                 |
|-----------------------------------|---------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Custom-Keystroke                  | Everywhere    | Perform the custom action                                                                                                            |
| Tab                               | Everywhere    | Goto the next editable element                                                                                                       |
| Shift-Tab                         | Everywhere    | Goto the previous editable element                                                                                                   |
| Ctrl-Arrow-up, Alt-Arrow-up       | Everywhere    | Goto the element's parent (even if it is non-editable)                                                                               |
| Ctrl-Arrow-down, Alt-Arrow-down   | Everywhere    | Goto the first element's child (even if it is non-editable)                                                                          |
| Arrow-left                        | TextComponent | Position the cursor one char to the left                                                                                             |
| Arrow-left                        | Others        | Goto the (non-editable) element that is visibly left the currently selected one                                                      |
| Arrow-right                       | TextComponent | Position the cursor on char to the right                                                                                             |
| Arrow-right                       | Others        | Goto the (non-editable) element that is visibly right the currently selected one                                                     |
| Delete                            | TextComponent | Delete the currently selected char(s) forwards, if no chars left, delete the complete element and goto the previous editable element |
| Delete                            | Others        | Delete the currently selected element and goto the next editable element                                                             |
| Backspace                         | TextComponent | Delete the currently selected char(s) backwards, if no chars left, delete the complete element and goto the next editable element    |
| Backspace                         | Others        | Delete the currently selected element and goto the next editable element                                                             |
| Enter                             | TextComponent | Stop editing (save current value of the text)                                                                                        |
| Enter                             | TextDropdown  | Select the current item from the dropdown menu                                                                                       |
| Escape                            | TextComponent | Stop editing (do not save current value of the text??)                                                                               |
| Escape                            | TextDropdown  | Hide the drop down menu                                                                                                              |
| Arrow-up                          | TextDropdown  | Goto to previous (upper) item in dropdown menu                                                                                       |
| Arrow-up                          | Others        | Goto the (non-editable) element that is visibly below the currently selected one                                                     |
| Arrow-down                        | TextDropdown  | Goto to next (lower) item in dropdown menu                                                                                           |                                                                                                                                      |
| Arrow-down                        | Others        | Goto the (non-editable) element that is visibly above the currently selected one                                                     |
| Shift-delete                      |               | Cut                                                                                                                                  |
| Ctrl-Arrow-left, Alt-Arrow-left   |               |                                                                                                                                      |
| Ctrl-Arrow-right, Alt-Arrow-right |               |                                                                                                                                      |
| Ctrl-z                            |               | Undo                                                                                                                                 |
| Ctrl-alt-z, Alt-backspace         |               | Undo                                                                                                                                 |
| Shift-Alt-backspace               |               | Redo                                                                                                                                 |
| Ctrl-h                            |               | Search                                                                                                                               |
| Ctrl-x                            |               | Cut                                                                                                                                  |
| Ctrl-c                            |               | Copy                                                                                                                                 |
| Ctrl-v                            |               | Paste                                                                                                                                |
| Printable char                    | TextComponent | Add char to text at current cursor position                                                                                          |
| Printable char                    | TextDropdown  | Add char to text at current cursor position and filter the dropdown menu accordingly                                                 |

Note that Custom keystrokes must always use a meta key (ctrl, alt, command).
