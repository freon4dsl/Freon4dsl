import {
    Box,
    GridBox,
    GridCellBox,
    HorizontalListBox,
    LabelBox, PiAction, PiActionsUtil, PiCaretPosition, PiCommand, PiCompositeProjection, PiCustomCommand,
    PiElement, PiUtils,
    SvgBox,
    TextBox,
    VerticalListBox
} from "@freon4dsl/core";
import { PiClassifier, PiConceptProperty, PiParameter } from "@freon4dsl/meta/dist/languagedef/metalanguage/index";

function one(o: Object) {
    // if( o instanceof TextBox) { console.log("TEXTBOX 2");return; }
    if( o instanceof SvgBox) { console.log("TEXTBOX 2");return; }
    if( o instanceof LabelBox) { console.log("TEXTBOX 2");return; }
    if( o instanceof GridBox) { console.log("TEXTBOX 2");return; }
    if( o instanceof GridCellBox) { console.log("TEXTBOX 2");return; }
    if( o instanceof HorizontalListBox) { console.log("TEXTBOX 2");return; }
    if( o instanceof VerticalListBox) { console.log("TEXTBOX 2");return; }
    if( o instanceof PiUtils) { console.log("TEXTBOX 2");return; }
    if( o instanceof PiAction) { console.log("TEXTBOX 2");return; }
    if( o instanceof PiActionsUtil) { console.log("TEXTBOX 2");return; }
    if( o instanceof PiClassifier) { console.log("TEXTBOX 2");return; }
    if( o instanceof PiParameter) { console.log("TEXTBOX 2");return; }
    if( o instanceof PiCompositeProjection) { console.log("TEXTBOX 2");return; }
    if( o instanceof PiCommand) { console.log("TEXTBOX 2");return; }
    if( o instanceof PiConceptProperty) { console.log("TEXTBOX 2");return; }
    if( o instanceof PiCustomCommand) { console.log("TEXTBOX 2");return; }
    if( o instanceof TextBox) { console.log("TEXTBOX 2");return; }
    console.log("NOT FOUND");
}

function two(o: Object){
    switch (o.constructor) {
        // case TextBox: console.log("TEXTBOX");return;
        case LabelBox: console.log("OscillatorNode");return;
        case Box: console.log("OscillatorNode");return;
        case SvgBox: console.log("OscillatorNode");return;
        case GridBox: console.log("OscillatorNode");return;
        case GridCellBox: console.log("OscillatorNode");return;
        case HorizontalListBox: console.log("OscillatorNode");return;
        case VerticalListBox: console.log("OscillatorNode");return;
        case PiUtils: console.log("OscillatorNode");return;
        case PiAction: console.log("OscillatorNode");return;
        case PiActionsUtil: console.log("OscillatorNode");return;
        case PiClassifier: console.log("OscillatorNode");return;
        case PiParameter: console.log("OscillatorNode");return;
        case PiCompositeProjection: console.log("OscillatorNode");return;
        case PiCommand: console.log("OscillatorNode");return;
        case PiConceptProperty: console.log("OscillatorNode");return;
        case PiCustomCommand: console.log("OscillatorNode");return;
        case TextBox: console.log("TEXTBOX 3");return;
    }
}
console.time("instanceof time");
// console.timeLog("instanceof time");
const t = new TextBox(null as any as PiElement,"role",() => "qwe",(v: string) => {});
one(t);
console.timeEnd("instanceof time");
console.time("switch time");
// console.timeLog("switch time");
two(t);
console.timeEnd("switch time");
