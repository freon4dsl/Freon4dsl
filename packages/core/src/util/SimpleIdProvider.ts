import { IdProvider } from "./IdProvider";

export class SimpleIdProvider implements IdProvider {
    private prefix: string;
    private latest: number = 0;

    constructor(prefix: string) {
        this.prefix = prefix;
    }

    newId(): string {
        this.latest++;
        return this.prefix + this.latest;
    }
}
