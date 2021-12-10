import { RHSPropEntry } from "./RHSPropEntry";
import { RightHandSideEntry } from "./RightHandSideEntry";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { makeIndent } from "../GrammarUtils";

export class RHSOptionalGroup extends RHSPropEntry {
    private subs: RightHandSideEntry[] = [];

    constructor(prop: PiProperty, subs: RightHandSideEntry[]) {
        super(prop);
        this.subs = subs;
    }

    toGrammar(): string {
        if (this.subs.length > 1) {
            return `( ${this.subs.map(sub => `${sub.toGrammar()}`).join(" ")} )?\n\t`;
        } else if (this.subs.length === 1) {
            const first = this.subs[0];
            if (first.isList) {
                return `${first.toGrammar()}` + this.doNewline(); // no need for the extra '?'
            } else {
                return `${first.toGrammar()}?` + this.doNewline();
            }
        }
        return "";
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        if (this.subs.length > 1) {
            return `            
            if (!${nodeName}[${index}].isEmptyMatch) { // RHSOptionalGroup
                const _optGroup = this.${mainAnalyserName}.getGroup(${nodeName}[${index}]).nonSkipChildren.toArray();` + // to avoid an extra newline
                `${this.subs.map((sub, index2) => `${sub.toMethod(index2, "_optGroup", mainAnalyserName)}`).join("\n")}
            }`;
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
        let indent = makeIndent(depth);
        return indent + "RHSOptionalGroup: " + indent + this.subs.map(sub => sub.toString(depth + 1)).join(indent);
    }
}
