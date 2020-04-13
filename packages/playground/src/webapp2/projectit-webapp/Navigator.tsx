import * as React from "react";
import { Selection } from "office-ui-fabric-react/lib/DetailsList";
import { Icon, Tree, Box } from "@fluentui/react-northstar";
import { ComponentEventHandler } from "@fluentui/react-northstar/dist/es/types";
import { SelectionMode, SelectionZone } from "office-ui-fabric-react/lib/Selection";
import { EditorEnvironment, IModelUnit } from "../gateway-to-projectit/EditorEnvironment";

// This component holds the navigator, which shows all available models sorted by language

// TODO language should be removed, instead model and model-units should be used

export interface IModelListState {
    // is this needed???? TODO find out how to address state
    items: IModelUnit[];
    activeBranche: string;
}

// The type of an element in the navigation tree
type TreeElement = {
    id: string;
    title: string;
    items: TreeElement[];
    onTitleClick: ComponentEventHandler<TreeElement>;
    as: string // TODO add styling
}

const titleRenderer = (Component, { content, open, hasSubtree, ...restProps }) => (
    // TODO triangle-down does not work
    <Component open={open} hasSubtree={hasSubtree} {...restProps}>
        {hasSubtree && <Icon name={open ? "triangle-down" : "triangle-right"}/>}
        <span>{content}</span>
    </Component>
);

export class Navigator extends React.Component<{}, IModelListState> {
    // TODO keep current selection
    private _selection: Selection;
    private _allModels: IModelUnit[]; // should be observable!
    private _tree: TreeElement[];
    private _activeItemId: string;

    constructor(props: {}) {
        super(props);

        this._selection = new Selection();
        this._allModels = EditorEnvironment.getModelUnits();
        this._tree = this.buildTree();
        this.state = {
            items: this._allModels,
            activeBranche: this._activeItemId
        };
    }

    private buildTree(): TreeElement[] {
        let tree: TreeElement[] = [];
        for (let lang of this.findlanguages()) {
            if (!(!!this._activeItemId)) {
                this._activeItemId = lang;
            }
            let group: TreeElement = {
                id: lang,
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

    private _onTitleClick(ev: React.MouseEvent<HTMLElement>, item?: TreeElement) {
        if (parseInt(item.id) >= 0) {
            EditorEnvironment.changeToModelUnit(parseInt(item.id));
            // TODO show selection with grey background (or something)
        }
    }

    render(): JSX.Element {
        return <Box
            styles={{
                gridColumn: "2",
                // height: "calc((100vh -220px) * 0.80)",
                gridRow: "1",
                // border: "1px solid #ccc",
                width: "100%",
                // overflowX: "auto",
                // overflowY: "auto"



            }}

        >
            {/*<SelectionZone selection={this._selection} selectionMode={SelectionMode.single}>*/}
                <Tree
                    items={this._tree}
                    title="Model Units"
                    renderItemTitle={titleRenderer}
                    aria-label="Initially open"
                    defaultActiveItemIds={[
                        this._activeItemId
                    ]}
                />
            {/*</SelectionZone>*/}
        </Box>;
    }
}

