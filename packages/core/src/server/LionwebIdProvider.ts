import { IdProvider } from "../util/index";

export class LionwebIdProvider implements IdProvider {
    newId(): string {
        return this.availableIds.pop();
    }

    usedId(id: string): void {
    }


    availableIds: string[];
}
