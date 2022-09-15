export interface IRtObject {
    get rtType(): string;
}

export class RtObject implements IRtObject {
    _type: string;

    constructor() {
    }

    get rtType(): string {
        return this._type;
    }
}
