# Implementation of Dropdown and ContextMenu
In the library there is a TextDropdownComponent that shows a DropdownComponent conditionally (when dropdownShown is true). The list shown in the dropdown is unknown in size and may be small or large. Because the library may be used in unknown environments, the dropdown must behave correctly under all circumstances.
Therefore, the dropdown is implemented as follows:
1.	Avoid clipping by ancestors
To prevent a parent element with overflow: hidden, auto, or scroll from clipping the dropdown menu, the dropdown panel is portaled to a shared overlay root.
2.	Avoid layout influence
      Portaling also prevents the TextDropdownComponent from growing when the dropdown appears, because the dropdown panel is rendered outside the normal layout flow (it is positioned independently and does not take space in the layout).
3.	Shared overlay root
      A single shared overlay root exists to which all dropdown panels are portaled.
4.	Overlay layer
      The overlay root acts as a fixed floating layer above the application (a “glass layer”), containing UI elements such as dropdowns and context menus.
5.	Ensuring visibility
      If opening the dropdown would place the dropdown outside the visible area of the surrounding scroll container, the implementation scrolls the container so that the anchor element (TextDropdownComponent) moves to a position where the dropdown panel can be fully visible.
      
 
The same principles are used for the ContextMenu, which is also rendered in the shared overlay root and positioned relative to its trigger location.
