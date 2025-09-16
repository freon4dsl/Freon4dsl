import { Names, FREON_CORE, Imports, Roles } from "../../../utils/on-lang/index.js"
import {
    FreMetaLanguage,
    FreMetaBinaryExpressionConcept,
    FreMetaClassifier,
    FreMetaProperty,
    FreMetaPrimitiveType,
} from "../../../languagedef/metalanguage/index.js";
import { FreEditNormalProjection, FreEditUnit, FreOptionalPropertyProjection } from "../../metalanguage/index.js";

export class DefaultActionsTemplate {
    generate(language: FreMetaLanguage, editorDef: FreEditUnit, relativePath: string): string {
        const imports = new Imports(relativePath)
        imports.language = new Set<string>([
            ...language.conceptsAndInterfaces().map((c) => Names.classifier(c)),
            ...language.units.map((u) => Names.classifier(u))
        ])
        imports.core = new Set<string>([
            "AFTER_BINARY_OPERATOR",
            "BEFORE_BINARY_OPERATOR",
            Names.Box,
            "MetaKey",
            Names.FreActions,
            Names.FreCreateBinaryExpressionAction,
            "FreCaret",
            Names.FreCustomAction,
            Names.FreEditor,
            Names.FreNode,
            Names.FreBinaryExpression,
            "FreKey",
            "FreLogger",
            Names.FreTriggerType,
            "ActionBox",
            "OptionalBox",
            Names.FreNodeReference,
            "LEFT_MOST",
            "RIGHT_MOST"
        ])
        return `
            // TEMPLATE: DefaultActionsTemplate.generate(...)
            import * as Keys from "${FREON_CORE}";
            ${imports.makeImports(language)}

             /**
             * This module implements the actions available to the user in the editor.
             * These are the default actions. They are merged with the default and
             * custom editor parts in a three-way manner. For each node,
             * (1) if a custom build creator/behavior is present, this is used,
             * (2) if a creator/behavior based on the editor definition is present, this is used,
             * (3) if neither (1) nor (2) yields a result, the default is used.
             */
            export const BINARY_EXPRESSION_CREATORS: ${Names.FreCreateBinaryExpressionAction}[] = [
                ${language.concepts
                    .filter((c) => c instanceof FreMetaBinaryExpressionConcept && !c.isAbstract)
                    .map((c) =>
                        !!editorDef.findExtrasForType(c)
                            ? `${Names.FreCreateBinaryExpressionAction}.create({
                        trigger: "${editorDef.findExtrasForType(c)!.symbol}",
                        activeInBoxRoles: [
                            LEFT_MOST,
                            RIGHT_MOST,
                            BEFORE_BINARY_OPERATOR,
                            AFTER_BINARY_OPERATOR
                        ],
                        expressionBuilder: (box: Box, trigger: ${Names.FreTriggerType}, editor: ${Names.FreEditor}) => {
                            const parent = box.node;
                            const newExpression = new ${Names.concept(c)}();
                            // @ts-ignore: we use a generic manner to create the right property
                            parent[(box as ActionBox).propertyName] = newExpression;
                            return newExpression;
                        }
                })`
                            : `${Names.FreCreateBinaryExpressionAction}.create({
                        trigger: "unknown-trigger",
                        activeInBoxRoles: [
                            LEFT_MOST,
                            RIGHT_MOST,
                            BEFORE_BINARY_OPERATOR,
                            AFTER_BINARY_OPERATOR
                        ],
                        expressionBuilder: (box: Box, trigger: ${Names.FreTriggerType}, editor: ${Names.FreEditor}) => {
                            const parent = box.node;
                            const newExpression = new ${Names.concept(c)}();
                            // @ts-ignore: we use a generic manner to create the right property
                            parent[(box as ActionBox).propertyName] = newExpression;
                            return newExpression;
                        }
                })`,
                    )}
            ];

            export const CUSTOM_ACTIONS: ${Names.FreCustomAction}[] = [
                ${this.customActionsForOptional(editorDef)}
                ${this.customActionForParts(language, editorDef)}
                ${this.customActionForReferences(language, editorDef)}
            ];
            `;
    }

