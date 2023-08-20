export class Actor {
    /** @type ItemTypes */
    itemTypes;
}

export class ItemTypes {
    /** @type Consumable[] */
    consumable;
}

export class Consumable {
    /** @type string */
    id;

    /** @type string */
    slug;

    /** @type string */
    img;

    /** @type number */
    level;

    /** @type ConsumableSystem */
    system;
}

class ConsumableSystem {
    /** @type {{carryType: 'held'|'worn'|'stowed'|'dropped'}} */
    equipped;
}
