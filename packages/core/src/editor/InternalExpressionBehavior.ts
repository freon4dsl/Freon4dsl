// import { action, makeObservable } from "mobx";
// import { PiElement } from "../language/PiElement";
// import { PiExpression } from "../language/PiExpression";
// import { isPiExpression } from "../language/LanguageUtil";
// import { PiLogger } from "../util/PiLogging";
// import { PiUtils } from "../util/PiUtils";
// import { Box } from "./boxes/Box";
// // import { InternalBehavior } from "./InternalBehavior";
// // import { PiExpressionCreator, PiTriggerType } from "./PiAction";
// import { PiEditor } from "./PiEditor";
//
// const LOGGER = new PiLogger("InternalExpressionBehavior");
// //
// // export class InternalExpressionBehavior extends InternalBehavior implements PiExpressionCreator {
// //     expressionBuilder: (box: Box, text: string, editor: PiEditor) => PiExpression;
// //
// //     constructor(initializer?: Partial<InternalExpressionBehavior>) {
// //         super();
// //         PiUtils.initializeObject(this, initializer);
// //         makeObservable(this, {
// //             execute: action
// //         });
// //     }
// //
// //     execute(box: Box, text: string, editor: PiEditor): PiElement | null {
// //         LOGGER.info(this, "execute expression alias ok");
// //         const selected = this.expressionBuilder(box, text, editor);
// //         PiUtils.CHECK(isPiExpression(selected), "execute: expecting new element to be a PiExpression");
// //         editor.selectElement(selected, this.boxRoleToSelect, this.caretPosition);
// //         return selected;
// //     }
// //
// //     undo(box: Box, editor: PiEditor): void {
// //         console.error("InternalExpressionBehavior.undo is empty")
// //     }
// //
// // }
// //
