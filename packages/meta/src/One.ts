import { makeObservable, observable, autorun, runInAction } from "mobx";

interface X {
    name: string;
}
class Vehicle implements X {
    type: string = "vehicle";
    name: string;

    constructor() {
        makeObservable(this, {
            type: observable
        })
    }
}
class Car extends Vehicle {
    type: string = "car"
    name: string;

    constructor() {
        super();
       // makeObservable(this, {
       //      type: observable
       //  })
    }
}

const vehicle = new Vehicle();
const car = new Car();

autorun( () => {
    console.log("autorun car.type " + car.type);
})
autorun( () => {
    console.log("autorun vehicle.type " + vehicle.type);
})

runInAction( () => {
    vehicle.type = "none";
    car.type = "fast car"
});
