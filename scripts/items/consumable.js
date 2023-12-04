import { getControlledActor } from "../utils/actor.js";
import { ItemSelectDialog, Section, Choice } from "../utils/item-select-dialog.js";
import { format, localize, showWarning } from "../utils/utils.js";
import { Consumable } from "../types/actor.js";
import { Actor } from "../types/actor.js";

class ChoiceItem {
    /** @type string */
    slug;

    /** @type string */
    description;
}

/**
 * Find and post a matching consumable from the selected actor's inventory.
 * 
 * @param {string} title The title to display on the choices dialog
 * @param {string} header The header to display on the choices dialog
 * @param {...ChoiceItem} choices The slugs of the alchemical items to filter on
 */
export async function postConsumableItem(title, header, ...choices) {
    const { item } = await chooseConsumable(title, header, choices, actor => actor.itemTypes.consumable);
    if (!item) {
        return;
    }

    await game.pf2e.rollItemMacro(item.id);
    item.consume();
}

/**
 * Find and post a matching weapon from the selected actor's inventory.
 * 
 * @param {string} title The title to display on the choices dialog
 * @param {string} header The header to display on the choices dialog
 * @param {...ChoiceItem} choices The slugs of the alchemical items to filter on
 */
export async function postConsumableWeapon(title, header, ...choices) {
    const { actor, item } = await chooseConsumable(title, header, choices, actor => actor.itemTypes.weapon);
    if (!actor || !item) {
        return;
    }

    game.pf2e.rollActionMacro(
        {
            actorUUID: "Actor." + actor.id,
            type: "strike",
            itemId: item.id,
            slug: item.slug,
        }
    );

    // If the weapon isn't drawn, draw it
    if (!item.isEquipped && game.settings.get("pf2e-convenient-consumables", "drawConsumableWeapon")) {
        const action = actor.system.actions
            .find(action => action.item.id === item.id)
            ?.auxiliaryActions
            ?.find(action => action.carryType === "held");

        if (!action) {
            ui.notifications.error(format("items.couldNotEquip", { item: item.name }));
            return;
        }

        action.execute();
    }
}

/**
 * Find the instances of the alchemical items (type defined by the consumablesFunction parameter) in the actor's
 * inventory, allow the player to choose one, and then return it.
 * 
 * If there are multiple stacks of the same item, then select one, prioritising infused
 * and equipped stacks.
 * 
 * @param {string} title The title to display on the choices dialog
 * @param {string} header The header to display on the choices dialog
 * @param {ChoiceItem[]} choices The choices of items to display
 * @param {function(Actor): Consumable[]} consumablesFunction The function to get to the correct category of 
 * @returns {Promise<{actor: Actor, item: Consumable}>}
 */
async function chooseConsumable(title, header, choices, consumablesFunction) {
    const actor = getControlledActor();
    if (!actor) {
        return {};
    }

    const allSlugs = choices.map(choice => choice.slug);

    const matchingConsumables = consumablesFunction(actor).filter(consumable => allSlugs.includes(consumable.slug) && consumable.quantity);
    if (!matchingConsumables.length) {
        showWarning(format("items.noMatchingItems", { actor: actor.name }));
        return {};
    }

    /** @type Map<string, {choice: ChoiceItem, consumables: Consumable[]}> */
    const choicesBySlug = new Map();
    for (const choice of choices) {
        const consumables = matchingConsumables.filter(consumable => consumable.slug === choice.slug);
        choicesBySlug.set(
            choice.slug,
            {
                choice: choice,
                consumables: consumables
            }
        );
    }

    /** @type Map<string, Section<Consumable> */
    const sections = new Map(
        [
            ["held", new Section(localize("utils.carryType.held"))],
            ["worn", new Section(localize("utils.carryType.worn"))],
            ["stowed", new Section(localize("utils.carryType.stowed"))],
            ["dropped", new Section(localize("utils.carryType.dropped"))]
        ]
    );

    for (const choice of choicesBySlug.values()) {
        const candidates = findCandidates(choice);
        for (let candidate of candidates) {
            sections.get(candidate.item.system.equipped.carryType).choices.push(candidate);
        }
    }

    for (const section of sections.values()) {
        section.choices.sort((choice1, choice2) => choice1.item.level - choice2.item.level);
    }

    /** @type Section<Consumable>[] */
    const itemSelectSections = [
        sections.get("held"),
        sections.get("worn"),
        sections.get("stowed"),
        sections.get("dropped")
    ];

    const selected = await ItemSelectDialog.getItem(title, header, itemSelectSections);
    if (!selected) {
        return {};
    }

    return {
        actor: actor,
        item: selected.item
    };
}

/**
 * Determine whether the consumable is infused
 * 
 * @param {Consumable} consumable 
 * @returns {boolean} whether or not the consumable has the infused trait
 */
function isInfused(consumable) {
    return consumable.system.traits.value.includes("infused");
}

/**
 * Try to find the best stacks of this consumable:
 * 1. Rank all of the infused and non-infused stacks by their equipped status
 * 2. If there's an infused stack, the highest-rank one is a candidate
 * 2. If there's a non-infused stack and its score is HIGHER than the infused candidate, return that as well
 * 
 * @param {{choice: ChoiceItem, consumables: Consumable[]}} choice
 * @returns {Choice<Consumable>[]}
 */
function findCandidates(choice) {
    /** @type Choice<Consumable>[] */
    const candidates = [];

    const infused = findBest(choice.consumables.filter(consumable => isInfused(consumable)));
    if (infused.consumable) {
        candidates.push(
            new Choice(
                infused.consumable.id,
                infused.consumable.name,
                [
                    choice.choice.description,
                    "Infused",
                    "x" + infused.consumable.quantity,
                ],
                infused.consumable.img,
                infused.consumable
            )
        );
    }

    const nonInfused = findBest(choice.consumables.filter(consumable => !isInfused(consumable)));
    if (nonInfused.score > infused.score) {
        candidates.push(
            new Choice(
                nonInfused.consumable.id,
                nonInfused.consumable.name,
                [
                    choice.choice.description,
                    "x" + nonInfused.consumable.quantity,
                ],
                nonInfused.consumable.img,
                nonInfused.consumable
            )
        );
    }

    return candidates;
}

/**
 * Find the best consumable 
 * @param {Consumable[]} consumables
 * @returns {{score: int, consumable: Consumable|null}} The highest-scoring consumable
 */
function findBest(consumables) {
    const best = {
        score: 0,
        consumable: null
    };
    for (let c of consumables) {
        let score = calculateScore(c);
        if (score > best.score) {
            best.score = score;
            best.consumable = c;
        }
    }
    return best;
}

/**
 * Calculate a score for the consumable to determine if we should show it as a choice
 * 
 * @param {Consumable} consumable 
 * @returns {number} The consumable's score
 */
function calculateScore(consumable) {
    let score = 0;

    const carryType = consumable.system.equipped.carryType;
    if (carryType === "held") {
        score += 4;
    } else if (carryType === "worn") {
        score += 3;
    } else if (carryType === "stowed") {
        score += 2;
    } else if (carryType === "dropped") {
        score += 1;
    }

    return score;
}
