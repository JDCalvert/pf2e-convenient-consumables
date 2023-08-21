export class Actor {
    /** @type ItemTypes */
    itemTypes;
}

export class ItemTypes {
    /** @type Consumable[] */
    consumable;
    
    /** @type Consumable{} */
    weapon;
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

    /** @type boolean */
    isEquipped;
}

class ConsumableSystem {
    /** @type {{carryType: 'held'|'worn'|'stowed'|'dropped'}} */
    equipped;
}
