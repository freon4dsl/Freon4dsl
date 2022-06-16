<script>
    import { versionNumber } from "../stores/UserMessageStore.js";
    import { helpDialogVisible } from "../stores/DialogStore.js";
    import Dialog, { Actions, Title } from "@smui/dialog";
    import { Content } from "@smui/card";
    import Textfield from "@smui/textfield";
    import Button, { Label } from "@smui/button";
    import List, { Item, Text } from "@smui/list";
</script>

<Dialog
        bind:open={$helpDialogVisible}
        aria-labelledby="event-title"
        aria-describedby="event-content"
>
    <Title id="event-title">Help for ProjectIt</Title>
    <Content id="event-content">
        <div class="mdc-typography--body2">
            Currently there is no in-build help functionality, other than a list of keybindings. We refer you to our
            website:
            <a href="http://www.projectit.org/" target="_blank">
                www.projectit.org
            </a>
        </div>

        <hr>

        <div class="mdc-typography--headline6">Keybindings</div>

        <List class="keybinding" dense>
            <Item>
                <Text>Arrow Keys move in the expected direction</Text>
            </Item>
            <Item>
                <Text>TAB key moves to next place where the user can type something</Text>
            </Item>
            <Item>
                <Text>Ctrl-UP selects the parent element in the AST</Text>
            </Item>
            <Item>
                <Text>Ctrl-DOWN selects the first child element in the AST</Text>
            </Item>
            <Item>
                <Text>Ctrl-SPACE shows popup menu of possible options</Text>
            </Item>
            <Item>
                <Text>DEL deletes the next character or the currently selected item from the AST</Text>
            </Item>
        </List>

        <hr>
        <div class="mdc-typography--headline6">About ProjectIt</div>

        <div class="mdc-typography--body2">
            ProjectIt is an open source project which can be found at:
            <a href="https://github.com/projectit-org" target="_blank">
                https://github.com/projectit-org.
            </a>
        </div>
        <div class="mdc-typography--body2">
            Current version: <b>{versionNumber}</b>.
        </div>
        <div class="mdc-typography--body2">
            Created by: <a href="http://www.openmodeling.nl/" target="_blank">www.openmodeling.nl</a>.
        </div>

    </Content>
    <Actions>
        <Button variant="raised" action="accept" default>
            <Label>Done</Label>
        </Button>
    </Actions>
</Dialog>


