import * as classNames from "classnames";
import { observable } from "mobx";
import {
    AliasBox,
    Box,
    GridBox,
    GridCell,
    GridUtil,
    HorizontalListBox,
    KeyPressAction,
    LabelBox,
    PiEditor,
    PiElement,
    PiLogger,
    PiProjection,
    PiProjectionUtil,
    SelectBox,
    SelectOption,
    TextBox,
    VerticalListBox,
    VerticalModelElementListBox
} from "@projectit/core";
import {
    MetaConcept,
    MetaElementProperty,
    MetaElementType,
    MetaEnumeration,
    MetaEnumerationLiteral,
    MetaModel,
    MetaPrimitiveProperty,
    MetaPrimitiveType,
    MetaUtils
} from "../language/MetaModel";

const styles: {
    keyword: string;
    stringLiteral: string;
    indent: string;
    indent2: string;
    indentkeyword: string;
    mycell: string;
    mygrid: string;
} = require("../styles/style.scss");

const LOGGER = new PiLogger("MetaProjection").mute();

export const ELEMENT_LIST_ROLE = "element-list";

export type MetaProjectionType = "text" | "table" | "fulltext";

const TMP: Object = {};

export class MetaProjection implements PiProjection {
    private editor: PiEditor;
    @observable projectionType: MetaProjectionType = "text";

    constructor() {}

    setEditor(e: PiEditor) {
        this.editor = e;
    }

    getBox(exp: PiElement): Box {
        if (exp instanceof MetaConcept) {
            return this.createMetaElementBox(exp);
        } else if (exp instanceof MetaModel) {
            return this.createMetaModelBox(exp);
        } else if (exp instanceof MetaEnumeration) {
            return this.createMetaEnumerationBox(exp);
        } else if (exp instanceof MetaElementType) {
            return this.createMetaElementTypeBox(exp);
        } else if (exp instanceof MetaPrimitiveType) {
            return this.createMetaPrimitiveTypeBox(exp);
        } else if (exp instanceof MetaElementProperty) {
            return this.createMetaElementPropertyBox(exp);
        } else if (exp instanceof MetaPrimitiveProperty) {
            return this.createMetaPrimitivePropertyBox(exp);
        } else if (exp instanceof MetaEnumerationLiteral) {
            return this.createMetaEnumerationLiteral(exp);
        }

        throw new Error("No box defined for this expression:" + exp);
    }

    private createMetaElementBox2(entity: MetaConcept): Box {
        return null;
    }

    private createEntityBoxGrid(entity: MetaConcept): Box {
        return null;
    }

    // TODO Refactor row and column based collections into one generic function.
    private createAttributeGrid(entity: MetaConcept): Box {
        const cells: GridCell[] = [];
        const styleClasses: string = classNames(styles.keyword);
        cells.push({
            row: 1,
            column: 1,
            box: new LabelBox(entity, "properties-cell", "Properties", {
                style: styleClasses
            })
        });
        const grid = GridUtil.createCollectionRowGrid<MetaPrimitiveProperty>(
            entity,
            "attr-prop-grid",
            "properties",
            entity.properties,
            ["name", "type", "list?", "optional?"],
            [this.propertyNameBox, this.propertyTypeBox, this.propertyIsListBox, this.propertyIsOptionalBox],
            (box: Box, editor: PiEditor) => {
                return new MetaPrimitiveProperty();
            },
            this.editor
        );
        cells.push({
            row: 2,
            column: 1,
            box: grid
        });
        return new GridBox(entity, "attribute-grid", cells, {
            style: styles.indent
        });
    }

    propertyNameBox = (property: MetaPrimitiveProperty): Box => {
        return new TextBox(property, "textbox-name", () => property.name, (s: string) => (property.name = s), {
            deleteWhenEmpty: true,
            keyPressAction: (currentText: string, key: string, index: number) => {
                return isNameM(currentText, key, index);
            },
            placeHolder: "<name>"
        });
    };

    propertyIsListBox = (property: MetaPrimitiveProperty): Box => {
        return new SelectBox(
            property,
            "property-list",
            "<isList>",
            () => [{ id: "yes", label: "yes" }, { id: "no", label: "no" }],
            () => {
                if (property.type.isList) {
                    return { id: "yes", label: "yes" };
                } else {
                    return { id: "no", label: "no" };
                }
                return null;
            },
            option => {
                if (option.label === "yes") {
                    property.type.isList = true;
                } else if (option.label === "no") {
                    property.type.isList = false;
                }
            }
        );
    };

