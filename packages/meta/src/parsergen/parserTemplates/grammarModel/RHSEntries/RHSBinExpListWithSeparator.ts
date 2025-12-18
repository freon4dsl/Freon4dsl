import { RHSPropEntry } from "./RHSPropEntry.js";
import type {
    FreMetaBinaryExpressionConcept,
    FreMetaProperty} from '../../../../languagedef/metalanguage/index.js';
import {
    LangUtil
} from '../../../../languagedef/metalanguage/index.js';
import { makeIndent } from "../GrammarUtils.js";
import { BinaryExpMaker } from "../../BinaryExpMaker.js";
import { Names } from "../../../../utils/on-lang/index.js";
import { internalTransformPartList, ParserGenUtil } from "../../ParserGenUtil.js";

export class RHSBinExpListWithSeparator extends RHSPropEntry {
    type: FreMetaBinaryExpressionConcept;
    private readonly separatorText: string = "";

    constructor(prop: FreMetaProperty, type: FreMetaBinaryExpressionConcept, separatorText: string) {
        super(prop);
        this.type = type;
        this.isList = true;
        this.separatorText = separatorText;
    }

    toGrammar(): string {
        return (
            `[ ${BinaryExpMaker.getBinaryRuleName(LangUtil.findExpressionBase(this.type))} / '${this.separatorText}' ]*` +
            this.doNewline()
        );
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        // TODO this method is almost equal to the one in RHSPartListWithSeparator, only baseType differs
        const baseType: string = Names.classifier(this.type);
        return `${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformPartList}<${baseType}>(${nodeName}.asJsReadonlyArrayView()[${index}], '${this.separatorText}'); // RHSBinExpListWithSeparator\n`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSBinExpListWithSeparator: " + this.property.name + ": " + this.type.name;
    }
}
