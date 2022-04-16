import { PiWriter } from "../writer";

export interface PiType {
    readonly $typename: string;
    toPiString(writer: PiWriter): string;
}
