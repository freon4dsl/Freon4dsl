<script>
    import { versionNumber } from "../stores/UserMessageStore.js";
    import { helpDialogVisible } from "../stores/DialogStore.js";
    import Dialog, { Actions, Title } from "@smui/dialog";
    import Button, { Label } from "@smui/button";
    import List, { Item, Text } from "@smui/list";
    import Card, { Content } from '@smui/card';
</script>

<Dialog
        bind:open={$helpDialogVisible}
        aria-labelledby="event-title"
        aria-describedby="event-content"
>
    <Title id="event-title">Help for Freon</Title>
    <Content id="event-content">
        <div class="mdc-typography--body2">
            Currently there is no in-build help functionality, other than the following. For more, we refer you to our
            website:
            <a href="http://www.freon4dsl.dev/" target="_blank" rel="noreferrer">
                www.freon4dsl.dev
            </a>
        </div>

        <hr>

        <div class="mdc-typography--headline6">Context menu</div>
        <div class="mdc-typography--body2">
        Using the right mouse button a context menu can be shown for elements that are
        part of a list. This menu offers some functionality on the selected list element, like cut/copy/paste.
        </div>

        <div class="mdc-typography--headline6">Drag and drop</div>
        <div class="mdc-typography--body2">
        Drag and drop functionality is provided for list elements. An element can be dragged from a list (or table),
        and dropped in a list (or table). Note that you should click outside of any editable text to grab the element.
        </div>

        <div class="mdc-typography--headline6">Keybindings</div>
        <div class="mdc-typography--body2">
            When editing a text field, e.g. a name, the ENTER key stops the editing and stores the value in the model,
            whereas the ESC key stops the editing without storing the value.
        </div>

        <div class="mdc-typography--body2">
        Keys that can be used anywhere:
        </div>
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
        <Card padded>
            <div style="text-align: center">
                <div class="mdc-typography--body2">
                    <b>Freon</b> is an open source project which can be found at:
                    <br>
                    <a href="https://github.com/freon4dsl" target="_blank" rel="noreferrer">
                        https://github.com/freon4dsl.
                    </a>
                    <br>
                    Current version: <b>{versionNumber}</b>.
                    <br>
                    Created by: <a href="http://www.openmodeling.nl/" target="_blank" rel="noreferrer">www.openmodeling.nl</a>.
                </div>
            </div>
        </Card>

    </Content>
    <Actions>
        <Button variant="raised" action="accept" default>
            <Label>Done</Label>
        </Button>
    </Actions>
</Dialog>


