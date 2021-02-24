import { isAliasBox, isMetaKey } from "../../../index";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as classNames from "classnames";
import { action, computed, observable } from "mobx";

import { PiKey } from "../../../util/Keys";
import { AbstractChoiceBox } from "../../boxes/AbstractChoiceBox";
import { SelectOption } from "../../boxes/SelectOption";
import { PiUtils } from "../../../util/PiUtils";
import { DropdownComponent } from "../dropdown/DropdownComponent";
import { BehaviorExecutionResult, executeBehavior, PiCaret, PiCaretPosition } from "../../../util/BehaviorUtils";
import * as Keys from "../../../util/Keys";
import { STYLES } from "../styles/Styles";
import { EVENT_LOG, PiLogger, RENDER_LOG } from "../../../util/PiLogging";
import { PiEditor } from "../../PiEditor";

const attachClickOutsideListener = require("click-outside");

const LOGGER = new PiLogger("AbstractChoiceComponent");

export type AbstractChoiceComponentProps = {
    box: AbstractChoiceBox;
    editor: PiEditor;
};

// @observer
export abstract class AbstractChoiceComponent extends React.Component<AbstractChoiceComponentProps, {}> {
    isEditing: boolean = false;
    @observable text: string = "";
    @observable selectedOptionId = "";
    @observable _dropdownIsOpen: boolean = false;
    @observable OPEN: boolean = false;
    @observable hasError: boolean = false;
    private caretPosition: number = 0;

    set dropdownIsOpen(v: boolean) {
        this._dropdownIsOpen = v;
        this.OPEN = v; // && (this.getOptions().length !== 0)
        // TODO:  This force update should not be neccesary, because OPEN is observable
        // if( isSelectBox(this.props.box) ) {
        this.forceUpdate();
        // }
    }

    get dropdownIsOpen() {
        return this._dropdownIsOpen;
    }

    protected element: HTMLDivElement | null = null;
    protected setElement = (element: HTMLDivElement | null) => {
        this.element = element;
    };

    protected dropdown: DropdownComponent | null = null;
    protected setDropdown = (drop: DropdownComponent | null) => {
        this.dropdown = drop;
    };
    disposeClickOutsideListener: Function | null;

    constructor(props: AbstractChoiceComponentProps) {
        super(props);
        this.text = "";
        this.subscribeToBoxEvents(props.box);
    }

    componentWillReceiveProps(nextProps: AbstractChoiceComponentProps) {
        // LOGGER.info(this, "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! componentWillReceiveProps");
        this.subscribeToBoxEvents(nextProps.box);
        // this.props = nextProps;
    }

    componentDidMount() {
        // LOGGER.info(this, "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! componentDidMount");
        this.element!.setAttribute("contentEditable", "true");
        const node: Element | Text | null = ReactDOM.findDOMNode(this);
        this.disposeClickOutsideListener = attachClickOutsideListener(node, this.closeDropdown);
        this.subscribeToBoxEvents(this.props.box);
        this.checkSelected();
    }

    protected checkSelected() {
        const selectedBox = this.props.editor.selectedBox;
        const isSelected = !!this.props.box && !!selectedBox ? this.props.box.id === selectedBox.id : false;
        if (isSelected) {
            LOGGER.info(this, "checkSelected SELECTED position " + this.caretPosition);
            // let caret = this.props.box.caretPosition;
            this.element.focus();
            this.setCaretPosition(this.caretPosition);
        } else {
            // LOGGER.info(this, "!!!!!!!!!!!!!!!!!!!!!!!!!! boxid " + this.props.box.id);
        }
    }

    setFocus = async () => {
        LOGGER.info(this, "!!!!!!!!!!!!!!!!!!!!!!!!! FOCUS");
        if (!!this.element) {
            this.element.focus();
        }
    };

    protected closeDropdown = () => {
        this.dropdownIsOpen = false;
    };

    componentWillUnmount() {
        if (this.disposeClickOutsideListener) {
            this.disposeClickOutsideListener();
            this.disposeClickOutsideListener = null;
        }
    }

    componentDidUpdate() {
        this.props.box.setSetFocus(this.setFocus);
        this.checkSelected();
        // this.props.box.update();
    }

