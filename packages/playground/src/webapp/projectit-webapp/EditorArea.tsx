import * as React from "react";
import { Flex, Image, Box, Grid } from "@fluentui/react-northstar";
import { EditorEnvironment } from "../gateway-to-projectit/EditorEnvironment";
import { Navigator } from "./Navigator";
import { ErrorList } from "./ErrorList";

// This component holds the navigator to the left side, and
// the editor and errorlist to the right.
// The editor and errolist are layed out vertically.

export const EditorArea: React.FunctionComponent = () => {
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
                    <Navigator />
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
                    {EditorEnvironment.getEditor()}
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
                    <ErrorList />
                </Box>
            </Grid>
        </div>
    );
};
