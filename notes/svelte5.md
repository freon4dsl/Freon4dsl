# Svelte 5

## Drag & drop

1. The console logs in ListUtil.ts use `freId()`, assuming that elements are nodes, but alement can also be references (`FreNodeReference`).

    **FIXED** Changed the console logs to fix this.

3. In language CourseSchedule model AdultEducation1. 
  - Turn off all views.
  - Open TeachingStaff
  - drag competence to staff list:
  - Sould refuse, but does actually try to drop, models becomes incorrect and mobx is complaining.

3. In language CourseSchedule model AdultEducation1.
  - Open Schedule modelunit with external views on
  - Takes _very_ long and gives the following error in the console:
  ![img.png](img.png)
    Plus button or dropdowns on slots do not work, the ERROR on the last line in the image is then repeated.

    **FIXED** Changed sort function to use a local array, and assign to observed sortedSlots at the end once.
