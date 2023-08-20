import { Actor } from "../types/actor.js";
import { showWarning } from "./utils.js";

const localize = (key) => game.i18n.localize(`pf2e-convenient-consumables.utils.actor.${key}`);

/**
 * Find a single controlled actor
 * 
 * - If there is exactly one token selected, return that token's actor
 * - If there are no tokens selected and there's a single character sheet open, use the actor for that sheet
 * - If there the current user has an assigned character, use that one
 * @returns {Actor} the controlled actor, or null if there isn't a single controlled actor
 */
export function getControlledActor() {
    const actor = findControlledActor();
    if (!actor) {
        showWarning(localize("singleCharacterSelected"));
    }
    return actor;
}

function findControlledActor() {
    const controlledTokens = canvas.tokens.controlled;

    // If there's exactly one controlled token, just return its actor
    if (controlledTokens.length == 1) {
        const actor = controlledTokens[0]?.actor;
        if (actor) {
            return actor;
        }
    }

    // If there's more than one controlled token, we can't find
    // a single actor, so return out
    if (controlledTokens.length > 1) {
        return null;
    }

    // If we have a single character sheet open, then use the actor for that sheet
    const sheetActors = Object.values(ui.windows).map(window => window.actor).filter(actor => !!actor);
    if (sheetActors.length === 1) {
        return sheetActors[0];
    }

    // If we have an assigned character, use that one
    return game.user.character;
}
