import * as classNames from "classnames";
import { observer } from "mobx-react";
import * as React from "react";

import { PiLogger } from "../../util/PiLogging";
import { isAliasBox } from "../../boxes/AliasBox";
import { KeyPressAction, TextBox } from "../../boxes/TextBox";
import { PiEditor } from "../../editor/PiEditor";
import { PiCaret, PiCaretPosition } from "../../util/BehaviorUtils";
import * as Keys from "../../util/Keys";
import { isMetaKey, reactToKey } from "../../util/Keys";
import { EVENT_LOG, RENDER_LOG } from "../../util/PiLogging";
import { PiUtils } from "../../util/PiUtils";
import { STYLES } from "../styles/Styles";

const LOGGER = new PiLogger("TextComponent");

export type TextComponentProps = {
  box: TextBox;
  editor: PiEditor;
};

@observer
export class TextComponent extends React.Component<TextComponentProps, {}> {
  originalValue: string = "";
  isEditing: boolean = false;
  private caretPosition: number = 0;
  private element: HTMLDivElement | null = null;
  private setElement = (element: HTMLDivElement | null) => {
    this.element = element;
  };

  constructor(props: TextComponentProps) {
    super(props);
    this.subscribeToBoxEvents(props.box);
  }

  componentWillReceiveProps(nextProps: TextComponentProps) {
    this.subscribeToBoxEvents(nextProps.box);
  }

  componentDidMount() {
    LOGGER.info(this, "componentDidMount");
    this.element!.setAttribute("contentEditable", "true");
    this.setCaretPosition(this.props.box.caretPosition);
    LOGGER.info(
      this,
      "componentDidMount caret: " + this.props.box.caretPosition
    );
    this.checkSelected();
  }

  componentDidUpdate() {
    LOGGER.info(
      this,
      "componentDidUpdate to [" + this.props.box.getText() + "]"
    );
    LOGGER.info(this, "      caret [" + this.props.box.caretPosition + "]");
    // Ensure the selectable parent component calculates the new coordinates
    this.props.box.update();
    LOGGER.info(this, "      caret [" + this.props.box.caretPosition + "]");
    this.setCaretPosition(this.props.box.caretPosition);
    this.checkSelected();
  }

  protected checkSelected() {
    const selectedBox = this.props.editor.selectedBox;
    let isSelected =
      !!this.props.box && !!selectedBox
        ? this.props.box.id === selectedBox.id
        : false;
    if (isSelected) {
      LOGGER.info(
        this,
        "!!!!!!!!!!!!!!!!!!!!!!!!!! SELECTED position " + this.caretPosition
      );
      this.element.focus();
      this.setCaretPosition(this.caretPosition);
    } else {
      // LOGGER.info(this, "!!!!!!!!!!!!!!!!!!!!!!!!!! boxid " + this.props.box.id);
    }
  }

  render() {
    RENDER_LOG.info(this, "Text");
    const box = this.props.box;
    const styleClasses = classNames(STYLES.text, box.style);

    return (
      <div
        id={this.props.box.id}
        className={styleClasses}
        ref={this.setElement}
        tabIndex={0}
        onFocus={this.onFocus}
        onInput={this.onInput}
        onKeyDown={this.onKeyDown}
        onKeyPress={this.onKeyPress}
        onClick={this.onClick}
        onBlur={this.onBlur}
        data-placeholdertext={box.placeHolder}
        spellCheck={false}
        onPaste={this.onPaste}
      >
        {this.props.box.getText()}
      </div>
    );
  }

  private onFocus = () => {
    LOGGER.info(
      this,
      "onFocus: " + this.props.box.role + " : " + this.props.box.element.piId()
    );
  };

  private onClick = () => {
    EVENT_LOG.info(this, "onClick: " + this.props.box.getText());
    this.startEditing();
    this.props.box.caretPosition = this.getCaretPosition();
  };

  private onBlur = () => {
    EVENT_LOG.info(this, "onBlur: " + this.props.box.getText());
  };

