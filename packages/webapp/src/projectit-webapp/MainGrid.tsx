import * as React from 'react';
import { Link } from '@fluentui/react';
import { Grid, Segment, Flex, Text, Image, Header } from '@fluentui/react-northstar';
import {getTheme, mergeStyleSets} from "office-ui-fabric-react/lib/Styling";
import Menubar from "./Menubar";
import {EditorArea} from "./EditorArea";

// this component holds the header, the toolbar, the editor area, and the footer

// TODO use themes or get rid of this:
const theme = getTheme();
const classNames = mergeStyleSets({
    wrapper: {
        height: '40vh',
        position: 'relative',
        maxHeight: 'inherit',
    },
    pane: {
        maxWidth: 400,
        border: '1px solid ' + theme.palette.neutralLight,
    },
    textContent: {
        padding: '15px 10px',
    },
});

export const MainGrid: React.FunctionComponent = () => {
    return (
        // Grid has 6 columns
        // Header positioned on columns 1-6, row 1
        // MenuBar positioned on columns 1-6, row 2
        // Menu, Editor, and ErrorList togther positioned on column 1-6, row 3
        // Footer positioned on columns 1-6, rows 4
        // TODO looks like columns are no longer needed
        // TODO the only color that is working is "brand"

        <Grid columns="repeat(6, 1fr)" >
            {/* "header" */}
            <Segment
                color="brand"
                inverted
                styles={{
                    gridColumn: 'span 6'
                }}>
                <Flex gap="gap.small" padding="padding.medium" hAlign="stretch"
                      styles={{
                          height: '20px'
                      }}>
                    <Flex.Item align='center' grow>
                        <Header as="h3" content="ProjectIt Language Environment" color="white"/>
                    </Flex.Item>
                    <Flex.Item align='center' size="size.medium" >
                        <Image fluid src="public/projectit.png" alt={"logo"}/>
                    </Flex.Item>
                </Flex>
            </Segment>

            {/* "menubar" */}
            <Segment
                color="white"
                inverted
                styles={{
                    gridColumn: 'span 6',
                    height: '100%',
                }}>
                <Menubar />
            </Segment>
            {/* editor area */}
            <Segment
                color="white"
                inverted
                styles={{
                    gridColumn: 'span 6',
                    height: '100%',
                    width: '100%'
                }}>
                <EditorArea />
            </Segment>
            {/*"footer"*/}
            <Segment
                color="brand"
                inverted
                styles={{
                    gridColumn: 'span 6',
                }}>
                <Flex hAlign="center" gap="gap.medium">
                    <Text content="Created by ProjectIt " size='medium'/>
                    <Link href="http://www.projectit.org/" ><Text content="(www.projectit.org)." color="red"/></Link>
                </Flex>
            </Segment>
        </Grid>
    );
};
