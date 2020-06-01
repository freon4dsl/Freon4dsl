import * as React from "react";
import { Selection } from "office-ui-fabric-react/lib/DetailsList";
import { Icon, Tree, Box, Label } from "@fluentui/react-northstar";
import { ComponentEventHandler } from "@fluentui/react-northstar/dist/es/types";
import { SelectionMode, SelectionZone } from "office-ui-fabric-react/lib/Selection";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { App } from "./App";
// TODO try to make dependence of gateway-to-projectit as small as possible
import { editorEnvironment } from "../gateway-to-projectit/WebappConfiguration";
import { EditorCommunication } from "../gateway-to-projectit/EditorCommunication";
import { IModelUnitData } from "../gateway-to-projectit/IServerCommunication";

// This component holds the navigator, which shows all available models sorted by language

// for now, but TODO change this
const modelName: string = "currentModel";

// The type of an element in the navigation tree
type TreeElement = {
    id: string;
    title: string;
    items: TreeElement[];
    parent: string;
    onTitleClick: ComponentEventHandler<TreeElement>;
    as: string; // TODO add styling
};

const titleRenderer = (Component, { content, open, hasSubtree, selected, ...restProps }) => (
    // TODO icons do not work
    <Component open={open} hasSubtree={hasSubtree} {...restProps}>
        {hasSubtree && <Icon name={open ? "triangle-down" : "triangle-right"} />}
        {!hasSubtree && <Icon name={selected ? "add" : "Add"} />}
        <span>{content}</span>
    </Component>
);

@observer
export class Navigator extends React.Component<{}, {}> {
    // TODO keep current selection
    private _selection: Selection;
    @observable _allDocuments: IModelUnitData[] = [];
    private _activeItemId: string = "-1";

    constructor(props: {}) {
        super(props);

        this._selection = new Selection();
        EditorCommunication.editorArea.navigator = this;
        EditorCommunication.getModelUnits(this.modelListCallBack);
    }

    @computed get buildTree(): TreeElement[] {
        let tree: TreeElement[] = [];
        let modelMap = new Map();
        for (let lang of this.findlanguages()) {
            let languageGroup: TreeElement = {
                id: lang,
                title: lang,
                items: [],
                onTitleClick: this._onTitleClick,
                as: "h5",
                parent : ""
            };
            this._allDocuments.forEach((model, index) => {
                if (model.language === lang) {
                    let modelGroup: TreeElement = modelMap.get(model.model);
                    if (!(!!modelGroup)) {
                        // create a tree element for this model
                        modelGroup = {
                            id: model.model,
                            title: model.model,
                            items: [],
                            onTitleClick: this._onTitleClick,
                            as: "h5",
                            parent : languageGroup.id
                        };
                        modelMap.set(model.model, modelGroup);
                        languageGroup.items.push(modelGroup);
                    }
                    let elem: TreeElement = {
                        id: index.toString(10),
                        title: model.unitName,
                        items: [],
                        onTitleClick: this._onTitleClick,
                        as: "h5",
                        parent: modelGroup.id
                    };
                    modelGroup.items.push(elem);
                }
            });
            tree.push(languageGroup);
        }
        return tree;
    }

    private findlanguages(): string[] {
        let result: string[] = [];
        for (let model of this._allDocuments) {
            if (!result.includes(model.language)) {
                result.push(model.language);
            }
        }
        return result;
    }

    public removeName(name: string) {
        // TODO this method is not functioning correctly yet
        const index = this._allDocuments.findIndex(elem  => elem.unitName = name);
        console.log(`length: ${this._allDocuments.length}, index: ${index}`);
        this._allDocuments.splice(index-1 , 1);
    }

    private _onTitleClick = (ev: React.MouseEvent<HTMLElement>, item?: TreeElement) => {
        if (!!item.id && item.items.length === 0 ) { // every model unit is a leaf in the navigation tree
            // get from item.id the right names to put through to the open request
            let modelInfo: IModelUnitData = this._allDocuments[item.id];
            if (!!modelInfo) {
                EditorCommunication.open(modelInfo.model, modelInfo.unitName);
                // TODO show selection with grey background (or something)
            }
            App.closeDialog();
        // } else {
        //     console.log(`trying to open ${item.id}, which is not a model unit`);
        }
    }

    render(): JSX.Element {
        return (
            <Box
                styles={{
                    gridColumn: "2",
                    // height: "calc((100vh -220px) * 0.80)",
                    gridRow: "1",
                    // border: "1px solid #ccc",
                    width: "100%"
                    // overflowX: "auto",
                    // overflowY: "auto"
                }}
            >
                {/*<SelectionZone selection={this._selection} selectionMode={SelectionMode.single}>*/}
                <Tree
                    items={this.buildTree}
                    title="Model Units"
                    renderItemTitle={titleRenderer}
                    aria-label="Initially open"
                    defaultActiveItemIds={[this._activeItemId]}
                    // selectionIndicator: TODO show current selection
                />
                {/*</SelectionZone>*/}
            </Box>
        );
    }

    // TODO this callback should receive a list of IModelUnitData
    private modelListCallBack = (names: string[]) => {
        if (!!names && names.length > 0) {
            names.forEach((name) => {
                this._allDocuments.push({ unitName: name, model: modelName, language: editorEnvironment.languageName });
            });
            if (!(!!this._activeItemId)) {
                this._activeItemId = editorEnvironment.languageName;
            }
        // } else {
        //     // push a dummy element on the list, to show something
        //     this._allDocuments.push({unitName: name, model: modelName, language: editorEnvironment.languageName });
        }
    }
}

