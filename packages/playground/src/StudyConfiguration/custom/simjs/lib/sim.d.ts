declare module 'Sim' {
    export class Sim {
        activate(entity: Entity): void;
        timeout(delay: number): void;
        now(): number;
        random: {
            uniform(min: number, max: number): number;
        };
        log(message: string): void;
        simulate(duration: number): any; // replace 'any' with the actual type of the simulation results
    }

    export class Entity {
        sim: Sim;
        id: number;
        constructor(sim: Sim);
    }
}