    private customActionsForOptional(editorDef: FreEditUnit): string {
        let result: string = "";
        editorDef.getDefaultProjectiongroup()?.projections.forEach((projection) => {
            if (!!projection && projection instanceof FreEditNormalProjection) {
                projection.lines.forEach((line) => {
                    line.items.forEach((item) => {
                        if (item instanceof FreOptionalPropertyProjection && !!item.property) {
                            const firstLiteral: string = item.firstLiteral();
                            const myClassifier: FreMetaClassifier | undefined = projection.classifier?.referred;
                            const prop: FreMetaProperty = item.property.referred;
                            const optionalPropertyName = prop.name;
                            // end change
                            let rolename: string = "unknown role";
                            if (!!myClassifier) {
                                if (prop.isPart) {
                                    // TODO Check for lists (everywhere)
                                    rolename = Roles.propertyRole(myClassifier.name, optionalPropertyName);
                                } else if (prop.isPrimitive) {
                                    if (prop.type === FreMetaPrimitiveType.number) {
                                        rolename = Roles.propertyRole(
                                            myClassifier.name,
                                            optionalPropertyName,
                                            "numberbox",
                                        );
                                    } else if (prop.type === FreMetaPrimitiveType.string) {
                                        rolename = Roles.propertyRole(
                                            myClassifier.name,
                                            optionalPropertyName,
                                            "textbox",
                                        );
                                    } else if (prop.type === FreMetaPrimitiveType.boolean) {
                                        rolename = Roles.propertyRole(
                                            myClassifier.name,
                                            optionalPropertyName,
                                            "booleanbox",
                                        );
                                    }
                                } else {
                                    // reference
                                    if (prop.isList) {
                                        rolename = Roles.propertyRole(
                                            myClassifier.name,
                                            optionalPropertyName,
                                            "new-list-item"
                                        )
                                    } else {
                                        rolename = Roles.propertyRole(
                                            myClassifier.name,
                                            optionalPropertyName,
                                            "referencebox",
                                        );
                                    }
                                }
                            }
                            result += `${Names.FreCustomAction}.create(
                                    {
                                        trigger: "${firstLiteral === "" ? optionalPropertyName : firstLiteral}",
                                        activeInBoxRoles: ["optional-${optionalPropertyName}"],
                                        action: (box: Box, trigger: ${Names.FreTriggerType}, ed: ${Names.FreEditor}): ${Names.FreNode} | null => {
                                            ((box.parent) as OptionalBox).mustShow = true;
                                            return box.node;
                                        },
                                        boxRoleToSelect: "${rolename}"
                                    })`;
                            result += ",";
                        }
                    });
                });
            }
        });
        return result;
    }

    customActionForReferences(language: FreMetaLanguage, editorDef: FreEditUnit): string {
        let result = "";
        const allClassifiers: FreMetaClassifier[] = [];
        allClassifiers.push(...language.units);
        allClassifiers.push(...language.concepts);
        allClassifiers.forEach((concept) =>
            concept
                .allReferences()
                .filter((ref) => ref.isList)
                .forEach((reference) => {
                    const referredConcept = reference.type;
                    const extras = editorDef.findExtrasForType(referredConcept);
                    const trigger = !!extras && !!extras.trigger ? extras.trigger : reference.name;
                    result += `${Names.FreCustomAction}.create(
                {   // Action to insert new reference to a concept
                    activeInBoxRoles: ["${Roles.newConceptReferencePart(reference)}"],
                    trigger: "${trigger}",
                    action: (box: Box, trigger: ${Names.FreTriggerType}, ed: ${Names.FreEditor}): ${Names.FreNode} | null => {
                        const parent: ${Names.classifier(concept)} = box.node as ${Names.classifier(concept)};
                        const newBase: ${Names.FreNodeReference}<${Names.classifier(referredConcept)}> = ${Names.FreNodeReference}.create<${Names.classifier(referredConcept)}>("", null);
                        parent.${reference.name}.push(newBase);
                        return newBase.referred;
                    }
                })
                `;
                    result += ",";
                }),
        );
        return result;
    }

    // @ts-expect-error
    // error TS6133: 'language' is declared but its value is never read.
    // error TS6133: 'editorDef' is declared but its value is never read.
    // This error is ignored because ... todo remove parameters or implement this function
    customActionForParts(language: FreMetaLanguage, editorDef: FreEditUnit): string {
        // Nothing to do for the moment
        return "";
    }
}
