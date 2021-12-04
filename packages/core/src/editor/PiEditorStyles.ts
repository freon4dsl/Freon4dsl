import { PiStyle } from "./PiStyle";
import { merge } from "lodash";

export type BoxTypeName = "label" | "text" | "alias" | "select" | "placeholder" | "list" | "grid" | "gridcellEven" | "gridcellOdd";
export type ThemeType = "dark" | "light";

export type PiBoxStyles = {
    [boxType in BoxTypeName]?: PiStyle;
};

export type PiBoxStyleThemes = {
    [themeType in ThemeType]: PiBoxStyles;
};

export type PiEditorStyle = {
    global: PiBoxStyleThemes;
    [conceptName: string]: PiBoxStyleThemes;
}

// TODO How to deal with subtypes?

export function conceptStyle(editorStyle: PiEditorStyle, theme: string, concept: string, boxtype: BoxTypeName, customStyle: PiStyle): PiStyle {
    return merge({}, editorStyle?.global?.[theme]?.[boxtype], editorStyle?.[concept]?.[theme]?.[boxtype], customStyle);
}
