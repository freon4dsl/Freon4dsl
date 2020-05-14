import * as React from "react";
import { Flex, Image, Header } from "@fluentui/react-northstar";
import Menubar from "./Menubar";
import { EditorArea } from "./EditorArea";
import { PiToolbar } from "./PiToolbar";
import { editorEnvironment } from "../gateway-to-projectit/WebappConfiguration";
const Logo = require("../images/inverse-colors.png");
const headerText = "ProjectIt Language Environment for " + editorEnvironment.languageName;
export const headerHeight = "40px";
export const iconHeight = "36px";
// this component holds the header, the toolbar, the editor area, and the footer

export const MainGrid: React.FunctionComponent = () => {
    return (
        // Grid has 6 columns
        // Header positioned on columns 1-6, row 1
        // MenuBar positioned on columns 1-6, row 2
        // Menu, Editor, and ErrorList togther positioned on column 1-6, row 3
        // Footer positioned on columns 1-6, rows 4
        // TODO looks like columns are no longer needed
        <div>
            <div
                style={{
                    height: headerHeight,
                    backgroundColor: "darkblue"
                }}
            >
                <Flex
                    gap="gap.small"
                    padding="padding.medium"
                    hAlign="stretch"
                    styles={{
                        height: headerHeight,
                        gridColumn: "span 6",
                        backgroundColor: "darkblue"
                    }}
                >
                    <Flex.Item align="center" grow>
                        <Header as="h3" content={headerText} color="white" />
                    </Flex.Item>
                    <Flex.Item align="center" size="size.small">
                        <Image
                            src={Logo}
                            alt={"ProjectIt"}
                            styles={{
                                maxHeight: iconHeight,
                                maxWidth: "80px"
                            }}
                        />
                    </Flex.Item>
                </Flex>
            </div>
            {/* "menubar" */}
            <Menubar />
            {/* "toolbar" */}
            <PiToolbar />
            {/* editor area */}
            <EditorArea />
        </div>
    );
};