    propertyIsOptionalBox = (property: MetaPrimitiveProperty): Box => {
        return new SelectBox(
            property,
            "property-optional",
            "<optional>",
            () => [{ id: "yes", label: "yes" }, { id: "no", label: "no" }],
            () => {
                if (property.type.optional) {
                    return { id: "yes", label: "yes" };
                } else {
                    return { id: "no", label: "no" };
                }
                return null;
            },
            option => {
                if (option.label === "yes") {
                    property.type.optional = true;
                } else if (option.label === "no") {
                    property.type.optional = false;
                }
            }
        );
    };

    propertyTypeBox = (property: MetaPrimitiveProperty): Box => {
        return new SelectBox(
            property,
            "property-type",
            "<type>",
            () => [
                { id: "string", label: "string" },
                { id: "boolean", label: "boolean" },
                {
                    id: "number",
                    label: "number"
                }
            ],
            () => {
                if (property.type.primitive === "string") {
                    return { id: "string", label: "string" };
                } else if (property.type.primitive === "number") {
                    return { id: "number", label: "number" };
                } else if (property.type.primitive === "boolean") {
                    return { id: "boolean", label: "boolean" };
                } else if (property.type.primitive === "") {
                    return null;
                }
                return null;
            },
            option => {
                if (option.label === "string") {
                    property.type.primitive = "string";
                } else if (option.label === "number") {
                    property.type.primitive = "number";
                } else if (option.label === "boolean") {
                    property.type.primitive = "boolean";
                } else if (option.label === "") {
                    property.type.primitive = "";
                }
            }
        );
    };

    private createMetaElementBox(element: MetaConcept): Box {
        LOGGER.info(this, "createMetaElementBox: " + element.name);
        return new VerticalListBox(element, "meta-element-main", [
            new HorizontalListBox(element, "name-label", [
                new LabelBox(element, "start-element", "element", {
                    selectable: false,
                    style: styles.keyword
                }),
                PiProjectionUtil.textBox(element, "name")
            ]),
            this.projectionType === "text"
                ? new LabelBox(element, "entity-list", "properties", {
                      style: styles.indentkeyword,
                      selectable: false
                  })
                : null,
            this.createPropertiesListBox(element),
            new LabelBox(element, "element-list", "parts", {
                style: styles.indentkeyword,
                selectable: false
            }),
            new VerticalModelElementListBox(
                element,
                "parts",
                element.parts,
                "parts",
                () => new MetaElementProperty(),
                this.editor,
                {
                    roleToSelectAfterCreation: "textbox-name",
                    style: styles.indent2
                }
            ),
            new LabelBox(element, "references-list", "references", {
                style: styles.indentkeyword,
                selectable: false
            }),
            new VerticalModelElementListBox(
                element,
                "references",
                element.references,
                "references",
                () => new MetaElementProperty(),
                this.editor,
                {
                    roleToSelectAfterCreation: "textbox-name",
                    style: styles.indent2
                }
            )
        ]);
    }

    private createMetaModelBox(model: MetaModel): Box {
        switch (this.projectionType) {
            case "text":
                return this.createMetaModelBoxText(model);
            case "table":
                return this.createMetaModelBoxText(model);
            case "fulltext":
                return this.createMetaModelBoxFullText(model);
        }
    }

    private createMetaModelBoxFullText(model: MetaModel): Box {
        LOGGER.info(this, "createMetaModelBoxFullText");

        return new VerticalListBox(model, "meta-model", [
            new HorizontalListBox(model, "meta-model-keyword", [
                new LabelBox(model, "model-label", "meta model", {
                    style: styles.keyword,
                    selectable: false
                }),
                PiProjectionUtil.textBox(model, "name")
            ]),
            new AliasBox(model, "any-list", "<add element>"),
            new VerticalModelElementListBox(
                model,
                "elements",
                model.elements,
                "elements",
                () => new MetaConcept(),
                this.editor,
                {
                    roleToSelectAfterCreation: "property",
                    style: styles.indent
                }
            )
        ]);
    }