    @computed
    get myStyleClasses(): string {
        const box = this.props.box;
        let styleClasses: string ;

        if (this.text === box.placeholder) {
            styleClasses = classNames(STYLES.alias, box.style);
        } else {
            styleClasses = classNames(box.style, STYLES.aliasSelected );
        }

        if (this.hasError) {
            styleClasses = classNames(STYLES.incorrect, styleClasses);
        }
        return styleClasses;
    }

    render() {
        RENDER_LOG.info(this, "AbstractChoiceComponent");
        const box = this.props.box;

        return (
            <div id={this.props.box.id + "maindiv"} onBlur={this.onBlur}>
                <div
                    id={this.props.box.id + "textdiv"}
                    className={this.myStyleClasses}
                    ref={this.setElement}
                    tabIndex={0}
                    onInput={this.onInput}
                    onKeyDown={this.onKeyDown}
                    onKeyPress={this.onKeyPress}
                    onClick={this.onClick}
                    spellCheck={false}
                    data-placeholdertext={box.placeholder}
                >
                    {this.text}
                </div>
                {this.OPEN && (
                    <DropdownComponent
                        handleSelectedOption={this.handleSelected}
                        selectedOptionId={this.selectedOptionId}
                        setSelectedOption={this.setSelectedOption}
                        getOptions={this.getOptions}
                        styleClasses={[]}
                        ref={this.setDropdown}
                    />
                )}
            </div>
        );
    }

    protected handleSelected = (optionId: string) => {
        LOGGER.info(this, "handleSelected " + optionId);
        executeBehavior(this.props.box, optionId, this.props.editor);
        this.dropdownIsOpen = false;
        // this.element.focus();
    };

    // Used to keep track of currently selected option
    protected setSelectedOption = (id: string): void => {
        this.selectedOptionId = id;
    };

    protected abstract getOptions: () => SelectOption[];

    protected onClick = async () => {
        EVENT_LOG.info(this, "onClick");
        this.dropdownIsOpen = true;
        this.startEditing();
        if (!!this.element && this.element.innerText === this.props.box.placeholder) {
            this.setCaretToMostLeft();
        }
        this.props.box.caretPosition = this.getCaretPosition();
    };

    protected onBlur = async (e: React.SyntheticEvent<any>) => {
        EVENT_LOG.info(this, "onBlur: " + e.type);
        this.stopEditing();
        e.stopPropagation();
    };

    protected onInput = async (e: React.SyntheticEvent<any>) => {
        e.persist();
        EVENT_LOG.info(this, "onInput [" + this.element.innerText + "]");
        this.props.box.caretPosition = this.getCaretPosition();
        this.caretPosition = this.props.box.caretPosition;
        const aliasResult = await this.handleStringInput(this.element.innerText);
        if (aliasResult === BehaviorExecutionResult.NO_MATCH || aliasResult === BehaviorExecutionResult.PARTIAL_MATCH) {
            this.dropdownIsOpen = true;
        }
        if (this.props.box.deleteWhenEmpty1() && this.element.innerText.length === 0) {
            await this.props.editor.deleteBox(this.props.box);
        }
    };

