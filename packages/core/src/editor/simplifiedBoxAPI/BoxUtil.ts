import type { FreNamedNode, FreNode } from '../../ast/index.js';
import {
    BoolDisplay,
    BooleanWrapperBox,
    Box,
    BoxFactory,
    ButtonBox,
    EmptyLineBox,
    BooleanReplacerBox,
    NumberReplacerBox,
    PartReplacerBox,
    PartListReplacerBox,
    RefReplacerBox,
    RefListReplacerBox,
    StringReplacerBox,
    FragmentWrapperBox,
    HorizontalListBox,
    IndentBox,
    LabelBox,
    LimitedControlBox,
    LimitedDisplay,
    NumberDisplay,
    type NumberDisplayInfo,
    NumberWrapperBox,
    PartListWrapperBox,
    PartWrapperBox,
    ReferenceBox,
    RefListWrapperBox,
    RefWrapperBox,
    SelectBox,
    StringWrapperBox,
    TextBox,
    VerticalListBox
} from '../boxes/index.js';
import type { FreScoper } from "../../scoper/index.js";
import { RoleProvider } from "./RoleProvider.js";
import { FreProjectionHandler } from "../projections/index.js";
import { UtilPrimHelper } from "./box-util-helpers/UtilPrimHelper.js";
import { UtilRefHelpers } from "./box-util-helpers/UtilRefHelpers.js";
import { UtilPartHelpers } from "./box-util-helpers/UtilPartHelpers.js";
import { UtilLimitedHelpers } from "./box-util-helpers/UtilLimitedHelpers.js";

export class FreListInfo {
    static NullListInfo: FreListInfo = { text: '', type: ''};
    text: string;
    type: string;
}

/**
 * This class is the interface to a number of classes that help create the right boxes for a FreNode model.
 */
export class BoxUtil {
    /**
     * Returns an empty line box to be used in the projection of 'node'.
     * @param node
     * @param role
     */
    public static emptyLineBox(node: FreNode, role: string): EmptyLineBox {
        // todo determine role using RoleProvider
        return new EmptyLineBox(node, role);
    }

    /**
     * Returns a label box which holds some static text (i.e. 'content') to be included in the projection of 'node'.
     * @param node
     * @param content
     * @param uid
     * @param initializer
     */
    public static labelBox(node: FreNode, content: string, uid: string, initializer?: Partial<LabelBox>): LabelBox {
        const roleName: string = RoleProvider.label(node, uid) + "-" + content;
        return BoxFactory.label(node, roleName, content, initializer);
    }

    /**
     * Returns an indent box which provide the required indentation for its 'childBox', to be included in the projection of 'node'.
     * @param node
     * @param indent
     * @param uid
     * @param childBox
     * @param initializer
     */
    public static indentBox(
        node: FreNode,
        indent: number,
        uid: string,
        childBox: Box,
        initializer?: Partial<IndentBox>,
    ): IndentBox {
        return BoxFactory.indent(node, RoleProvider.indent(node, uid), indent, childBox, initializer);
    }

    /**
     * Returns a button box to be included in the projection of 'node'.
     * @param node
     * @param text
     * @param roleName
     * @param initializer
     */
    public static buttonBox(
        node: FreNode,
        text: string,
        roleName: string,
        initializer?: Partial<ButtonBox>,
    ): ButtonBox {
        return BoxFactory.button(node, text, roleName, initializer);
    }

    /**
     * Returns a textBox for a property named 'propertyName' within 'node' of type 'string' or 'identifier'.
     * When the property is a list (the type is "string[]", or "identifier[]"), this method can be
     * called for each item in the list. In that case an index to the item needs to be provided.
     * @param node the owning FreNode of the displayed property
     * @param propertyName the name of the displayed property
     * @param index the index of the item in the list, if the property is a list
     */
    public static textBox(node: FreNode, propertyName: string, index?: number): TextBox {
        return UtilPrimHelper.textBox(node, propertyName, index);
    }

    /**
     * Returns a textBox for a property named 'propertyName' within 'node' of type 'number'.
     * When the property is a list (the type is "number[]"), this method can be
     * called for each item in the list. In that case an index to the item needs to be provided.
     * @param node the owning FreNode of the displayed property
     * @param propertyName the name of the displayed property
     * @param display
     * @param index the index of the item in the list, if the property is a list
     * @param displayInfo
     */
    public static numberBox(
        node: FreNode,
        propertyName: string,
        display: NumberDisplay,
        index?: number,
        displayInfo?: NumberDisplayInfo,
    ): Box {
        return UtilPrimHelper.numberBox(node, propertyName, display, index, displayInfo);
    }

