import { IdProvider } from "../../util/index";

export class LionwebIdProvider implements IdProvider {
    newId(): string {
        return this.availableIds.pop();
    }

    // @ts-ignore
    // parameter present to adhere to interface
    usedId(id: string): void {}

    availableIds: string[];
}
