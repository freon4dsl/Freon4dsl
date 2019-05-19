import "reflect-metadata";
import { observable } from "mobx";

let doLog: boolean = false;

function log(message: string) {
  if (doLog) {
    console.log(message);
  }
}

const keyPrefix = "_PI_";

const listPartHandler = {
  set: function(
    target: PartArray<ModelElement>,
    num: number | string,
    value: ModelElement
  ) {
    log(
      "SET: " +
        target +
        " num: " +
        num +
        " value: " +
        value +
        " PA? " +
        (target instanceof PartArray)
    );
    const index = Number(num);
    if (typeof num === "string") {
      if (isNaN(index)) {
        target[num] = value;
        log("Do nothing because typeof is " + typeof num);
        return true;
      }
    }
    if (num in target) {
      log("Num in target");
      (target as PartArray<ModelElement>).removeContainer(index);
    }
    if (value) {
      if (value.container) {
        // cleanup container reference
        if (value.propertyIndex !== undefined) {
          (value.container as any)[value.propertyName][
            value.propertyIndex
          ] = null;
        } else {
          (value.container as any)[value.propertyName] = null;
        }
      }
      value.container = target._container;
      value.propertyName = target.name;
      value.propertyIndex = index;
      target[index] = value;
    } else {
      target.splice(index, 1);
    }
    return true;
  }
};

/**
 * This property decorator can be used to decorate properties of type ModelElement.
 * The objects in such properties will automatically keep a container reference.
 *
 * @param {Object} target
 * @param {string | symbol} propertyKey
 */
export function part(target: Object, propertyKey: string | symbol) {
  const privatePropertyKey = keyPrefix + propertyKey.toString();

  const getter = function(this: any) {
    let result = (this as any)[privatePropertyKey];
    if (result === undefined) {
      result = null;
      this[privatePropertyKey] = result;
    }
    return result;
  };

  const setter = function(this: any, val: ModelElement) {
    const storedValue = this[privatePropertyKey] as ModelElement;
    // Clean container of current part
    if (storedValue) {
      storedValue.container = null;
      storedValue.propertyName = "";
      storedValue.propertyIndex = undefined;
    }
    this[privatePropertyKey] = val;
    if (val !== null && val !== undefined) {
      if (val.container !== undefined && val.container !== null) {
        if (val.propertyIndex !== undefined && val.propertyIndex > -1) {
          // Clean new value from its containing list
          (val.container as any)[keyPrefix + val.propertyName][
            val.propertyIndex
          ] = null;
        } else {
          // Clean new value from its container
          (val.container as any)[keyPrefix + val.propertyName] = null;
        }
      }
      // Set container
      val.container = this;
      val.propertyName = propertyKey.toString();
      val.propertyIndex = undefined;
    }
  };

  // tslint:disable no-unused-expression
  Reflect.deleteProperty(target, propertyKey);
  Reflect.defineProperty(target, propertyKey, {
    get: getter,
    set: setter
  });
}

export function listpart(target: Object, propertyKey: string | symbol) {
  const privatePropertyKey = keyPrefix + propertyKey.toString();

  const getter = function(this: any) {
    let result = this[privatePropertyKey];
    if (result === undefined) {
      result = new Proxy(
        new PartArray<ModelElement>(propertyKey.toString(), this, []),
        listPartHandler
      );
      this[privatePropertyKey] = result;
      result["_M_Container"] = this;
    }
    return result;
  };

  Reflect.deleteProperty(target, propertyKey);
  Reflect.defineProperty(target, propertyKey, {
    get: getter
  });
}

export interface ModelElement {
  name: string;
  container: Object | null;
  propertyName: string;
  propertyIndex: number | undefined;
}

export class ModelElementImpl {
  name: string;
  @observable container: Object;
  @observable propertyName: string;
  @observable propertyIndex: number | undefined;
}

export class PartArray<T extends ModelElement> extends Array<T> {
  name: string;
  public _container: ModelElement;

  constructor(name: string, container: ModelElement, items: T[]) {
    super(...items);
    Object.setPrototypeOf(this, PartArray.prototype);
    for (let index: number = 0; index++; index < items.length) {
      items[index].container = this._container;
      items[index].propertyName = this.name;
      items[index].propertyIndex = index;
    }
    this._container = container;
    this.name = name;
  }

  push(...items: T[]): number {
    log("Part Push: " + items);
    for (let index: number = 0; index < items.length; index++) {
      items[index].container = this._container;
      items[index].propertyName = this.name;
      items[index].propertyIndex = this.length + index;
    }
    log("-----------------------------------");
    let result = super.push(...items);
    log("+++++++++++++++++++++++++++++");
    return result;
  }

  removeContainer(index: number) {
    // this.splice(index, 1);
    this[index].container = null;
    this[index].propertyIndex = undefined;
    this[index].propertyName = "";
  }
}
