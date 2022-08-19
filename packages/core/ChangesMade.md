# Changes made to core and core-svelte

On 19-08-22:
1. Created README in /editor
2. Name of PiActions changed into PiCombinedActions, to distinguish this interface from 
/editor/actions/PiAction. Caused changes in meta, and changes in CustomActions in samples and test.
3. Everything todo with triggers moved from PiActions/PiCombinedActions and PiAction to new file 
/editor/actions/PiTrigger.
4. Moved utils that are specific for the editor from /util to /editor/util, and extracted PiCaret class
from BehaviorUtils.ts. Removed implementation of setCaret in TextBox, because this is always overwritten.
5. Replaced use of 'keyCode' by 'key', only the test whether a character is printable remains to be done.
6. General cleanup of code.
7. Changed 'keyPressAction' to 'isCharAllowed' in TextBox.
8. Cleanup of PiEditor.
