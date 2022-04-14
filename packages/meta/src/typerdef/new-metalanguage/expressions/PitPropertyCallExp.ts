import { PiClassifier, PiElementReference, PiProperty } from "../../../languagedef/metalanguage";
import { PitExp } from "./PitExp";

export class PitPropertyCallExp extends PitExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitPropertyCallExp>): PitPropertyCallExp {
        const result = new PitPropertyCallExp();
        if (!!data.__property) {
            result.__property = data.__property;
        }
        if (!!data.property) {
            result.property = data.property;
        }
        if (!!data.source) {
            result.source = data.source;
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }
    readonly $typename: string = "PitPropertyCallExp"; // holds the metatype in the form of a string

    source: PitExp; // implementation of part 'source'
    __property: PiElementReference<PiProperty>;
    toPiString(): string {
        let sourceStr: string = '';
        if (!!this.source) {
            sourceStr = this.source.toPiString() + '.';
        }
        return `${sourceStr}${this.__property.name}`;
    }
    get property(): PiProperty {
        if (!!this.__property && !!this.__property.referred) {
            return this.__property.referred;
        }
        return null;
    }
    set property(cls: PiProperty) {
        if (!!cls) {
            this.__property = PiElementReference.create<PiProperty>(cls, "PiProperty");
            this.__property.owner = this.language;
        }
    }
    get type(): PiClassifier {
        return this.property?.type;
    }

    get isList(): boolean {
        return this.property.isList;
    }

    baseSource(): PitExp {
        return this.source.baseSource();
    }
}
