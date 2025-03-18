import { RHSPropEntry } from "./RHSPropEntry.js";
import {FreMetaPrimitiveProperty, FreMetaPrimitiveType} from "../../../../languagedef/metalanguage/index.js";
import { getPrimCall, makeIndent } from "../GrammarUtils.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";

export class RHSPrimEntry extends RHSPropEntry {
    constructor(prop: FreMetaPrimitiveProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${getPrimCall(this.property.type)}` + this.doNewline();
    }

    toMethod(index: number, nodeName: string): string {
        let regExpAddition: string = '';
        let regExpComment: string = '';
        if (this.property.type === FreMetaPrimitiveType.string) {
            // todo make sure we remove only the outer quotes
            regExpAddition = '.replace(/"/g, \'\')'
            regExpComment = '// The regular expression removes the quotes that the parser adds around strings.\n';
        }
        return `${regExpComment}${ParserGenUtil.internalName(this.property.name)} = ${nodeName}.asJsReadonlyArrayView()[${index}]${regExpAddition}; // RHSPrimEntry\n`;
    }

    toString(depth: number): string {
        const indent: string = makeIndent(depth);
        return indent + "RHSPrimEntry: " + this.property.name;
    }
}
