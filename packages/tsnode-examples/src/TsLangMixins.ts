type SpriteIntf = {
    name: string;
    x: number;
    y: number;

    setPos(x: number, y: number): void;
};
class Sprite implements SpriteIntf {
    name = "default";
    x = 0;
    y = 0;

    constructor(name: string) {
        this.name = name;
    }
    setPos(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }
}

// To get started, we need a type which we'll use to extend
// other classes from. The main responsibility is to declare
// that the type being passed in is a class.

type Constructor = new (...args: any[]) => {};

// This mixin adds a scale property, with getters and setters
// for changing it with an encapsulated private property:

function Scale<TBase extends Constructor>(Base: TBase) {
    return class Scaling extends Base {
        // Mixins may not declare private/protected properties
        // however, you can use ES2020 private fields
        _scale = 1;

        setScale(scale: number) {
            this._scale = scale;
        }

        get scale(): number {
            return this._scale;
        }
    };
}

// Compose a new class from the Sprite class,
// with the Mixin Scale applier:
const EightBitSprite = Scale(Sprite);

const flappySprite = new EightBitSprite("Bird");
flappySprite.setScale(0.8);
console.log(flappySprite.scale + " -- " + flappySprite.name);

// Now we use a generic version which can apply a constraint on
// the class which this mixin is applied to
type GConstructor<T = {}> = new (...args: any[]) => T;

type Positionable = GConstructor<{ setPos: (x: number, y: number) => void }>;
// type Positionable = GConstructor<{ setPos: (x: number, y: number) => void }>;
type Spritable = GConstructor<Sprite>;
type Loggable = GConstructor<{ print: () => void }>;

function Jumpable<TBase extends Positionable>(Base: TBase) {
    return class Jumpable extends Base {
        jump() {
            // This mixin will only work if it is passed a base
            // class which has setPos defined because of the
            // Positionable constraint.
            this.setPos(0, 20);
        }
    };
}

const Jump = Jumpable(Sprite);
const jumper = new Jump("Cow");
console.log(jumper.name + " -- " + jumper.y);
jumper.jump();
console.log(jumper.name + " -- " + jumper.y);