  private onPaste = (e: React.SyntheticEvent<any>) => {
    EVENT_LOG.info(this, "onPaste: disabled pasting in text");
    e.stopPropagation();
    e.preventDefault();
    return false;
  };

  private onInput = async () => {
    const innerTextNotNull: string =
      this.element.innerText !== null ? this.element.innerText : "";

    EVENT_LOG.info(this, "onInput innerText [" + innerTextNotNull + "]");
    let box = this.props.box;
    box.caretPosition = this.getCaretPosition();
    this.caretPosition = box.caretPosition;
    this.props.editor.selectedPosition = PiCaret.IndexPosition(
      box.caretPosition
    );
    box.setText(innerTextNotNull);
    if (box.deleteWhenEmpty && box.getText().length === 0) {
      EVENT_LOG.info(this, "delete empty text");
      this.props.editor.deleteBox(box);
    }
    LOGGER.info(this, "END END");
    await this.props.editor.selectElement(
      box.element,
      box.role,
      this.props.editor.selectedPosition
    );
  };

  private onKeyDown = (e: React.KeyboardEvent<any>) => {
    EVENT_LOG.info(
      this,
      "onKeyDown: key " +
        e.key +
        " keyCode " +
        e.keyCode +
        " charCode " +
        e.charCode +
        " isMeta?: " +
        isMetaKey(e)
    );
    let handled: boolean = false;
    const caretPosition = this.getCaretPosition();
    if (e.keyCode === Keys.DELETE) {
      if (this.element.innerText === "") {
        if (this.props.box.deleteWhenEmptyAndErase) {
          this.props.editor.deleteBox(this.props.editor.selectedBox);
          e.stopPropagation();
          return;
        }
      }
      e.stopPropagation();
      return;
    }
    if (e.keyCode === Keys.BACKSPACE) {
      if (this.element.innerText === "") {
        if (this.props.box.deleteWhenEmptyAndErase) {
          this.props.editor.deleteBox(this.props.editor.selectedBox);
          e.stopPropagation();
          return;
        }
      }
    }
    if (!this.shouldPropagate(e)) {
      e.stopPropagation();
    }
    if (this.shouldIgnore(e)) {
      e.preventDefault();
    } else {
      // E.g. for all printable keys.
      handled = true;
    }
    const proKey = reactToKey(e);
    if (
      !handled &&
      !isMetaKey(e) &&
      !PiUtils.handleKeyboardShortcut(proKey, this.props.box, this.props.editor)
    ) {
      EVENT_LOG.info(
        this,
        "Key not handled for element " + this.props.box.element
      );
      // Try the key on next box, if at the end of this box.
      const box = this.props.box;
      const insertionIndex = this.getCaretPosition();
      if (insertionIndex >= box.getText().length) {
        this.props.editor.selectNextLeaf();
        EVENT_LOG.info(
          this,
          "KeyDownAction NEXT LEAF IS " + this.props.editor.selectedBox.role
        );
        if (isAliasBox(this.props.editor.selectedBox)) {
          this.props.editor.selectedBox.triggerKeyDownEvent(proKey);
        }
        e.preventDefault();
        e.stopPropagation();
      }
    }
  };

  private onKeyPress = (e: React.KeyboardEvent<any>) => {
    EVENT_LOG.info(
      this,
      "onKeyPress: " + e.key + "  " + this.props.box.actualWidth
    );
    const box = this.props.box;
    const insertionIndex = this.getCaretPosition();
    switch (
      this.props.box.keyPressAction(box.getText(), e.key, insertionIndex)
    ) {
      case KeyPressAction.OK:
        EVENT_LOG.info(this, "KeyPressAction.OK");
        // box.setText(this.newText(box.getText(), insertionIndex, e.key));
        box.caretPosition = this.getCaretPosition() + 1;
        // e.preventDefault();
        e.stopPropagation();
        break;
      case KeyPressAction.NOT_OK:
        EVENT_LOG.info(this, "KeyPressAction.NOT_OK");
        e.preventDefault();
        e.stopPropagation();
        break;
      case KeyPressAction.GOTO_NEXT:
        EVENT_LOG.info(this, "KeyPressAction.GOTO_NEXT");
        this.props.editor.selectNextLeaf();
        EVENT_LOG.info(
          this,
          "NEXT LEAF IS " + this.props.editor.selectedBox.role
        );
        if (isAliasBox(this.props.editor.selectedBox)) {
          this.props.editor.selectedBox.triggerKeyPressEvent(e.key);
        }
        e.preventDefault();
        e.stopPropagation();
        break;
    }
  };

