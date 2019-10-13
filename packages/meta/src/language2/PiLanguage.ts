/**
 * This file defined the structure of a language definition, as it can be used by ProjectIt.
 * There is no behavior attached,  so it can serve as a JSON interchange format.
 */
export interface PiLanguageProperty {
    name: string;
    type: string
    isList?: boolean
}

export interface PiLanguageElementProperty {
    name: string;
    type: PiConceptReference;
    isList?: boolean
}

export type PiConceptReference = string;

export interface PiConcept {
    name: string;
    properties: PiLanguageProperty[];
    parts: PiLanguageElementProperty[];
    references: PiLanguageElementProperty[];
    base?: PiConceptReference;
    isExpression?: boolean;
    isBinaryExpression?: boolean;
}

export interface PiEnumeration {
    name: string;
    literals: PiEnumerationLiteral[]
}

export interface PiEnumerationLiteral {
    name: string;
}

export interface PiLanguage {
    name: string;
    concepts: PiConcept[];
    enumerations?: PiEnumeration[];
}

export var piLanguage: PiLanguage;
piLanguage = {
    name: "Demo",
    concepts: [
        {
            name: "DemoModel",
            properties: [
                {
                    name: "name",
                    type: "string"
                }
            ],
            parts: [
                {
                    name: "entitites",
                    isList: true,
                    type: "DemoEntity"
                },
                {
                    name: "functions",
                    isList: true,
                    type: "DemoFunction"
                }
            ],
            references: []
        },
        {
            name: "DemoEntity",
            properties: [
                {
                    name: "name",
                    type: "string"
                }
            ],
            parts: [
                {
                    name: "attributes",
                    type: "DemoAttribute",
                    isList: true
                }
            ],
            references: []
        },
        {
            name: "DemoFunction",
            properties: [
                {
                    name: "name",
                    type: "string"
                },
            ],
            parts: [
                {
                    name: "expression",
                    type: "DemoExpression"
                }
            ],
            references: [
                {
                    name: "parameters",
                    type: "DemoVariable",
                    isList: true
                }
            ]
        },
        {
            name: "DemoAttribute",
            properties: [
                {
                    name: "name",
                    type: "string",
                    isList: false,
                },
                {
                    name: "type",
                    type: "DemoAttributeType",
                    isList: false,
                },
            ],
            parts: [],
            references: []
        },
        {
            name: "DemoVariable",
            properties: [
                {
                    name: "name",
                    type: "string"
                },
                {
                    name: "type",
                    type: "DemoAttributeType"
                }
            ],
            parts: [],
            references: []
        },
        {
            name: "DemoExpression",
            properties: [
                {
                    name: "text",
                    type: "string"
                }
            ],
            parts: [],
            references: [],
            isExpression: true
        },
        {
            name: "DemoLiteralExpression",
            base: "DemoExpression",
            properties: [],
            parts:  [],
            references: []
        },
        {
            name: "DemoStringLiteralExpression",
            base: "DemoLiteralExpression",
            properties: [
                {
                    name: "value",
                    type: "string"
                }
            ],
            parts: [],
            references: []
        },
        {
            name: "DemoNumberLiteralExpression",
            base: "DemoLiteralExpression",
            properties: [
                {
                    name: "value",
                    type: "string"
                }
            ],
            parts: [],
            references: []
        },
        {
            name: "DemoAbsExpression",
            base: "DemoExpression",
            properties: [],
            parts: [
                {
                    name: "expr",
                    type: "DemoExpression"
                }
            ],
            references: []
        },
        {
            name: "DemoBinaryExpression",
            base: "DemoExpression",
            properties: [
                {
                name: "symbol",
                type: "string"
                }
            ],
            parts: [
                {
                    name: "left",
                    type: "DemoExpression"
                },
                {
                    name: "right",
                    type: "DemoExpression"
                }
            ],
            references: []
        },
        {
            name: "DemoMultiplyExpression",
            base: "DemoBinaryExpression",
            properties: [],
            parts: [],
            references: []
        }
    ],
    enumerations: [
        {
            name: "DemoAttributeType",
            literals: [
                {
                    name: "String"
                },
                {
                    name: "Boolean"
                },
                {
                    name: "Integer"
                }
            ]
        }
    ]
};

