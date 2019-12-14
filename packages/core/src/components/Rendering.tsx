import * as React from "react";
import { observer } from "mobx-react";

import { SelectBox } from "../boxes/SelectBox";
import { SvgBox } from "../boxes/SvgBox";
import { GridBox } from "../boxes/GridBox";
import { SelectComponent } from "./boxes/SelectComponent";
import { SvgComponent } from "./boxes/SvgComponent";
import { GridComponent } from "../components/boxes/GridComponent";

import { AliasBox } from "../boxes/AliasBox";
import { TextBox } from "../boxes/TextBox";
import { Box } from "../boxes/Box";
import { HorizontalListBox, VerticalListBox, VerticalPiElementListBox } from "../boxes/ListBox";
import { LabelBox } from "../boxes/LabelBox";
import { PiEditor } from "../editor/PiEditor";
import { AliasComponent } from "./boxes/AliasComponent";
import { ListComponent } from "./boxes/ListComponent";
import { LabelComponent } from "./boxes/LabelComponent";
import { SelectableComponent } from "./SelectableComponent";
import { TextComponent } from "./boxes/TextComponent";

// tslint:disable-next-line:variable-name
export const RenderBox = observer(({ box, editor }: { box: Box; editor: PiEditor }) => (
    <SelectableComponent key={box.id} box={box} editor={editor}>
        {renderComponent(box, editor)}
    </SelectableComponent>
));

export function renderComponent(box: Box, editor: PiEditor): React.ReactElement<any> {
    switch (box.kind) {
        case "LabelBox":
            return <LabelComponent box={box as LabelBox} editor={editor} />;
        case "HorizontalListBox":
            return <ListComponent box={box as HorizontalListBox} editor={editor} />;
        case "VerticalPiElementListBox":
            return <ListComponent box={box as VerticalPiElementListBox} editor={editor} />;
        case "VerticalListBox":
            return <ListComponent box={box as VerticalListBox} editor={editor} />;
        case "TextBox":
            return <TextComponent box={box as TextBox} editor={editor} />;
        case "AliasBox":
            return <AliasComponent box={box as AliasBox} editor={editor} />;
        case "SelectBox":
            return <SelectComponent box={box as SelectBox} editor={editor} />;
        case "SvgBox":
            return <SvgComponent box={box as SvgBox} editor={editor} />;
        case "GridBox": {
            const callback = (box1: Box, editor1: PiEditor): any => <RenderBox box={box1} editor={editor1} />;
            return <GridComponent box={box as GridBox} editor={editor} renderBoxCallback={callback} />;
        }
        default:
            console.log("RenderComponent unknow box type: " + box);
    }
    return <div>Rendering unknown box of kind {box.kind}</div>;
}
