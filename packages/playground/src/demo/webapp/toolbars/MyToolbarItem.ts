import { PiEditor } from "@projectit/core";

export interface MyToolbarItem {
    id: string;
    label: string;
    onClick: (editor: PiEditor) => void;
    component?: (editor: PiEditor) => Promise<JSX.Element>;
}
