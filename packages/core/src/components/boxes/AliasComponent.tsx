import { observer } from "mobx-react";
import { MatchUtil } from "../../util/MatchUtil";
import * as React from "react";

import { isString, triggerToString } from "../../editor/PiAction";
import { SelectOption } from "../../boxes/SelectOption";
import { AbstractChoiceComponent } from "./AbstractChoiceComponent";
import {
  BehaviorExecutionResult,
  executeBehavior
} from "../../util/BehaviorUtils";
import { EVENT_LOG, PiLogger } from "../../util/PiLogging";
import { AliasBox } from "../../boxes/AliasBox";
import { PiEditor } from "../../editor/PiEditor";

const LOGGER = new PiLogger("AliasComponent");

export type AliasComponentProps = {
  box: AliasBox;
  editor: PiEditor;
};

@observer
export class AliasComponent extends AbstractChoiceComponent {
  constructor(props: AliasComponentProps) {
    super(props);
    // this.text = "";
    // this.subscribeToBoxEvents(props.box);
  }

  protected handleSelected = (optionId: string) => {
    LOGGER.info(this, "handleSelected " + optionId);
    executeBehavior(this.props.box, optionId, this.props.editor);
    this.dropdownIsOpen = false;
    // this.element.focus();
  };

  protected getOptions = (): SelectOption[] => {
    let result = this.props.editor.behaviors
      .filter(
        a =>
          a.activeInBoxRoles.includes(this.props.box.role) &&
          MatchUtil.partialMatch(this.element.innerText, a.trigger)
      )
      .map(a => {
        return {
          id: triggerToString(a.trigger),
          label: triggerToString(a.trigger),
          description: "alias " + triggerToString(a.trigger)
        };
      });
    return result;
  };

  handleStringInput = async (s: string) => {
    LOGGER.info(
      this,
      "handleStringInput for box " +
        this.props.box.role +
        " isOpen " +
        this.OPEN +
        " text is [" +
        this.text +
        "]"
    );
    let options = this.getOptions();
    if (options.length > 1) {
      LOGGER.info(this, " > 1 option");
      this.hasError = false;
      this.setSelectedOption(options[0].id);
      this.dropdownIsOpen = true;
    }
    const aliasResult = await executeBehavior(
      this.props.box,
      s,
      this.props.editor
    );
    switch (aliasResult) {
      case BehaviorExecutionResult.EXECUTED:
        if (this.element) {
          this.element.innerText = "";
        }
        // this.dropdownIsOpen = false;
        this.hasError = false;
        break;
      case BehaviorExecutionResult.PARTIAL_MATCH:
        LOGGER.info(this, "PARTIAL_MATCH");
        this.hasError = false;
        this.dropdownIsOpen = true;
        break;
      case BehaviorExecutionResult.NO_MATCH:
        LOGGER.info(this, "NO MATCH");
        this.hasError = true;
        // this.dropdownIsOpen = true;
        break;
    }
    return aliasResult;
  };

  protected onClick = () => {
    EVENT_LOG.info(this, "onClick");
    // this.dropdownIsOpen = true;
    this.startEditing();
    if (
      !!this.element &&
      this.element.innerText === this.props.box.placeholder
    ) {
      this.setCaretToMostLeft();
    }
    this.props.box.caretPosition = this.getCaretPosition();
  };
}
