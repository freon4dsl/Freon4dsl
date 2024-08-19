import { RHSPropEntry } from "./RHSPropEntry.js";
import { RightHandSideEntry } from "./RightHandSideEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { makeIndent } from "../GrammarUtils.js";
import { RHSBooleanWithSingleKeyWord } from "./RHSBooleanWithSingleKeyWord.js";

export class RHSOptionalGroup extends RHSPropEntry {
    private readonly subs: RightHandSideEntry[] = [];
    private propIndex: number = 0; // the index of the property in this optional group

    constructor(prop: FreMetaProperty, subs: RightHandSideEntry[], propIndex: number) {
        super(prop);
        this.subs = subs;
        this.propIndex = propIndex;
    }

    toGrammar(): string {
        if (this.subs.length > 1) {
            // no need for newline between subs and closing ')?'
            return `( ${this.subs
                .map((sub) => `${sub.toGrammar()}`)
                .join(" ")
                .trimEnd()} )?\n\t`;
        } else if (this.subs.length === 1) {
            const first = this.subs[0];
            if (first.isList || first instanceof RHSBooleanWithSingleKeyWord) {
                return `${first.toGrammar()}` + this.doNewline(); // no need for the extra '?'
            } else {
                return `${first.toGrammar()}?` + this.doNewline();
            }
        }
        return "";
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        if (this.subs.length > 1) {
            return (
                `
            if (!${nodeName}[${index}].isEmptyMatch) { // RHSOptionalGroup
                const _optGroup = this.${mainAnalyserName}.getGroup(${nodeName}[${index}]);` + // to avoid an extra newline
                `const _propItem = this.${mainAnalyserName}.getChildren(_optGroup);` +
                `${this.subs.map((sub) => `${sub.toMethod(this.propIndex, "_propItem", mainAnalyserName)}`).join("\n")}
            }`
            );
        } else if (this.subs.length === 1) {
            const first = this.subs[0];
            if (first.isList) {
                return `
                    if (!${nodeName}[${index}].isEmptyMatch) { // RHSOptionalGroup
                        ${first.toMethod(index, nodeName, mainAnalyserName)}
                    }`;
            } else {
                return `
                    if (!${nodeName}[${index}].isEmptyMatch) { // RHSOptionalGroup
                        const _optBranch = this.${mainAnalyserName}.getChildren(${nodeName}[${index}]);
                        ${first.toMethod(0, "_optBranch", mainAnalyserName)}
                    }`;
            }
        }
        return `// ERROR no elements within optional group`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSOptionalGroup: " + indent + this.subs.map((sub) => sub.toString(depth + 1)).join(indent);
    }
}