    protected onKeyDown = async (e: React.KeyboardEvent<any>) => {
        EVENT_LOG.info(this, "onKeyDown: " + e.key + " for role " + this.props.box.role);
        if (Keys.isPrintable(e) && !e.ctrlKey) {
            LOGGER.info(this, "is printable");
            e.stopPropagation();
            return;
        }
        if (e.keyCode === Keys.DELETE) {
            e.stopPropagation();
        }
        if (!this.shouldPropagate(e)) {
            e.stopPropagation();
        }
        if (this.dropdownIsOpen && this.dropdown) {
            // Propagate key event to dropdown component
            LOGGER.info(this, "Forwarding event to dropdown component");
            const x = this.dropdown.handleKeyDown(e);
            LOGGER.info(this, "handled result: " + x);
            if (x) {
                e.preventDefault();
                e.stopPropagation();
                this.setCaretToMostRight();
                this.props.box.caretPosition = this.getCaretPosition();
                this.caretPosition = this.props.box.caretPosition;
                LOGGER.info(this, "caret " + this.props.box.caretPosition);
            }
            switch (e.keyCode) {
                case Keys.ENTER:
                    e.preventDefault();
                    break;
            }
        } else {
            switch (e.keyCode) {
                case Keys.ENTER:
                    e.preventDefault();
                    const handled = false;
                    if (isAliasBox(this.props.box)) {
                        await PiUtils.handleKeyboardShortcut(Keys.reactToKey(e), this.props.box, this.props.editor);
                        // if (handled) {
                        e.stopPropagation();
                        // }
                    }
                    // TODO Copied from TExtComponent for special case, should solve generically
                    // Try the key on next box, if at the end of this box.
                    // if( !handled) {
                    //     const box = this.props.box;
                    //     this.props.editor.selectNextLeaf();
                    //     EVENT_LOG.info(this, "KeyDownAction NEXT LEAF IS " + this.props.editor.selectedBox.role);
                    //     if (isAliasBox(this.props.editor.selectedBox)) {
                    //         this.props.editor.selectedBox.triggerKeyDownEvent(Keys.reactToKey(e));
                    //     }
                    // }
                    break;
                case Keys.SPACEBAR:
                    LOGGER.info(this, "onKeyDown Keys.SPACEBAR");
                    if (e.ctrlKey) {
                        this.dropdownIsOpen = true;
                    }
                    break;
            }
        }
    };

    protected onKeyPress = (e: React.KeyboardEvent<any>) => {
        EVENT_LOG.info(this, "onKeyPress: " + e.key + "  " + this.props.box.actualWidth);
        this.props.box.caretPosition = this.getCaretPosition() + 1;
        e.stopPropagation();
    };

    protected subscribeToBoxEvents = (box: AbstractChoiceBox) => {
        // LOGGER.info(this, "subscribeToBoxEvents")
        box.setCaret = this.setCaret;
        box.triggerKeyPressEvent = this.triggerKeyPressEvent;
        box.triggerKeyDownEvent = this.triggerKeyDownEvent;
        box.setSetFocus(this.setFocus);
        // box.setFocus = this.setFocus;
    };

    /**
     * Trigger a key event for `key`.
     * @param {string} key
     * @returns {Promise<void>}
     */
    triggerKeyPressEvent = async (key: string) => {
        LOGGER.info(this, "triggerKeyPressEvent " + key);
        const aliasResult = await this.handleStringInput(key);
        if (aliasResult !== BehaviorExecutionResult.EXECUTED) {
            if (this.element) {
                this.element.innerText = key;
                this.setCaretPosition(this.element.innerText.length);
                this.dropdownIsOpen = true;
            }
        }
    };

    /**
     * Trigger a key event for `key`.
     * @param {string} key
     * @returns {Promise<void>}
     */
    triggerKeyDownEvent = async (key: PiKey) => {
        LOGGER.info(this, "triggerKeyDownEvent: " + key.keyCode);
        const result: boolean = await PiUtils.handleKeyboardShortcut(key, this.props.box, this.props.editor);
    };

    @action
    handleStringInput = async (s: string) => {
        LOGGER.info(this, "handleStringInput for box " + this.props.box.role);
        const aliasResult = await executeBehavior(this.props.box, s, this.props.editor);
        switch (aliasResult) {
            case BehaviorExecutionResult.EXECUTED:
                if (this.element) {
                    this.element.innerText = "";
                }
                this.dropdownIsOpen = false;
                this.hasError = false;
                break;
            case BehaviorExecutionResult.PARTIAL_MATCH:
                LOGGER.info(this, "PARTIAL_MATCH");
                this.hasError = false;
                break;
            case BehaviorExecutionResult.NO_MATCH:
                LOGGER.info(this, "NO MATCH");
                this.hasError = true;
                break;
        }
        return aliasResult;
    };

    protected setCaret = (caret: PiCaret) => {
        LOGGER.info(this, "setCaret " + caret);
        switch (caret.position) {
            case PiCaretPosition.RIGHT_MOST:
                this.setCaretToMostRight();
                break;
            case PiCaretPosition.LEFT_MOST:
                this.setCaretToMostLeft();
                break;
            case PiCaretPosition.INDEX:
                this.setCaretPosition(caret.index);
                break;
            case PiCaretPosition.UNSPECIFIED:
                break;
        }
    };

    protected setCaretToMostLeft = () => {
        this.startEditing();
        this.setCaretPosition(0);
    };

