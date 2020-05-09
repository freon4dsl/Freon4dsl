import * as React from "react";
import { Box, Grid } from "@fluentui/react-northstar";
import { EditorCommunication } from "../gateway-to-projectit/EditorCommunication";
import { Navigator } from "./Navigator";
import { ErrorList } from "./ErrorList";
import { observable } from "mobx";
import { observer } from "mobx-react";

// This component holds the navigator to the left side, and
// the editor and error list to the right.
// The editor and error list are laid-out vertically.

@observer
export class EditorArea extends React.Component<{}, {}> {
    navigator: Navigator;
    errorlist: ErrorList;
    @observable showNavigator: boolean = true;
    @observable showErrorlist: boolean = true;

    constructor(props: {}) {
        super(props);
        EditorCommunication.editorArea = this;
    }

    render () {
        if (this.showNavigator && this.showErrorlist) {
            // console.log("nav: " + this.showNavigator + ", error: " + this.showErrorlist);
            return this.showAll();
        } else if (!this.showNavigator && this.showErrorlist) {
            // console.log("nav: " + this.showNavigator + ", error: " + this.showErrorlist);
            return this.showEditorAndErrors();
        } else if (this.showNavigator && !this.showErrorlist) {
            // console.log("nav: " + this.showNavigator + ", error: " + this.showErrorlist);
            return this.showEditorAndNavigator();
        } else {
            // console.log("nav: " + this.showNavigator + ", error: " + this.showErrorlist);
            return this.showEditorOnly();
        }
    }

    private showAll() {
        return (
            <div>
                <Grid styles={{ gridTemplateColumns: "1fr 7fr" }}>
                    <Box
                        // content="navigator"
                        styles={{
                            gridColumn: "1",
                            gridRow: "1",
                            border: "2px solid #ccc",
                            color: "blue",
                            height: "calc((100vh - 220px) * 0.80)",
                            overflowX: "auto"
                        }}
                    >
                        <Navigator/>
                    </Box>
                    <Box
                        styles={{
                            gridColumn: "2",
                            height: "calc((100vh - 220px) * 0.80)",
                            gridRow: "1",
                            border: "2px solid #ccc",
                            width: "100%",
                            overflowX: "auto"
                        }}
                    >
                        {EditorCommunication.getEditor()}
                    </Box>
                    <Box
                        // content="errorList"
                        styles={{
                            gridColumn: "1",
                            gridColumnEnd: "3",
                            gridRow: "2",
                            // border: '2px solid #ccc',
                            color: "blue",
                            // minheight: '100px',
                            height: "20vh"
                            // overflowX: "auto",
                        }}
                    >
                        <ErrorList/>
                    </Box>
                </Grid>
            </div>
        );
    }

    private showEditorAndNavigator() {
        // console.log("showEditorAndNavigator");
        return (
            <div>
                <Grid styles={{ gridTemplateColumns: "1fr 7fr" }}>
                    <Box
                        // content="navigator"
                        styles={{
                            gridColumn: "1",
                            gridRow: "1",
                            border: "2px solid #ccc",
                            color: "blue",
                            height: "calc((100vh - 220px))",
                            overflowX: "auto"
                        }}
                    >
                        <Navigator/>
                    </Box>
                    <Box
                        styles={{
                            gridColumn: "2",
                            height: "calc((100vh - 220px))",
                            gridRow: "1",
                            border: "2px solid #ccc",
                            width: "100%",
                            overflowX: "auto"
                        }}
                    >
                        {EditorCommunication.getEditor()}
                    </Box>
                </Grid>
            </div>
        );
    }

    private showEditorOnly() {
        // console.log("showEditorOnly");
        return (
            <div>
                <Grid styles={{ gridTemplateColumns: "1fr 7fr" }}>
                    <Box
                        styles={{
                            gridColumn: "span 8",
                            height: "calc((100vh - 220px))",
                            gridRow: "1",
                            border: "2px solid #ccc",
                            width: "100%",
                            overflowX: "auto"
                        }}
                    >
                        {EditorCommunication.getEditor()}
                    </Box>
                </Grid>
            </div>
        );
    }

    private showEditorAndErrors() {
        // console.log("showEditorAndErrors");
        return (
            <div>
                <Grid styles={{ gridTemplateColumns: "1fr 7fr" }}>
                    <Box
                        styles={{
                            gridColumn: "span 8",
                            height: "calc((100vh - 220px) * 0.80)",
                            gridRow: "1",
                            border: "2px solid #ccc",
                            width: "100%",
                            overflowX: "auto"
                        }}
                    >
                        {EditorCommunication.getEditor()}
                    </Box>
                    <Box
                        // content="errorList"
                        styles={{
                            gridColumn: "span 8",
                            gridRow: "2",
                            // border: '2px solid #ccc',
                            color: "blue",
                            // minheight: '100px',
                            height: "20vh"
                            // overflowX: "auto",
                        }}
                    >
                        <ErrorList/>
                    </Box>
                </Grid>
            </div>
        );
    }
}
