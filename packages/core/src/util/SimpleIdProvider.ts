import { IdProvider } from "./IdProvider";

export class SimpleIdProvider implements IdProvider {
    private readonly prefix: string;
    private latest: number = 0;
    private usedIds: string[] = [];

    constructor(prefix: string) {
        this.prefix = prefix;
    }

    newId(): string {
        this.latest++;
        let result = this.prefix + this.latest;
        while (this.usedIds.includes(result)) {
            this.latest++;
            result = this.prefix + this.latest;
        }
        this.usedIds.push(result);
        return result;
    }

    usedId(id: string) {
        this.usedIds.push(id);
    }
}
