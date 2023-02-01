import {
    Box,
    GridBox,
    GridCellBox,
    HorizontalListBox,
    LabelBox, FreAction, FreCommand, FreCustomCommand,
    FreNode, FreUtils,
    SvgBox,
    TextBox,
    VerticalListBox
} from "@projectit/core";
import { FreClassifier, FreConceptProperty, FreParameter } from "@projectit/meta/dist/languagedef/metalanguage/index";

function one(o: Object) {
    // if( o instanceof TextBox) { console.log("TEXTBOX 2");return; }
    if( o instanceof SvgBox) { console.log("TEXTBOX 2");return; }
    if( o instanceof LabelBox) { console.log("TEXTBOX 2");return; }
    if( o instanceof GridBox) { console.log("TEXTBOX 2");return; }
    if( o instanceof GridCellBox) { console.log("TEXTBOX 2");return; }
    if( o instanceof HorizontalListBox) { console.log("TEXTBOX 2");return; }
    if( o instanceof VerticalListBox) { console.log("TEXTBOX 2");return; }
    if( o instanceof FreUtils) { console.log("TEXTBOX 2");return; }
    if( o instanceof FreAction) { console.log("TEXTBOX 2");return; }
    // if( o instanceof FreActionsUtil) { console.log("TEXTBOX 2");return; }
    if( o instanceof FreClassifier) { console.log("TEXTBOX 2");return; }
    if( o instanceof FreParameter) { console.log("TEXTBOX 2");return; }
    // if( o instanceof FreCompositeProjection) { console.log("TEXTBOX 2");return; }
    if( o instanceof FreCommand) { console.log("TEXTBOX 2");return; }
    if( o instanceof FreConceptProperty) { console.log("TEXTBOX 2");return; }
    if( o instanceof FreCustomCommand) { console.log("TEXTBOX 2");return; }
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
        case FreUtils: console.log("OscillatorNode");return;
        case FreAction: console.log("OscillatorNode");return;
        // case FreActionsUtil: console.log("OscillatorNode");return;
        case FreClassifier: console.log("OscillatorNode");return;
        case FreParameter: console.log("OscillatorNode");return;
        // case FreCompositeProjection: console.log("OscillatorNode");return;
        case FreCommand: console.log("OscillatorNode");return;
        case FreConceptProperty: console.log("OscillatorNode");return;
        case FreCustomCommand: console.log("OscillatorNode");return;
        case TextBox: console.log("TEXTBOX 3");return;
    }
}
console.time("instanceof time");
// console.timeLog("instanceof time");
const t = new TextBox(null as any as FreNode,"role",() => "qwe",(v: string) => {});
one(t);
console.timeEnd("instanceof time");
console.time("switch time");
// console.timeLog("switch time");
two(t);
console.timeEnd("switch time");
