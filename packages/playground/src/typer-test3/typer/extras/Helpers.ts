import { NamedType, PiElementReference, Type, TypeRef, TypeUsage } from "../../language/gen";

export class Helpers {
    static createTypeUsage(from: Type): TypeUsage {
        if (from instanceof TypeUsage) {
            return from;
        } else if (from instanceof NamedType) {
            return TypeRef.create({type: PiElementReference.create<NamedType>(from as NamedType, "NamedType")})
        } else {
            return null;
        }
    }
}
