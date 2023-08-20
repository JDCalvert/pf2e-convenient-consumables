import { postConsumableItem } from "./items/consumable.js";
import { postConsumableWeapon } from "./items/weapon.js";

Hooks.on(
    "init",
    () => {
        game.pf2eConvenientConsumables = {
            postConsumableItem,
            postConsumableWeapon
        };
    }
);
