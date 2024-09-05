export enum FreCaretPosition {
    UNSPECIFIED,
    LEFT_MOST,
    RIGHT_MOST,
    INDEX,
}

export class FreCaret {
    static RIGHT_MOST = new FreCaret(FreCaretPosition.RIGHT_MOST, 0);
    static LEFT_MOST = new FreCaret(FreCaretPosition.LEFT_MOST, 0);
    static UNSPECIFIED = new FreCaret(FreCaretPosition.UNSPECIFIED, 0);

    static IndexPosition(from: number, to?: number): FreCaret {
        return new FreCaret(FreCaretPosition.INDEX, from, to);
    }

    position: FreCaretPosition; // the type of the FreCaret
    from: number; // the index of the char where the caret should be (selection-start), only used with type FreCaretPosition.INDEX
    to: number; // the index of the char where the selection should end, only used with type FreCaretPosition.INDEX

    private constructor(p: FreCaretPosition, from: number, to?: number) {
        this.position = p;
        this.from = from;
        if (to !== null && to !== undefined && to > 0) {
            this.to = to;
        } else {
            this.to = from;
        }
    }

    toString(): string {
        return "" + this.position;
    }
}
