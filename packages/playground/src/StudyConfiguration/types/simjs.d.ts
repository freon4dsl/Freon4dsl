declare module 'simjs' {
    export interface Sim {
        new(): Sim;
        activate(entity: Entity): void;
        timeout(delay: number): void;
        now(): number;
        random: {
            uniform(min: number, max: number): number;
        };
        log(message: string): void;
        simulate(duration: number): void;
    }

    export interface Entity {
        new(sim: Sim): Entity;
        sim: Sim;
        id: number;
    }
}