    protected setCaretToMostRight = () => {
        LOGGER.info(this, "setCaretToMostRight");
        this.startEditing();
        if (!this.element) {
            LOGGER.info(this, "setCaretToMostRight: empty element");
            return;
        }
        if (this.element.innerText === this.props.box.placeholder) {
            LOGGER.info(this, "setCaretToMostRight: set left for placeholder");
            this.setCaretPosition(0);
        } else {
            LOGGER.info(this, "setCaretToMostRight: position " + this.element.innerText.length);
            this.setCaretPosition(this.element.innerText.length);
        }
    };

    startEditing = () => {
        if (this.isEditing) {
            return;
        }
        this.isEditing = true;
    };

    stopEditing = () => {
        this.isEditing = false;
        this.props.box.caretPosition = -1;
        if (!!this.element) {
            this.element.innerText = "";
        }
        this.dropdownIsOpen = false;
        this.hasError = false;
        this.clearSelection();
    };

    protected setCaretPosition = (position: number) => {
        if (position === -1) {
            return;
        }
        this.clearSelection();
        const range = document.createRange();
        // TODO sometimes childnodes tdo not exist,  is this ok?
        try {
            if (!!this.element && !!this.element.childNodes && this.element.childNodes[0]) {
                range.setStart(this.element.childNodes[0], Math.min(position, this.element.innerText.length));
            } else {
                if (!!this.element) {
                    range.setStart(this.element, position);
                }
            }
        } catch (e) {
            console.log(e.toString());
        }
        range.collapse(true);
        window.getSelection().addRange(range);
    };

    private setCaret3(position: number) {
        const el = this.element;
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(el.childNodes[0], position);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    // TODO Only for <input> element
    // Credits: http://blog.vishalon.net/index.php/javascript-getting-and-setting-caret-position-in-textarea/
    // private setCaretPosition3(pos: number) {
    //     // Modern browsers
    //     if (this.element.setSelectionRange) {
    //         this.element.focus();
    //         this.element.setSelectionRange(pos, pos);
    //
    //         // IE8 and below
    //     } else if (ctrl.createTextRange) {
    //         var range = ctrl.createTextRange();
    //         range.collapse(true);
    //         range.moveEnd('character', pos);
    //         range.moveStart('character', pos);
    //         range.select();
    //     }
    // }
    private setCaretPosition2 = (position: number) => {
        if (position === -1) {
            return;
        }
        if (!this.element.innerText) {
            // TODO Find out why innertext can be falsy.
            return;
        }
        if (position > this.element.innerText.length) {
            // TODO Fix the error below
            console.log("ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR; ");
            console.log("TExtComponent.setCaretPosition >length: " + position + " > " + this.element.innerText.length);
            // position = this.element.innerText.length;
        }
        this.clearSelection();
        const range = document.createRange();
        if (this.element!.childNodes[0]) {
            range.setStart(this.element!.childNodes[0], position);
        } else {
            range.setStart(this.element!, position);
        }
        range.collapse(true);
        window.getSelection().addRange(range);
        this.caretPosition = position;
        this.props.box.caretPosition = position;
    };

    protected clearSelection = () => {
        window.getSelection().removeAllRanges();
    };

    protected getCaretPosition = (): number => {
        return window.getSelection().focusOffset;
    };

    protected shouldPropagate = (e: React.KeyboardEvent<any>): boolean => {
        if (isMetaKey(e)) {
            if (e.keyCode === Keys.ARROW_UP || e.keyCode === Keys.ARROW_DOWN || e.keyCode === Keys.TAB) {
                return true;
            }
        }
        if (e.keyCode === Keys.ENTER || e.keyCode === Keys.TAB) {
            return true;
        }
        if (e.keyCode === Keys.ARROW_UP || e.keyCode === Keys.ARROW_DOWN) {
            return true;
        }
        const caretPosition = this.getCaretPosition();
        if (e.keyCode === Keys.ARROW_LEFT || e.keyCode === Keys.BACKSPACE) {
            return caretPosition <= 0;
        } else if (e.keyCode === Keys.ARROW_RIGHT || e.keyCode === Keys.DELETE) {
            return caretPosition >= this.element.innerText.length;
        } else {
            return false;
        }
    };
}
