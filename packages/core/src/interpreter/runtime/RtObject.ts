export class RtObject extends Object {
    constructor() {
        super();
    }

    get rtType(): string {
        return Object.getPrototypeOf(this).constructor.name;
    }
}
