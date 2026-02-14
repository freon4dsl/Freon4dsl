# Native HTML UI Components (Dependency-Free)

This document lists all native HTML elements that provide UI behavior without requiring external libraries. These components are accessible, keyboard-friendly, and supported in modern browsers.

---

## Text Variants

Normal Text Input: <input type="text">  
Basic single-line text input.

Search Input: <input type="search">  
Optimized for search queries. May include built-in clear button.

Email Input: <input type="email">  
Validates email format and shows email keyboard on mobile.

URL Input: <input type="url">  
Validates URL format.

Telephone Input: <input type="tel">  
Optimized mobile keyboard for phone number entry.

Password Input: <input type="password">  
Masked text input for sensitive data.

---

## Numeric & Range

Number Input: <input type="number">  
Numeric input with optional min, max, and step attributes.

Range Slider: <input type="range">  
Slider control for selecting numeric values within a range.

---

## Date & Time

Date Picker: <input type="date">  
Native calendar UI for selecting a date.

Time Picker: <input type="time">  
Native time selection control.

Date & Time Picker: <input type="datetime-local">  
Combined date and time selector.

Month Picker: <input type="month">  
Select a specific month and year.

Week Picker: <input type="week">  
Select a specific week of a year.

---

## Selection & Boolean

Checkbox: <input type="checkbox">  
Toggle between checked and unchecked state.

Radio Button: <input type="radio">  
Select one option within a group.

---

## File & Color

File Upload: <input type="file">  
Select one or multiple files from the device.

Color Picker: <input type="color">  
Native color selection dialog.

---

## Buttons

Generic Button: <button> BUTTON </button> 
Flexible button element for custom behavior.

Button Input: <input type="button">  
Clickable button without default form behavior.

---

## Form Elements

Dropdown Select: <select>  
Standard dropdown selection control.

Option Item: <option>  
Selectable item within a <select>.

Option Group: <optgroup>  
Groups related options inside a <select>.
</select>

---

## Autocomplete & Suggestions

Datalist: <datalist>  </datalist>
Provides predefined autocomplete suggestions for an input field.

---

## Disclosure & Accordion

Details Element: `<details>`  
Expandable/collapsible content container.

Summary Element: <summary>  
Visible header for a `<details>` element.

---

## Modal & Overlay

Dialog: `<dialog>`  
Native modal or non-modal dialog element.

---

## Popover API (Modern Browsers)

Popover Attribute: popover  
Turns an element into a lightweight popover.

Popover Target: popovertarget  
Associates a button with a popover element.

# Lightweight UI libraries

## Melt UI

Has a Tree component, but no Carousel.

Website: https://melt-ui.com/

# Lightweight Carousel Components

## EmblaCarousel

Website: https://www.embla-carousel.com/

## Keen Slider

Website: https://keen-slider.io/

# Conclusion

Useful custom components:

1. Card
2. Carrousel
3. Accordion
4. Collapsable
5. Date and Time pickers (5 subtypes)
6. Input restrictions (mail, phone, url)
7. Popover, showing a single node
