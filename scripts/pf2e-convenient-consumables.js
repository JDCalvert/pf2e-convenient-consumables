import { postConsumableItem, postConsumableWeapon } from "./items/consumable.js";

Hooks.on(
    "init",
    () => {
        game.pf2eConvenientConsumables = {
            postConsumableItem,
            postConsumableWeapon
        };

        game.settings.register(
            "pf2e-convenient-consumables",
            "drawConsumableWeapon",
            {
                name: game.i18n.localize("pf2e-convenient-consumables.config.drawConsumableWeapon.name"),
                hint: game.i18n.localize("pf2e-convenient-consumables.config.drawConsumableWeapon.hint"),
                scope: "client",
                config: true,
                type: Boolean,
                default: true,
            }
        );
    }
);
