import { observer } from "mobx-react";
import * as React from "react";

import { SelectOption } from "../../boxes/SelectOption";
import { EVENT_LOG, PiLogger } from "../../util/PiLogging";
import * as Keys from "../../util/Keys";
import { DropdownItem } from "./DropdownItem";

const styles = require("../styles/DropdownComponent.scss");
const LOGGER = new PiLogger("DropdownComponent");

export type DropdownProps = {
    // Called when option is selected
    handleSelectedOption: (optionId: string) => void;
    selectedOptionId: string;
    getOptions: () => SelectOption[];
    setSelectedOption: (id: string) => void;
    styleClasses: string[];
    className?: string;
};

@observer
export class DropdownComponent extends React.Component<DropdownProps, {}> {
    private element: HTMLDivElement;
    private setElement = (element: HTMLDivElement | null) => {
        if (element) {
            this.element = element;
        }
    };

    constructor(props: DropdownProps) {
        super(props);
        if (this.props.selectedOptionId === "") {
            this.initOption();
        }
        LOGGER.info(this, "constructor");
    }

    private initOption() {
        const options = this.props.getOptions();
        if (options.length > 0) {
            this.props.setSelectedOption(options[0].id);
        }
    }
    render() {
        LOGGER.info(this, "render");
        return (
            <div
                className={styles.dropdown}>
                <div
                    ref={this.setElement}
                    tabIndex={0}
                    onKeyUp={this.onKeyUp}
                    onKeyPress={this.onKeyUp}
                />
                <div className={styles.popupWrapper}>
                    {this.renderDropdownOptions()}
                </div>
            </div>
        );
    }

    private renderDropdownOption = (option: SelectOption, index: number) => {
        const isSelected = option.id === this.props.selectedOptionId;
        return (
            <div key={option.id}>
                <DropdownItem
                    onClick={this.selectOption}
                    option={option}
                    selected={isSelected}
                />
            </div>
        );
    };

    private renderDropdownOptions() {
        return (
            <div className={styles.popup}>
                {this.props.getOptions().map(this.renderDropdownOption)}
            </div>
        );
    }

    /** Supports Arrow up and down keys, Enter for selection
     * Escape is forwarded to owning component, so it may use it to close the dropdown.
     *
     * NB: Called by owning component to forward key event !!
     * @param {React.KeyboardEvent<any>} e
     * @returns {boolean}
     */
    handleKeyDown(e: React.KeyboardEvent<any>): boolean {
        LOGGER.info(this, "handleKeyDown " + e.key);
        const options = this.props.getOptions();
        const index = options.findIndex(o => o.id === this.props.selectedOptionId);
        switch (e.keyCode) {
            case Keys.ARROW_DOWN:
                if (index + 1 < options.length) {
                    this.props.setSelectedOption(options[index + 1].id);
                }
                return true;
            case Keys.ARROW_UP:
                if (index > 0) {
                    this.props.setSelectedOption(options[index - 1].id);
                }
                return true;
            case Keys.ENTER:
                if (index >= 0 && index < options.length) {
                    this.props.handleSelectedOption(options[index].id);
                    this.initOption();
                    return true;
                } else {
                    return false;
                }
            case Keys.ESCAPE:
                this.props.handleSelectedOption("ESCAPE");
                this.initOption();
                return true;
        }
        return false;
    }

    private onKeyUp = (e: React.KeyboardEvent<any>) => {
        EVENT_LOG.info(this, "onKeyUp: " + e.key);
        if (e.keyCode === Keys.ESCAPE) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    private selectOption = (option: SelectOption): void => {
        LOGGER.info(this, "selectOption " + JSON.stringify(option));
        if (option && option.label !== undefined) {
            this.props.handleSelectedOption(option.id);
        }
    };
}
