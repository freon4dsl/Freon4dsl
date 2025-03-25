# Svelte 5

## Drag & drop

1. The console logs in ListUtil.ts use `freId()`, assuming that elements are nodes, but element can also be references (`FreNodeReference`).

    **FIXED** Changed the console logs to fix this.

3. In language CourseSchedule model AdultEducation1. 
  - Turn off all views.
  - Open TeachingStaff
  - drag competence to staff list:
  - Should refuse, but does actually try to drop, models becomes incorrect and mobx is complaining.
  - 
    **FIXED** Changed the manner in which types are compared to include the diff between reference<X> and X.

3. In language CourseSchedule model AdultEducation1.
  - Open Schedule modelunit with external views on
  - Takes _very_ long and gives the following error in the console:
    Plus button or dropdowns on slots do not work, the ERROR on the last line in the image is then repeated.

    **FIXED** Changed sort function to use a local array, and assign to observed sortedSlots at the end once.

4. Open teaching staff with accordion
   - click add button:
   - FreonComponent.svelte:272
     Uncaught (in promise) Svelte error: props_invalid_value
     Cannot do `bind:open={undefined}` when `open` has a fallback value
     https://svelte.dev/e/props_invalid_value

    **TODO** Clarify this and add comments to explain

5. Context menu for lists **_sometimes_** seem to come at a fixed distance from the mouse click
   - Open CourseSchedule unit Building
   - right click on various list elements
   - the same for the TeachingStaff

6. Draghandles in the editor show through the View menu

    **FIXED** Removed z-index of .drag-handle

7. Tabbing goes through several items that should not be tabbable in tables and lists.
 
   **FIXED** by changing the tabindex at several places.

8. The parameter list in method has too many drag handles.
    - Open Example project, Model89

   **FIXED** Changed adding list-joins from creating a list box into creating a layout box.

9. The table headers have drag handles, they should not be there.
   The empty action box at the end of a list or table should not have a drag handle either.

   **FIXED** Added parameter to add drag handle to TableCellComponent.

10. Too many effects in ErrorList, ErrorMarker, TextComponent, RenderComponent, TableComponent.
    These all seem to come from replacing the old afterUpdate, which has no real equivalent in Svelte 5. 
    I did make a number of changes, and it seems to be resolved by them, would like to discuss before pushing them.

    **FIXED**

11. The single keyword option for booleans does not function anymore!! (Anneke: This is unrelated to svelte 5, I think.)
    
    **ADDED TO ISSUES IN NOTES REPO**
