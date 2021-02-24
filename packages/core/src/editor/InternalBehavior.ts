import { action } from "mobx";

import { PiCustomBehavior, PiBehavior, PiTriggerType, PiBinaryExpressionCreator, PiExpressionCreator } from "./PiAction";
import { isPiExpression, PiElement, PiExpression, PiBinaryExpression } from "../language/PiModel";
import { Box } from "./boxes/Box";
import { PiEditor } from "../editor/PiEditor";
import { PiCaret } from "../util/BehaviorUtils";
import { BTREE } from "../util/BalanceTreeUtils";
import { PiLogger } from "../util/PiLogging";
import { PiUtils } from "../util/PiUtils";

const LOGGER = new PiLogger("InternalBehavior");

export abstract class InternalBehavior implements PiBehavior {
    trigger: PiTriggerType;

    /**
     * The box roles in which this alias is active
     */
    activeInBoxRoles: string[] = [];

    isRegexp: boolean;

    /**
     * Optional callback function that returns whether the alias is applicable for the specific box.
     */
    isApplicable?: (box: Box) => boolean;

    /**
     *
     */
    boxRoleToSelect?: string;

    /**
     *
     */
    caretPosition?: PiCaret;

    abstract execute(box: Box, aliasId: string, editor: PiEditor);
}

export class InternalBinaryBehavior extends InternalBehavior implements PiBinaryExpressionCreator {
    expressionBuilder: (box: Box, aliasId: PiTriggerType, editor: PiEditor) => PiBinaryExpression;

    constructor(initializer?: Partial<InternalBinaryBehavior>) {
        super();
        PiUtils.initializeObject(this, initializer);
    }

    @action
    async execute(box: Box, aliasId: string, editor: PiEditor) {
        LOGGER.info(this, "execute binary expression alias ok");
        const selected = BTREE.insertBinaryExpression(this.expressionBuilder(box, aliasId, editor), box, editor);
        await editor.selectElement(selected.element, selected.boxRoleToSelect, this.caretPosition);
    }
}

export class InternalExpressionBehavior extends InternalBehavior implements PiExpressionCreator {
    expressionBuilder: (box: Box, aliasId: PiTriggerType, editor: PiEditor) => PiExpression;

    constructor(initializer?: Partial<InternalExpressionBehavior>) {
        super();
        PiUtils.initializeObject(this, initializer);
    }

    @action
    async execute(box: Box, aliasId: string, editor: PiEditor) {
        LOGGER.info(this, "execute expression alias ok");
        const selected = this.expressionBuilder(box, aliasId, editor);
        PiUtils.CHECK(isPiExpression(selected), "execute: expecting new element to be a PiExpression");
        await editor.selectElement(selected, this.boxRoleToSelect, this.caretPosition);
    }
}

export class InternalCustomBehavior extends InternalBehavior implements PiCustomBehavior {
    action: (box: Box, aliasId: PiTriggerType, editor: PiEditor) => PiElement | null;

    constructor(initializer?: Partial<InternalCustomBehavior>) {
        super();
        PiUtils.initializeObject(this, initializer);
    }

    @action
    async execute(box: Box, aliasId: string, editor: PiEditor) {
        LOGGER.info(this, "execute custom alias ok");
        const selected = this.action(box, aliasId, editor);
        if (selected) {
            await editor.selectElement(selected, this.boxRoleToSelect, this.caretPosition);
        }
    }
}
