import * as React from "react";
import { Selection } from "office-ui-fabric-react/lib/DetailsList";
import { Icon, Tree, Box } from "@fluentui/react-northstar";
import { ComponentEventHandler } from "@fluentui/react-northstar/dist/es/types";
import { SelectionMode, SelectionZone } from "office-ui-fabric-react/lib/Selection";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { App } from "./App";
// TODO try to make deoendence of gateway-to-projectit as small as possible
import { editorEnvironment } from "../gateway-to-projectit/WebappConfiguration";
import { EditorCommunication, IModelUnit } from "../gateway-to-projectit/EditorCommunication";

// This component holds the navigator, which shows all available models sorted by language

// TODO language should be removed, instead model and model-units should be used

// The type of an element in the navigation tree
type TreeElement = {
    id: string;
    title: string;
    items: TreeElement[];
    onTitleClick: ComponentEventHandler<TreeElement>;
    as: string; // TODO add styling
};

const titleRenderer = (Component, { content, open, hasSubtree, ...restProps }) => (
    // TODO triangle-down does not work
    <Component open={open} hasSubtree={hasSubtree} {...restProps}>
        {hasSubtree && <Icon name={open ? "triangle-down" : "triangle-right"} />}
        <span>{content}</span>
    </Component>
);

@observer
export class Navigator extends React.Component<{}, {}> {
    // TODO keep current selection
    private _selection: Selection;
    @observable _allModels: IModelUnit[] = [];
    private _activeItemId: string = "-1";

    constructor(props: {}) {
        super(props);

        this._selection = new Selection();
        EditorCommunication.editorArea.navigator = this;
        EditorCommunication.getModelUnits(this.modelListCallBack);
    }

    @computed get buildTree(): TreeElement[] {
        let tree: TreeElement[] = [];
        for (let lang of this.findlanguages()) {
            let group: TreeElement = {
                id: "-1",
                title: lang,
                items: [],
                onTitleClick: this._onTitleClick,
                as: "h5"
            };
            for (let model of this._allModels) {
                if (model.language === lang) {
                    let elem: TreeElement = {
                        id: model.id.toString(),
                        title: model.name,
                        items: [],
                        onTitleClick: this._onTitleClick,
                        as: "p"
                    };
                    group.items.push(elem);
                }
            }
            tree.push(group);
        }
        return tree;
    }

    private findlanguages(): string[] {
        let result: string[] = [];
        for (let model of this._allModels) {
            if (!result.includes(model.language)) {
                result.push(model.language);
            }
        }
        return result;
    }

    public removeName(name: string) {
        // TODO this method is not functioning correctly yet
        const index = this._allModels.findIndex(elem  => elem.name = name);
        console.log(`length: ${this._allModels.length}, index: ${index}`);
        this._allModels.splice(index-1 , 1);
    }

    private _onTitleClick = (ev: React.MouseEvent<HTMLElement>, item?: TreeElement) => {
        if (parseInt(item.id) >= 0) {
            EditorCommunication.open(item.title);
            // TODO show selection with grey background (or something)
            // close the dialog
            App.closeDialog();
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
                />
                {/*</SelectionZone>*/}
            </Box>
        );
    }

    private modelListCallBack = (names: string[]) => {
        if (!!names && names.length > 0) {
            names.forEach((name, itemIndex) => {
                this._allModels.push({ id: itemIndex, name: name, language: editorEnvironment.languageName });

            });
            if (!!!this._activeItemId) {
                this._activeItemId = editorEnvironment.languageName;
            }
        } else {
            // push a dummy element on the list, to show something
            this._allModels.push({id: -2, name: name, language: editorEnvironment.languageName });
        }
    }
}

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}