    /**
     * Returns a textBox for a property named 'propertyName' within 'node' of type 'boolean'.
     * When the property is a list (the type is "boolean[]"), this method can be
     * called for each item in the list. In that case an index to the item needs to be provided.
     * @param node the owning FreNode of the displayed property
     * @param propertyName the name of the displayed property
     * @param labels the different texts to be shown when the property is false or true
     * @param kind
     * @param index the index of the item in the list, if the property is a list
     * */
    public static booleanBox(
        node: FreNode,
        propertyName: string,
        labels: { yes: string; no: string } = {
            yes: "yes",
            no: "no",
        },
        kind: BoolDisplay,
        index?: number,
    ): Box {
        return UtilPrimHelper.booleanBox(node, propertyName, labels, kind, index);
    }

    /**
     * Returns a box to display the property named 'propertyName' of 'node' that is a single limited value. If the
     * display type is RADIO_GROUP then a LimitedControlBox is returned. If the display type is SELECT, then a
     * SelectBox is returned.
     * @param node
     * @param propertyName
     * @param setFunc           a function to make a reference to a single limited value/instance
     * @param display
     * @param scoper
     * @param index
     */
    public static limitedBox(
        node: FreNode,
        propertyName: string,
        setFunc: (selected: string) => void,
        display: LimitedDisplay,
        scoper?: FreScoper,
        index?: number
    ): LimitedControlBox | SelectBox {
        return UtilLimitedHelpers.limitedBox(node, propertyName, setFunc, display, scoper, index);
    }

    /**
     * Returns a LimitedControlBox to display the property named 'propertyName' of 'node' that is a list of limited values,
     * as a checkbox control.
     * Note that a list of limited values can also be displayed as a list of reference boxes, which is handled in
     * different methods of this class ('this.verticalReferenceListBox(...)' and 'this.horizontalReferenceListBox(...)').
     * Which method needs to be chosen depends on the display type provided.
     * @param node
     * @param propertyName
     * @param setFunc           a function to make a reference to a single limited value/instance
     * @param display
     */
    public static limitedListBox(
        node: FreNode,
        propertyName: string,
        setFunc: (selected: string[]) => void,
        display: LimitedDisplay,
    ): LimitedControlBox {
        return UtilLimitedHelpers.limitedListBox(node, propertyName, setFunc, display);
    }

    /**
     * Returns a VerticalListBox for a property named 'propertyName' within 'node' that is a list of parts
     * (the type is "SOME_CONCEPT_OR_INTERFACE[]").
     * For every element in the list its box is found in the 'boxProviderCache'. Based on the listInfo, separators, etc. are added.
     * All these boxes are added to the 'children' of the returned box. As last child an ActionBox is added that
     * functions as placeholder for creating new elements in the list.
     * @param node
     * @param list
     * @param propertyName
     * @param listJoin
     * @param boxProviderCache
     * @param initializer
     */
    public static verticalPartListBox(
        node: FreNode,
        list: FreNode[],
        propertyName: string,
        listJoin: FreListInfo,
        boxProviderCache: FreProjectionHandler,
        initializer?: Partial<VerticalListBox>,
    ): VerticalListBox {
        return UtilPartHelpers.verticalPartListBox(node, list, propertyName, listJoin, boxProviderCache, initializer);
    }

    /**
     * Returns a HorizontalListBox for a property named 'propertyName' within 'node' that is a list of parts
     * (the type is "SOME_CONCEPT_OR_INTERFACE[]").
     * For every element in the list its box is found in the 'boxProviderCache'. Based on the listInfo, separators, etc. are added.
     * All these boxes are added to the 'children' of the returned box. As last child an ActionBox is added that
     * functions as placeholder for creating new elements in the list.
     * @param node
     * @param list
     * @param propertyName
     * @param listJoin
     * @param boxProviderCache
     * @param initializer
     */
    public static horizontalPartListBox(
        node: FreNode,
        list: FreNode[],
        propertyName: string,
        listJoin: FreListInfo,
        boxProviderCache: FreProjectionHandler,
        initializer?: Partial<HorizontalListBox>,
    ): HorizontalListBox {
        return UtilPartHelpers.horizontalPartListBox(node, list, propertyName, listJoin, boxProviderCache, initializer);
    }

    /**
     * Returns a selectBox for a property named 'propertyName' within 'node' that is a reference
     * (the type is "reference SOME_CONCEPT_OR_INTERFACE", or "reference SOME_CONCEPT_OR_INTERFACE[]").
     * It calls the 'scoper' to fill a dropdown list with possible values for the reference property.
     * A function that is able to set the property (based on the value selected from the dropdown list)
     * has to be provided.
     *
     * When the property is a list (the type is "reference SOMECONCEPT_OR_INTERFACE[]"), this method can be
     * called for each item in the list. In that case an index to the item needs to be provided.
     * @param node the owning FreNode of the displayed property
     * @param propertyName the name of the displayed property
     * @param setFunc
     * @param scoper
     * @param index
     */
    public static referenceBox(
        node: FreNode,
        propertyName: string,
        setFunc: (selected: string | FreNamedNode) => void,
        scoper: FreScoper,
        index?: number,
    ): ReferenceBox {
        return UtilRefHelpers.referenceBox(node, propertyName, setFunc, scoper, index);
    }

