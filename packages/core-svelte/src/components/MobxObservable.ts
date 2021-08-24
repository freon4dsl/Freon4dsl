import { observable } from "mobx";

export class MobxObservable<T> {
    @observable public value: T;

    constructor(value: T) {
        this.value = value;
    }
}