    private createMetaModelBoxText(model: MetaModel): Box {
        LOGGER.info(this, "createMetaModelBox");

        return new VerticalListBox(model, "meta-model", [
            new HorizontalListBox(model, "meta-model-keyword", [
                new LabelBox(model, "model-label", "meta model", {
                    style: styles.keyword,
                    selectable: false
                }),
                PiProjectionUtil.textBox(model, "name")
                // new TextBox(model, "text-box-name",
                //     () => model.name,
                //     (c: string) => model.name = c)
            ]),
            // this.textbox(model, "name"),
            new LabelBox(model, "entity-list", "elements", {
                style: styles.keyword,
                selectable: false
            }),
            new VerticalModelElementListBox(
                model,
                "elements",
                model.elements,
                "elements",
                () => new MetaConcept(),
                this.editor,
                {
                    roleToSelectAfterCreation: "property",
                    // selectable: false,
                    style: styles.indent
                }
            ),
            new LabelBox(model, "enumerations", "enumerations", {
                style: styles.keyword,
                selectable: false
            })
        ]);
    }

    private createPropertiesListBox(element: MetaConcept) {
        switch (this.projectionType) {
            case "table":
                return this.createAttributeGrid(element);
            case "text":
                return new VerticalModelElementListBox(
                    element,
                    "properties",
                    element.properties,
                    "properties",
                    () => new MetaPrimitiveProperty(),
                    this.editor,
                    { roleToSelectAfterCreation: "textbox-name", style: styles.indent2 }
                );
        }
    }

    private createMetaEnumerationBox(enumeration: MetaEnumeration): Box {
        return new HorizontalListBox(enumeration, "meta-enumeration-main", [
            new LabelBox(enumeration, "enum-keyword", "enumeration", {
                style: styles.keyword,
                selectable: false
            }),
            PiProjectionUtil.textBox(enumeration, "name"),
            new LabelBox(enumeration, "open", "{", {
                style: styles.stringLiteral,
                selectable: false
            }),
            new VerticalModelElementListBox(
                enumeration,
                "literals",
                enumeration.literals,
                "literals",
                () => new MetaEnumerationLiteral(),
                this.editor,
                {
                    roleToSelectAfterCreation: "textbox-name"
                    // showPlaceholder: false
                }
            ),
            new LabelBox(enumeration, "open", "}", {
                style: styles.stringLiteral,
                selectable: false
            })
        ]);
    }

    private createMetaPrimitivePropertyBox(property: MetaPrimitiveProperty): Box {
        return new HorizontalListBox(property, "meta-element-main", [
            this.propertyNameBox(property),
            new LabelBox(property, "property-colon", " : ", {
                style: styles.keyword,
                selectable: false
            }),
            this.propertyTypeBox(property),
            PiProjectionUtil.booleanBox(property.type, "property-list", "isList", {
                yes: "list",
                no: "single"
            }),
            new LabelBox(property, "property-optional-keyword", "optional:", {
                style: styles.keyword,
                selectable: false
            }),
            this.propertyIsOptionalBox(property)
        ]);
    }

    // references for now
    public createMetaElementPropertyBox(property: MetaElementProperty): Box {
        return new HorizontalListBox(property, "meta-element-property-main", [
            PiProjectionUtil.textBox(property, "name"),
            new LabelBox(property, "reference-colon", ":", {
                style: styles.keyword,
                selectable: false
            }),
            new SelectBox(
                property,
                "element-type",
                "<type>",
                () => this.elementTypeOptions(property),
                () => {
                    return null;
                },
                option => {}
            )
        ]);
    }

    private elementTypeOptions(elProp: MetaElementProperty): SelectOption[] {
        return MetaUtils.metaModel(elProp).elements.map(e => {
            return { label: e.name, id: e.name };
        });
    }

    private createMetaElementTypeBox(literal: MetaElementType): Box {
        return new LabelBox(literal, "enum-keyword", "element type");
    }

    private createMetaEnumerationLiteral(literal: MetaEnumerationLiteral): Box {
        return PiProjectionUtil.textBox(literal, "name");
    }

    private createMetaPrimitiveTypeBox(literal: MetaPrimitiveType): Box {
        return new LabelBox(literal, "enum-keyword", "primitive type");
    }
}

function isNumberM(currentText: string, key: string, index: number): KeyPressAction {
    if (isNaN(Number(key))) {
        if (index === currentText.length) {
            return KeyPressAction.GOTO_NEXT;
        } else {
            return KeyPressAction.NOT_OK;
        }
    } else {
        return KeyPressAction.OK;
    }
}

function isNameM(currentText: string, key: string, index: number): KeyPressAction {
    LOGGER.log("IsName key[" + key + "]");
    if (key === "Enter") {
        if (index === currentText.length) {
            return KeyPressAction.GOTO_NEXT;
        } else {
            return KeyPressAction.NOT_OK;
        }
    } else {
        return KeyPressAction.OK;
    }
}
