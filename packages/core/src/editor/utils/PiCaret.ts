export enum PiCaretPosition {
    UNSPECIFIED,
    LEFT_MOST,
    RIGHT_MOST,
    INDEX
}

export class PiCaret {
    static RIGHT_MOST = new PiCaret(PiCaretPosition.RIGHT_MOST, 0);
    static LEFT_MOST = new PiCaret(PiCaretPosition.LEFT_MOST, 0);
    static UNSPECIFIED = new PiCaret(PiCaretPosition.UNSPECIFIED, 0);

    static IndexPosition(from: number, to?: number): PiCaret {
        return new PiCaret(PiCaretPosition.INDEX, from, to);
    }

    position: PiCaretPosition;  // the type of the PiCaret
    from: number;               // the index of the char where the caret should be (selection-start), only used with type PiCaretPosition.INDEX
    to: number;                 // the index of the char where the selection should end, only used with type PiCaretPosition.INDEX

    private constructor(p: PiCaretPosition, from: number, to?: number) {
        this.position = p;
        this.from = from;
        if (to !== null && to !== undefined && to > 0) {
            this.to = to;
        } else {
            this.to = from;
        }
    }
}
