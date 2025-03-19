import { FreEditNormalProjection, FreEditProjectionGroup, FreEditUnit } from "../../editordef/metalanguage/index.js";
import { EditorDefaults } from "../../editordef/metalanguage/EditorDefaults.js";
import {
    FreMetaBinaryExpressionConcept,
    FreMetaClassifier,
    FreMetaExpressionConcept,
} from "../../languagedef/metalanguage/index.js";
import { GenerationUtil } from "../../utils/index.js";

export class ParserGenUtil {
    // find all expression bases for all binaries
    static findAllExpressionBases(list: FreMetaBinaryExpressionConcept[]): FreMetaExpressionConcept[] {
        const bases: FreMetaExpressionConcept[] = [];
        list.forEach((impl) => {
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
        const parserProjectionGroup: FreEditProjectionGroup | undefined = editUnit.projectiongroups.find(
            (g) => g.name === EditorDefaults.parserGroupName
        );
        const defaultProjectionGroup = editUnit.getDefaultProjectiongroup();
        return ParserGenUtil.joinProjectionGroups(parserProjectionGroup, defaultProjectionGroup);
    }

    /**
     * Join the parser projection with the default projection for generating a (un)parser
     * @param parserProjection
     * @param defaultProjection
     * @private
     */
    private static joinProjectionGroups(parserProjection: FreEditProjectionGroup | undefined, defaultProjection: FreEditProjectionGroup | undefined): FreEditProjectionGroup | undefined {
        if (parserProjection === undefined) {
            return defaultProjection;
        }
        if (defaultProjection === undefined) {
            return undefined;
        }
        const projection = new FreEditProjectionGroup();
        projection.name = defaultProjection.name
        projection.globalProjections = defaultProjection.globalProjections;
        projection.extras = defaultProjection.extras;
        projection.owningDefinition = (!!parserProjection.owningDefinition ? parserProjection.owningDefinition : defaultProjection.owningDefinition);
        projection.aglParseLocation = (!!parserProjection.aglParseLocation ? parserProjection.aglParseLocation : defaultProjection.aglParseLocation);
        projection.location = (!!parserProjection.location ? parserProjection.location : defaultProjection.location);

        parserProjection.projections.forEach(p => {
            projection.projections.push(p)  
        } )
        defaultProjection.projections.forEach(defaultProj => {
            const found = parserProjection.projections.find(existingProj =>
                existingProj.classifier?.referred === defaultProj.classifier?.referred);
            if (found === undefined) {
               projection.projections.push(defaultProj);
            }
        });
        return projection;
    }

    static findNonTableProjection(
        projectionGroup: FreEditProjectionGroup,
        classifier: FreMetaClassifier,
        projectionName?: string,
    ): FreEditNormalProjection | undefined {
        let myGroup: FreEditProjectionGroup | undefined = projectionGroup;
        // take care of named projections: search the projection group with the right name
        if (!!projectionName && projectionName.length > 0) {
            if (projectionGroup.name !== projectionName) {
                myGroup = projectionGroup.owningDefinition?.projectiongroups.find(
                    (group) => group.name === projectionName,
                );
            }
        }
        let myProjection: FreEditNormalProjection | undefined = undefined;
        if (!!myGroup) {
            myProjection = myGroup.findNonTableProjectionForType(classifier);
            if (!myProjection && projectionGroup !== myGroup) {
                // if not found, then try my 'own' projection group
                myProjection = projectionGroup.findNonTableProjectionForType(classifier);
            }
        }
        if (!myProjection) {
            // still not found, try the default group
            myProjection = projectionGroup.owningDefinition
                ?.getDefaultProjectiongroup()
                ?.findNonTableProjectionForType(classifier);
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
    static makeComment(rule: string): string {
        rule = rule.replace(new RegExp("\n", "gm"), "\n\t*");
        rule = rule.replace(new RegExp("/\\*", "gm"), "--");
        rule = rule.replace(new RegExp("\\*/", "gm"), "--");
        return `/**
             * Method to transform branches that match the following rule:
             * ${rule}
             * @param nodeInfo
             * @param children
             * @param sentence
             */`;
    }

    static escapeRelevantChars(input: string): string {
        // See also BasicGrammar.part.pegjs
        // Note that the order of these chars is relevant! Always put "\\" first.
        const regexSpecialCharacters = [
            '"',
            "'",
            "/",
            "{",
            // "\\", ".", "+", "*", "?",
            // "[", "]", "$", "(", "^",
            // ")",  "}", "=", "!",
            // "<", ">", "|", ":", "-"
        ];

        regexSpecialCharacters.forEach(
            (rgxSpecChar) => (input = input.replace(new RegExp("\\" + rgxSpecChar, "gm"), "\\" + rgxSpecChar)),
        );
        return input;
    }
}

export const internalTransformNode = "transformSharedPackedParseTreeNode";
export const internalTransformPrimValue = "transformPrimitiveValue";
export const internalTransformPartList = "transformPartList";
export const internalTransformPrimList = "transformPrimList";
export const internalTransformRefList = "transformRefList";
export const internalTransformFreNodeRef = "freNodeRef";
