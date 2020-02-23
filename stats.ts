
export const enum enumGAME {
    HUNGER_RATE,
    OVERPOPULATION_RATE

};
export const GAME_STATS = new Map<number, number>(
    [
        [enumGAME.HUNGER_RATE, 0.1],
        [enumGAME.OVERPOPULATION_RATE, 5.0]
    ]
);