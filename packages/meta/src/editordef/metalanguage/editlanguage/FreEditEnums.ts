/**
 * The direction of a property that is a list
 */
export enum FreEditProjectionDirection {
    NONE = "NONE",
    Horizontal = "Horizontal",
    Vertical = "Vertical",
}

/**
 * The manner in which elements of a list are combined
 */
export enum ListJoinType {
    NONE = "NONE",
    Terminator = "Terminator", // the accompanying string is placed after each list element
    Separator = "Separator", // the accompanying string is placed between list elements
    Initiator = "Initiator", // the accompanying string is placed before each list element
}

/**
 * The different displayTypes
 */
export enum DisplayType {
    Multiline = "multiline",
    Text = "text",
    Checkbox = "checkbox",
    Radio = "radio",
    Switch = "switch",
    InnerSwitch = "inner-switch",
    Slider = "slider",
}

/**
 * The different strings that may be used as 'for' in a FreEditGlobalProjection
 */
export enum ForType {
    Boolean = "boolean",
    Number = "number",
    Limited = "limited",
    LimitedList = "limitedList",
    ReferenceSeparator = "referenceSeparator",
    Externals = "externals",
}
