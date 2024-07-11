import { FreEditProjection, FreEditProjectionGroup, FreEditUnit } from "../../editordef/metalanguage";
import { EditorDefaults } from "../../editordef/metalanguage/EditorDefaults";
import { FreMetaBinaryExpressionConcept, FreMetaClassifier, FreMetaExpressionConcept } from "../../languagedef/metalanguage";
import { GenerationUtil } from "../../utils";

export class ParserGenUtil {

    // find all expression bases for all binaries
    static findAllExpressionBases(list: FreMetaBinaryExpressionConcept[]): FreMetaExpressionConcept[] {
        const bases: FreMetaExpressionConcept[] = [];
        list.forEach(impl => {
            const expBase = GenerationUtil.findExpressionBase(impl as FreMetaBinaryExpressionConcept);
            if (bases.indexOf(expBase) === -1) {
                // add if not present
                bases.push(expBase);
            }
        });
        return bases;
    }

    /**
     * Returns either the projection group named 'parser' ot, if that one is not present,
     * the default projection group.
     *
     * @param editUnit the edit definition to serach for the projection groups
     */
    static findParsableProjectionGroup(editUnit: FreEditUnit) {
        let projectionGroup: FreEditProjectionGroup | undefined = editUnit.projectiongroups.find(g => g.name === EditorDefaults.parserGroupName);
        if (!projectionGroup) {
            projectionGroup = editUnit.getDefaultProjectiongroup();
        }
        return projectionGroup;
    }

    static findNonTableProjection(projectionGroup: FreEditProjectionGroup, classifier: FreMetaClassifier, projectionName?: string): FreEditProjection | undefined {
        let myGroup: FreEditProjectionGroup | undefined = projectionGroup;
        // take care of named projections: search the projection group with the right name
        if (!!projectionName && projectionName.length > 0) {
            if (projectionGroup.name !== projectionName) {
                myGroup = projectionGroup.owningDefinition?.projectiongroups.find(group => group.name === projectionName);
            }
        }
        let myProjection: FreEditProjection | undefined = undefined;
        if (!!myGroup) {
            myProjection = myGroup.findNonTableProjectionForType(classifier);
            if (!myProjection && projectionGroup !== myGroup) { // if not found, then try my 'own' projection group
                myProjection = projectionGroup.findNonTableProjectionForType(classifier);
            }
        }
        if (!myProjection) { // still not found, try the default group
            myProjection = projectionGroup.owningDefinition?.getDefaultProjectiongroup()?.findNonTableProjectionForType(classifier);
        }
        return myProjection;
    }

    /**
     * Creates a name to be used internally in the parser/unparser, to avoid name classes with user
     * defined names.
     * @param nameFromAst
     */
    static internalName(nameFromAst: string) {
        return `__${nameFromAst}`;
    }

    /**
     * Creates a comment from the grammar rule 'rule'.
     * @param rule
     */
    static makeComment (rule: string): string {
        rule = rule.replace(new RegExp("\n", "gm") , "\n\t*");
        rule = rule.replace(new RegExp("/\\*", "gm") , "--");
        rule = rule.replace(new RegExp("\\*/", "gm") , "--");
        return `/**
             * Method to transform branches that match the following rule:
             * ${rule}
             * @param branch
             * @private
             */`;
    }

    static escapeRelevantChars(input: string): string {
        // See also BasicGrammar.part.pegjs
        // Note that the order of these chars is relevant! Always put "\\" first.
        const regexSpecialCharacters = [
            "\"", "\'", "/", "{"
            // "\\", ".", "+", "*", "?",
            // "[", "]", "$", "(", "^",
            // ")",  "}", "=", "!",
            // "<", ">", "|", ":", "-"
        ];

        regexSpecialCharacters.forEach(rgxSpecChar =>
            input = input.replace(new RegExp("\\" + rgxSpecChar, "gm"), "\\" + rgxSpecChar));
        return input;
    }
}

export const internalTransformNode = "transformSharedPackedParseTreeNode";
export const internalTransformList = "transformSharedPackedParseTreeList";
export const internalTransformRefList = "transformSharedPackedParseTreeRefList";
export const internalTransformLeaf = "transformSharedPackedParseTreeLeaf";
export const internalTransformBranch = "transformSharedPackedParseTreeBranch";
export const internalTransformFreNodeRef = "freNodeRef";
