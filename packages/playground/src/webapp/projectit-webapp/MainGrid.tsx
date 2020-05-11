import * as React from "react";
import { Flex, Image, Header } from "@fluentui/react-northstar";
import { getTheme, mergeStyleSets } from "office-ui-fabric-react/lib/Styling";
import Menubar from "./Menubar";
import { EditorArea } from "./EditorArea";
import { PiToolbar } from "./PiToolbar";
import { editorEnvironment } from "../gateway-to-projectit/WebappConfiguration";
import { createTheme, Customizations } from "@fluentui/react";
const Logo = require("../images/inverse-colors.png");
const headerText = "ProjectIt Language Environment for " + editorEnvironment.languageName;
export const headerHeight = "40px";
export const iconHeight = "36px";
// this component holds the header, the toolbar, the editor area, and the footer

// This theme is based on the ProjectIt colors
const myTheme = createTheme({
    palette: {
        themePrimary: '#00008b',
        themeLighterAlt: '#f0f0fa',
        themeLighter: '#c7c7ed',
        themeLight: '#9a9add',
        themeTertiary: '#4a4aba',
        themeSecondary: '#12129a',
        themeDarkAlt: '#00007e',
        themeDark: '#00006b',
        themeDarker: '#00004f',
        neutralLighterAlt: '#faf9f8',
        neutralLighter: '#f3f2f1',
        neutralLight: '#edebe9',
        neutralQuaternaryAlt: '#e1dfdd',
        neutralQuaternary: '#d0d0d0',
        neutralTertiaryAlt: '#c8c6c4',
        neutralTertiary: '#a19f9d',
        neutralSecondary: '#605e5c',
        neutralPrimaryAlt: '#3b3a39',
        neutralPrimary: '#323130',
        neutralDark: '#201f1e',
        black: '#000000',
        white: '#ffffff',
    }});

const classNames = mergeStyleSets({
    wrapper: {
        height: "40vh",
        position: "relative",
        maxHeight: "inherit"
    },
    pane: {
        maxWidth: 400,
        border: "1px solid " + myTheme.palette.neutralLight
    },
    textContent: {
        padding: "15px 10px"
    }
});

export const MainGrid: React.FunctionComponent = () => {
    Customizations.applySettings({ theme: myTheme });
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
            {/*{DemoEnvironment.getInstance().projectionalEditorComponent}*/}
        </div>
    );
};