  newText(text: string, index: number, char: string): string {
    return text.substring(0, index) + char + text.substring(index, text.length);
  }

  private setFocus = (): void => {
    LOGGER.info(this, "TextComponent set focus " + this.props.box.role);
    this.startEditing();
  };

  private subscribeToBoxEvents = (box: TextBox) => {
    box.setCaret = this.setCaret;
    box.setFocus = this.setFocus;
  };

  private setCaret = (caret: PiCaret) => {
    switch (caret.position) {
      case PiCaretPosition.RIGHT_MOST:
        LOGGER.info(this, "setCaretPosition RIGHT");
        this.setCaretToMostRight();
        break;
      case PiCaretPosition.LEFT_MOST:
        LOGGER.info(this, "setCaretPosition LEFT");
        this.setCaretToMostLeft();
        break;
      case PiCaretPosition.INDEX:
        LOGGER.info(this, "setCaretPosition INDEX");
        this.setCaretPosition(caret.index);
        break;
      case PiCaretPosition.UNSPECIFIED:
        LOGGER.info(this, "setCaretPosition UNSPECIFIED");
        break;
      default:
        LOGGER.info(this, "setCaretPosition ERROR");
        break;
    }
    this.element.focus();
  };

  private setCaretToMostLeft = () => {
    this.startEditing();
    this.setCaretPosition(0);
  };

  private setCaretToMostRight = () => {
    this.startEditing();
    LOGGER.info(
      this,
      "setCaretPosition RIGHT: " + this.props.box.getText().length
    );
    this.setCaretPosition(this.props.box.getText().length);
  };

  private shouldPropagate = (e: React.KeyboardEvent<any>): boolean => {
    if (isMetaKey(e)) {
      if (
        e.keyCode === Keys.ARROW_UP ||
        e.keyCode === Keys.ARROW_DOWN ||
        e.keyCode === Keys.TAB
      ) {
        return true;
      }
    }
    if (
      e.keyCode === Keys.ENTER ||
      e.keyCode === Keys.DELETE ||
      e.keyCode === Keys.TAB
    ) {
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

  private shouldIgnore = (e: React.KeyboardEvent<any>): boolean => {
    if (e.altKey) {
      return true;
    }
    if (e.keyCode === Keys.ENTER || e.keyCode === Keys.TAB) {
      return true;
    }
    return false;
  };

  startEditing = () => {
    if (this.isEditing) {
      return;
    }
    this.isEditing = true;
    this.originalValue = this.props.box.getText(); // this.text;

    // don't require extra click in FF
    if (this.element) {
      this.element.focus();
    }
  };

  stopEditing = (aborted?: boolean) => {
    this.isEditing = false;

    this.props.box.caretPosition = -1;
    if (aborted) {
      this.props.box.setText(this.originalValue);
    }
    this.clearSelection();
  };

  private getCaretPosition = (): number => {
    return window.getSelection().focusOffset;
  };

  private setCaretPosition = (position: number) => {
    if (position === -1) {
      return;
    }
    if (!this.element.innerText) {
      // TODO Find out why innertext can be falsy.
      return;
    }
    if (position > this.element.innerText.length) {
      // TODO Fix the error below
      console.log(
        "ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR; "
      );
      console.log(
        "TExtComponent.setCaretPosition >length: " +
          position +
          " > " +
          this.element.innerText.length
      );
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

  private clearSelection = () => {
    window.getSelection().removeAllRanges();
  };
}
