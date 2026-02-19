import type { IdProvider } from "../../util/index.js";

export class LionwebIdProvider implements IdProvider {
    newId(): string {
        return this.availableIds.pop();
    }

    usedId(_id: string): void {}

    availableIds: string[];
}
