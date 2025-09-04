import { FreLogger } from '@freon4dsl/core';

/**
 * Loggers for Svelte components cannot be created inside the component, as this result
 * in a new logger instance for each component instance.
 * Therefore, we create the loggers  once in this file.
 */
export const TEXT_LOGGER = new FreLogger('TextComponent');
export const TEXTDROPDOWN_LOGGER = new FreLogger('TextDropdownComponent');
export const DROPDOWN_LOGGER = new FreLogger('DropdownComponent');
export const TABLE_LOGGER = new FreLogger('TableComponent');
export const TABLECELL_LOGGER = new FreLogger('TableCellComponent');
export const OPTIONAL_LOGGER = new FreLogger('OptionalComponent');
export const FREON_LOGGER = new FreLogger('FreonComponent');
export const RENDER_LOGGER = new FreLogger('RenderComponent');
export const FRAGMENT_LOGGER = new FreLogger('FragmentComponent');
export const GRID_LOGGER = new FreLogger('GridComponent');
export const GRIDCELL_LOGGER = new FreLogger('GridCellComponent');
export const BUTTON_LOGGER = new FreLogger('ButtonComponent');
export const CHECKBOX_LOGGER = new FreLogger('CheckBoxComponent');
export const RADIO_LOGGER = new FreLogger('FreonComponent');
export const CONTEXTMENU_LOGGER = new FreLogger('Contextmenu');
export const ELEMENT_LOGGER = new FreLogger('ElementComponent');
export const INDENT_LOGGER = new FreLogger('IndentComponent');
export const INNERSWITCH_LOGGER = new FreLogger('InnerSwitchComponent');
export const LABEL_LOGGER = new FreLogger('LabelComponent');
export const LAYOUT_LOGGER = new FreLogger('LayoutComponent');
export const LIMITEDCHECKBOX_LOGGER = new FreLogger('LimitedCheckboxComponent');
export const LIMITEDRADIO_LOGGER = new FreLogger('LimitedRadioComponent');
export const LIST_LOGGER = new FreLogger('ListComponent');
export const MULTILINETEXT_LOGGER = new FreLogger('MultilineComponent');
export const NUMERICSLIDER_LOGGER = new FreLogger('NumericSliderComponent');
export const SWITCH_LOGGER = new FreLogger('SwitchComponent');
export const DIAGRAM_LOGGER = new FreLogger('DiagramComponent');