    /**
     * Returns a VerticalListBox for a property named 'propertyName' within 'node' that is a list of references
     * (the type is "reference SOME_CONCEPT_OR_INTERFACE[]").
     * For every element in the list a referenceBox is created. Based on the listInfo, separators, etc. are added.
     * All these boxes are added to the 'children' of the returned box. As last child an ActionBox is added that
     * functions as placeholder for creating new elements in the list.
     * @param node
     * @param propertyName
     * @param scoper
     * @param isLimited
     * @param listInfo
     * @param initializer
     */
    public static verticalReferenceListBox(
        node: FreNode,
        propertyName: string,
        scoper: FreScoper,
        listInfo?: FreListInfo,
        initializer?: Partial<VerticalListBox>,
    ): VerticalListBox {
        return UtilRefHelpers.verticalReferenceListBox(node, propertyName, scoper, listInfo, initializer);
    }

    /**
     * Returns a HorizontalListBox for a property named 'propertyName' within 'node' that is a list of references
     * (the type is "reference SOME_CONCEPT_OR_INTERFACE[]").
     * For every element in the list a referenceBox is created. Based on the listInfo, separators, etc. are added.
     * All these boxes are added to the 'children' of the returned box. As last child an ActionBox is added that
     * functions as placeholder for creating new elements in the list.
     * @param node
     * @param propertyName
     * @param scoper
     * @param isLimited
     * @param listJoin
     * @param initializer
     */
    public static horizontalReferenceListBox(
        node: FreNode,
        propertyName: string,
        scoper: FreScoper,
        listJoin?: FreListInfo,
        initializer?: Partial<HorizontalListBox>,
    ): HorizontalListBox {
        return UtilRefHelpers.horizontalReferenceListBox(node, propertyName, scoper, listJoin, initializer);
    }


