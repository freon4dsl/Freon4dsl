import { Box } from "@fluentui/react-northstar";
import * as React from "react";
import { DetailsList, DetailsListLayoutMode, IDetailsHeaderProps, Selection, IColumn, ConstrainMode } from "office-ui-fabric-react/lib/DetailsList";
import { IRenderFunction } from "office-ui-fabric-react/lib/Utilities";
import { TooltipHost } from "office-ui-fabric-react/lib/Tooltip";
import { Sticky, StickyPositionType } from "office-ui-fabric-react/lib/Sticky";
import { mergeStyleSets } from "office-ui-fabric-react/lib/Styling";
import { IDetailsColumnRenderTooltipProps } from "office-ui-fabric-react/lib/DetailsList";
import { SelectionMode } from "office-ui-fabric-react/lib/Selection";
import { EditorCommunication } from "./EditorCommunication";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { PiError } from "@projectit/core";

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

export interface IErrorItem {
    key: number;
    error: PiError;
    errormessage: string;
    errorlocation: string;
    errorseverity: string;
}

@observer
export class ErrorList extends React.Component<{}, {}> {
    @observable allItems: PiError[]=[];
    private _columns: IColumn[];

    constructor(props: {}) {
        super(props);

        EditorCommunication.getInstance().editorArea.errorlist = this;
        this.makeColumns(props);
        // the next statement must always occur after setting
        // EditorCommunication.editorArea.errorlist
        EditorCommunication.getInstance().getErrors();
    }

    @computed get getErrors(): IErrorItem[] {
        let myList: IErrorItem[] = [];
        this.allItems.forEach((err: PiError, index: number) => {
            myList.push({
                key: index,
                error: err,
                errormessage: err.message,
                errorlocation: err.locationdescription,
                errorseverity: err.severity
            })
        });
        return myList;
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
            key: "severity",
            name: "severity",
            fieldName: "errorseverity",
            minWidth: 200,
            maxWidth: 400,
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
                        items={this.getErrors}
                        columns={this._columns}
                        setKey="set"
                        layoutMode={DetailsListLayoutMode.fixedColumns}
                        constrainMode={ConstrainMode.unconstrained}
                        onRenderDetailsHeader={onRenderDetailsHeader}
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
    // give signal to editor
    EditorCommunication.getInstance().errorSelected(item.error);
}

function _onActiveItemChanged(item: IErrorItem): void {
    // TODO what should the activity be onActiveItemChanged?
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
