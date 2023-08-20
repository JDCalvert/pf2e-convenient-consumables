/**
 * @template T
 */
export class Section {
    /** @type string */
    heading;

    /** @type Choice<T>[] */
    choices;

    /**
     * 
     * @param {string} heading 
     */
    constructor(heading) {
        return {
            heading: heading,
            choices: []
        };
    }
}

/**
 * @template T
 */
export class Choice {
    /** @type string */
    id;

    /** @type string */
    name;

    /** @type {{top: string, bottom: string}} */
    info;

    /** @type string */
    img;

    /** @type T */
    item;

    /**
     * 
     * @param {string} id 
     * @param {string} name
     * @param {{top: string, bottom: string}}
     * @param {string} img 
     * @param {T} item 
     */
    constructor(id, name, info, img, item) {
        this.id = id;
        this.name = name;
        this.info = info;
        this.img = img;
        this.item = item;
    }
}

export class ItemSelectDialog extends Dialog {
    constructor(title, content) {
        super(
            {
                title,
                content: content,
                buttons: {
                }
            },
            {
                height: "100%",
                width: "100%",
                id: "item-dialog"
            }
        );
    }

    /**
     * @template T
     * 
     * @param {string} title The title to display on the dialog
     * @param {string} header A description to display above the options
     * @param {Section<T>[]} sections A list of sections containing choices
     * @returns {Promise<Choice<T>>} the choice that the user selected
     */
    static async getItem(title, header, sections) {
        let content = `
            <div class="item-buttons" style="min-width: 200px; max-width: max-content; justify-items: center; margin: auto;">
            <p style="width: 200px; min-width: 100%">${header}</p>
        `;

        for (const section of sections) {
            if (!section.choices.length) {
                continue;
            }

            content += `
                <fieldset class="pf2e-convenient-consumables">
                    <legend>${section.heading}</legend>
            `;

            for (let choice of section.choices) {
                content += `
                    <button
                        class="pf2e-convenient-consumables item-button"
                        type="button"
                        value="${choice.id}"
                    >
                        <img class="pf2e-convenient-consumables" src="${choice.img}"/>
                        <table class="pf2e-convenient-consumables" style="background-color: #00000000; border: none">
                                <tr>
                                    <td rowspan="2">
                                        <span class="pf2e-convenient-consumables name">${choice.name}</span>
                                    </td>
                `;
                if (choice.info.top) {
                    content += `
                                    <td class="pf2e-convenient-consumables description" style="text-align: right;">
                                        <span>${choice.info.top ?? ""}</span>
                                    </td>
                    `;
                }

                content += `
                                </tr>
                `;
                if (choice.info.bottom) {
                    content += `
                                <tr>
                                    <td class="pf2e-convenient-consumables description" style="text-align: right;">
                                        <span>${choice.info.bottom}</span>
                                    </td>
                                </tr >
                `;
                }
                content += `
                        </table >
                    </button >
                `;
            }

            content += `</fieldset > `;
        }

        content += `</div > `;

        const itemSelectDialog = new this(title, content);

        let result = await itemSelectDialog.getItemId();
        if (!result?.itemId) {
            return null;
        }

        return Array.from(sections).flatMap(choice => choice.choices).find(item => item.id === result.itemId);
    }

    activateListeners(html) {
        html.find(".item-button").on(
            "click",
            (event) => {
                this.itemId = event.currentTarget.value;
                this.close();
            }
        );

        html.find(".option-checkbox").on(
            "change",
            (event) => this.selectionOptions[event.currentTarget.id] = event.currentTarget.checked
        );

        super.activateListeners(html);
    }

    async close() {
        await super.close();
        this.result?.(
            {
                itemId: this.itemId
            }
        );
    }

    async getItemId() {
        this.render(true);
        return new Promise(result => {
            this.result = result;
        });
    }
};
