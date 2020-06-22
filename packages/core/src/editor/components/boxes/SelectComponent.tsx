import { observer } from "mobx-react";
import * as React from "react";

import { isSelectBox } from "../../boxes/SelectBox";
import { AbstractChoiceComponent } from "./AbstractChoiceComponent";
import { SelectOption } from "../../boxes/SelectOption";
import { findExactOption, findExactOptionId, findOption } from "../dropdown/DropdownOption";
import { BehaviorExecutionResult } from "../../../util/BehaviorUtils";
import { PiLogger } from "../../../util/PiLogging";
import { SelectBox } from "../../boxes/SelectBox";
import { PiEditor } from "../../PiEditor";

const LOGGER = new PiLogger("SelectComponent");

export type SelectComponentProps = {
    box: SelectBox;
    editor: PiEditor;
};

@observer
export class SelectComponent extends AbstractChoiceComponent {
    constructor(props: SelectComponentProps) {
        super(props);
        this.text = "";
        this.updateFromProps(props);
    }

    private updateFromProps(props: SelectComponentProps) {
        LOGGER.info(this, "updateFromProps");
        const selected = props.box.getSelectedOption();
        if (!!selected) {
            this.text = selected.label;
        }
        this.subscribeToBoxEvents(props.box);
    }
    // set dropdownIsOpen(v: boolean) {
    //     this._dropdownIsOpen = v;
    //     this.OPEN = v && (this.getOptions().length !== 0)
    //     // TODO:  This force update should not be neccesary, because OPEN is observable
    //     this.forceUpdate();
    // }

    // componentWillReceiveProps(nextProps: SelectComponentProps) {
    //     LOGGER.info(this,"componentWillReceiveProps");
    //     const selected = nextProps.box.getSelectedOption();
    //     if( !!selected){
    //         this.text = selected.label ;
    //     }
    //     this.subscribeToBoxEvents(nextProps.box);
    //     this.props = nextProps;
    // }

    protected handleSelected = (optionId: string) => {
        LOGGER.info(this, "handleSelected: " + optionId);
        // TODO: execute user action

        if (optionId === "ESCAPE") {
            this.dropdownIsOpen = false;
            return;
        }
        if (isSelectBox(this.props.box)) {
            let option = (!!optionId ? this.getOptions()[findExactOptionId(this.getOptions(), optionId)] : null);
            LOGGER.info(this, "handleSelected option: " + (!!option ? option.label: "null"));
            this.props.box.setSelectedOption(option);
            LOGGER.info(this, "handleSelected option done");
            this.dropdownIsOpen = false;
            this.element.innerText = (!!option ? option.label: "");
            this.text = (!!option ? option.label: "");
            this.hasError = false;
            this.element.focus();
            this.setCaretToMostRight();
        }
    };

    protected getOptions = (): SelectOption[] => {
        if (isSelectBox(this.props.box)) {
            if (!!this.element.innerText) {
                LOGGER.info(this, "innerText [" + this.element.innerText + "]");
                const options: SelectOption[] = this.props.box.getOptions().filter(s => {
                    LOGGER.info(this, "filtering [" + s.label + "]");
                    return s.label.startsWith(this.element.innerText);
                });
                LOGGER.info(this, "options [" + JSON.stringify(options) + "]");
                return options;
            } else {
                return this.props.box.getOptions();
            }
        }
        return [];
    };

    stopEditing = () => {
        LOGGER.info(this, "Stop Editing");
        this.isEditing = false;
        this.props.box.caretPosition = -1;
        if (!!this.element) {
            const selected = (this.props as SelectComponentProps).box.getSelectedOption();
            if (selected !== null) {
                this.text = selected.label;
            }
            this.element.innerText = this.text;
        }
        this.dropdownIsOpen = false;
        this.hasError = false;
        this.clearSelection();
    };

    handleStringInput = async (s: string) => {
        LOGGER.info(this, "OOO handleStringInput for box " + this.props.box.role);
        const optionIndex = findExactOption(this.getOptions(), s);
        if (optionIndex !== -1) {
            LOGGER.info(this, "SELECT COMPONENT SELECTED " + optionIndex);
            this.handleSelected(this.getOptions()[optionIndex].id);
            this.hasError = false;
            this.dropdownIsOpen = false;
            return BehaviorExecutionResult.EXECUTED;
        }
        const partial = findOption(this.getOptions(), s);
        if (partial !== -1) {
            this.hasError = false;
            this.setSelectedOption(this.getOptions()[0].id);
            return BehaviorExecutionResult.PARTIAL_MATCH;
        } else {
            this.hasError = true;
            return BehaviorExecutionResult.NO_MATCH;
        }
    };
}
