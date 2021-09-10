import { PiBehavior, PiTriggerType } from "./PiAction";
import { Box } from "./internal";
import { PiEditor } from "./internal";
import { PiCaret } from "../util";

export type ReferenceShortcut = {
    propertyname: string;
    metatype: string;
}

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

    referenceShortcut?: ReferenceShortcut;
}

