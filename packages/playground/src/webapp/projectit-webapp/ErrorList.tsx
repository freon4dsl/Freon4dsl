import { Box } from "@fluentui/react-northstar";
import * as React from "react";
import { DetailsList, DetailsListLayoutMode, IDetailsHeaderProps, Selection, IColumn, ConstrainMode } from "office-ui-fabric-react/lib/DetailsList";
import { IRenderFunction } from "office-ui-fabric-react/lib/Utilities";
import { TooltipHost } from "office-ui-fabric-react/lib/Tooltip";
import { Sticky, StickyPositionType } from "office-ui-fabric-react/lib/Sticky";
import { mergeStyleSets } from "office-ui-fabric-react/lib/Styling";
import { IDetailsColumnRenderTooltipProps } from "office-ui-fabric-react/lib/DetailsList";
import { SelectionMode } from "office-ui-fabric-react/lib/Selection";
import { EditorCommunication, IErrorItem } from "../gateway-to-projectit/EditorCommunication";

// This component holds the errorlist

const classNames = mergeStyleSets({
    wrapper: {
        height: "200px",
        position: "relative",
        border: "inherit"
    },
    filter: {
        paddingBottom: 10,
        maxWidth: 300
    },
    header: {
        margin: 0,
        height: "30px"
    },
    row: {
        display: "inline-block"
    }
});

export interface IErrorListState {
    items: IErrorItem[];
}

export class ErrorList extends React.Component<{}, IErrorListState> {
    private _selection: Selection;
    private _allItems: IErrorItem[]; // should be observable!
    private _columns: IColumn[];

    constructor(props: {}) {
        super(props);

        this._selection = new Selection();
        this._allItems = [];
        this.getErrors();
        this.makeColumns(props);
        // must be done after getErrors
        this.state = {
            items: this._allItems
        };
    }

    private getErrors() {
        for (let error of EditorCommunication.getErrors()) {
            this._allItems.push({
                key: error.key,
                errormessage: error.errormessage,
                errorlocation: error.errorlocation
            });
        }
    }

    private makeColumns(props: {}) {
        this._columns = [];
        this._columns.push({
            key: "message",
            name: "message",
            fieldName: "errormessage",
            minWidth: 200,
            maxWidth: 600,
            isResizable: true
        });
        this._columns.push({
            key: "location",
            name: "found in",
            fieldName: "errorlocation",
            minWidth: 200,
            maxWidth: 400,
            isResizable: true
        });
    }

    public render(): JSX.Element {
        const { items } = this.state;

        return (
            <div className={classNames.wrapper}>
                {/*<ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>*/}
                {/*    <Sticky stickyPosition={StickyPositionType.Header}>*/}
                {/*        <h3 className={classNames.header} style={{ height: "20px" }}>errors found</h3>*/}
                {/*    </Sticky>*/}
                <Box
                    // content="errorList"
                    styles={{
                        height: "calc((100vh - 220px) * 0.20)",
                        overflowX: "auto"
                    }}
                >
                    <DetailsList
                        compact={true}
                        items={items}
                        columns={this._columns}
                        setKey="set"
                        layoutMode={DetailsListLayoutMode.fixedColumns}
                        constrainMode={ConstrainMode.unconstrained}
                        onRenderDetailsHeader={onRenderDetailsHeader}
                        selection={this._selection}
                        selectionMode={SelectionMode.single}
                        selectionPreservedOnEmptyClick={true}
                        ariaLabelForSelectionColumn="Toggle selection"
                        ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                        onItemInvoked={_onItemInvoked}
                        onActiveItemChanged={_onActiveItemChanged}
                    />
                </Box>
                {/*</ScrollablePane>*/}
            </div>
        );
    }
}

function _onItemInvoked(item: IErrorItem): void {
    alert("Item invoked: " + item.errormessage);
}

function _onActiveItemChanged(item: IErrorItem): void {
    // give signal to EditorEnvironment
    EditorCommunication.errorSelected(item);
}

const onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps> = (props, defaultRender) => {
    if (!props) {
        return null;
    }

    const onRenderColumnHeaderTooltip: IRenderFunction<IDetailsColumnRenderTooltipProps> = tooltipHostProps => <TooltipHost {...tooltipHostProps} />;

    return (
        <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
            {defaultRender!({
                ...props,
                onRenderColumnHeaderTooltip
            })}
        </Sticky>
    );
};