    /**
     * Returns a textBox for a property named 'propertyName' within 'node', either the box that is already present in
     * the 'boxProviderCache', or an ActionBox by means of which a new value for this property can be created. The 'conceptName'
     * is needed to known what type of value needs to be created.
     * @param node
     * @param propertyName
     * @param conceptName
     * @param boxProviderCache
     */
    public static getBoxOrAction(
        node: FreNode,
        propertyName: string,
        conceptName: string,
        boxProviderCache: FreProjectionHandler,
    ): Box {
        // find the information on the property to be shown
        const property = node[propertyName];
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName);
        let result: Box = !!property
            ? boxProviderCache.getBoxProvider(property).box
            : BoxFactory.action(node, roleName, `<${propertyName}>`, {
                propertyName: propertyName,
                conceptName: conceptName,
            });
        result.propertyName = propertyName;
        // result.propertyIndex = ??? todo
        return result;
    }

    /**
     * Returns an ExternalRefListBox for a property named 'propertyName' within 'node' that is a list of references
     * (the type is "reference SOME_CONCEPT_OR_INTERFACE[]").
     * For every element in the list a normal box is created. All these boxes are added to the 'children' of the
     * returned box. No separators, etc., or placeholder ActionBox are added.
     * @param node
     * @param propertyName
     * @param externalComponentName
     * @param scoper
     * @param initializer
     */
    public static refListReplacerBox(
        node: FreNode,
        propertyName: string,
        externalComponentName: string,
        scoper: FreScoper,
        initializer?: Partial<RefListReplacerBox>,
    ): RefListReplacerBox {
        return UtilRefHelpers.refListReplacerBox(node, propertyName, externalComponentName, scoper, initializer);
    }

    /**
     * Returns an ExternalPartListBox for a property named 'propertyName' within 'node' that is a list of parts
     * (the type is "SOME_CONCEPT_OR_INTERFACE[]").
     * For every element in the list a normal box is created. All these boxes are added to the 'children' of the
     * returned box. No separators, etc., or placeholder ActionBox are added.
     * @param node
     * @param list
     * @param propertyName
     * @param externalComponentName
     * @param boxProviderCache
     * @param initializer
     */
    public static partListReplacerBox(
        node: FreNode,
        list: FreNode[],
        propertyName: string,
        externalComponentName: string,
        boxProviderCache: FreProjectionHandler,
        initializer?: Partial<PartListReplacerBox>,
    ): PartListReplacerBox {
        return UtilPartHelpers.partListReplacerBox(
            node,
            list,
            propertyName,
            externalComponentName,
            boxProviderCache,
            initializer,
        );
    }

    // TODO get the role names correct in the following methods
    // TODO use caches for following methods
    static stringReplacerBox(
        node: FreNode,
        propertyName: string,
        externalComponentName: string,
        initializer?: Partial<StringReplacerBox>,
    ): StringReplacerBox {
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName) + "-external";
        return new StringReplacerBox(externalComponentName, node, roleName, propertyName, initializer);
    }

    static numberReplacerBox(
        node: FreNode,
        propertyName: string,
        externalComponentName: string,
        initializer?: Partial<NumberReplacerBox>,
    ): NumberReplacerBox {
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName) + "-external";
        return new NumberReplacerBox(externalComponentName, node, roleName, propertyName, initializer);
    }

    static booleanReplacerBox(
        node: FreNode,
        propertyName: string,
        externalComponentName: string,
        initializer?: Partial<BooleanReplacerBox>,
    ): BooleanReplacerBox {
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName) + "-external";
        return new BooleanReplacerBox(externalComponentName, node, roleName, propertyName, initializer);
    }

    static partReplacerBox(
        node: FreNode,
        propertyName: string,
        externalComponentName: string,
        initializer?: Partial<PartReplacerBox>,
    ): PartReplacerBox {
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName) + "-external";
        return new PartReplacerBox(externalComponentName, node, roleName, propertyName, initializer);
    }

    static refReplacerBox(
        node: FreNode,
        propertyName: string,
        externalComponentName: string,
        initializer?: Partial<RefReplacerBox>,
    ): RefReplacerBox {
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName) + "-external";
        return new RefReplacerBox(externalComponentName, node, roleName, propertyName, initializer);
    }

    static stringWrapperBox(
        node: FreNode,
        propertyName: string,
        externalComponentName: string,
        childBox: Box,
        initializer?: Partial<StringWrapperBox>,
    ): StringWrapperBox {
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName) + "-wrapper";
        return new StringWrapperBox(externalComponentName, node, roleName, propertyName, childBox, initializer);
    }

    static numberWrapperBox(
        node: FreNode,
        propertyName: string,
        externalComponentName: string,
        childBox: Box,
        initializer?: Partial<NumberWrapperBox>,
    ): NumberWrapperBox {
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName) + "-wrapper";
        return new NumberWrapperBox(externalComponentName, node, roleName, propertyName, childBox, initializer);
    }

    static booleanWrapperBox(
        node: FreNode,
        propertyName: string,
        externalComponentName: string,
        childBox: Box,
        initializer?: Partial<BooleanWrapperBox>,
    ): BooleanWrapperBox {
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName) + "-wrapper";
        return new BooleanWrapperBox(externalComponentName, node, roleName, propertyName, childBox, initializer);
    }
    
    static fragmentWrapperBox(
        node: FreNode,
        externalComponentName: string,
        childBox: Box,
        initializer?: Partial<BooleanWrapperBox>,
    ): FragmentWrapperBox {
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), externalComponentName) + "-wrapper-" + childBox.id;
        return new FragmentWrapperBox(externalComponentName, node, roleName,childBox, initializer);
    }

    static partWrapperBox(
        node: FreNode,
        propertyName: string,
        externalComponentName: string,
        childBox: Box,
        initializer?: Partial<PartWrapperBox>,
    ): PartWrapperBox {
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName) + "-wrapper";
        return new PartWrapperBox(externalComponentName, node, roleName, propertyName, childBox, initializer);
    }

    static partListWrapperBox(
        node: FreNode,
        propertyName: string,
        externalComponentName: string,
        childBox: Box,
        initializer?: Partial<PartListWrapperBox>,
    ): PartListWrapperBox {
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName) + "-wrapper";
        return new PartListWrapperBox(externalComponentName, node, roleName, propertyName, childBox, initializer);
    }

    static refWrapperBox(
        node: FreNode,
        propertyName: string,
        externalComponentName: string,
        childBox: Box,
        initializer?: Partial<RefWrapperBox>,
    ): RefWrapperBox {
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName) + "-wrapper";
        return new RefWrapperBox(externalComponentName, node, roleName, propertyName, childBox, initializer);
    }
    static refListWrapperBox(
        node: FreNode,
        propertyName: string,
        externalComponentName: string,
        childBox: Box,
        initializer?: Partial<RefListWrapperBox>,
    ): RefListWrapperBox {
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName) + "-wrapper";
        return new RefListWrapperBox(externalComponentName, node, roleName, propertyName, childBox, initializer);
    }
}
