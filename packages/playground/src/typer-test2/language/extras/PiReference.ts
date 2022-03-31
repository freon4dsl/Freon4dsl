import { MobxModelElementImpl, PiElement, PiScoper } from "@projectit/core";

export abstract class PiReference<T extends PiElement> extends MobxModelElementImpl {
    static scoper: PiScoper;
    get referred(): T {
        // SUBCLASSES!!!
        return null;
    }
    set referred(referredElement: T){
        // SUBCLASSES!!!
    }
}
