import { postConsumableItem, postConsumableWeapon } from "./items/consumable.js";

Hooks.on(
    "init",
    () => {
        game.pf2eConvenientConsumables = {
            postConsumableItem,
            postConsumableWeapon
        };
    }
);
