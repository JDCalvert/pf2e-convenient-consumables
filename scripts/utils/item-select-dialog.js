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

    /** @type string[] */
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
                <p>${header}</p>
        `;

        for (const section of sections) {
            if (!section.choices.length) {
                continue;
            }

            content += `
                <fieldset class="pf2e-convenient-consumables">
                    <legend>${section.heading}</legend>
            `;

            for (const choice of section.choices) {
                content += `
                    <button
                        class="pf2e-convenient-consumables item-button"
                        type="button"
                        value="${choice.id}"
                    >
                        <img class="pf2e-convenient-consumables" src="${choice.img}"/>
                        <table class="pf2e-convenient-consumables" style="background-color: #00000000; border: none">
                            <tr>
                                <td class="pf2e-convenient-consumables name" rowspan="${choice.info.length || 1}">
                                    <span>${choice.name}</span>
                                </td>
                `;

                for (let i = 0; i < choice.info.length; i++) {
                    if (i > 0) {
                        content += `
                            </tr>
                            <tr>
                        `;
                    }
                    content += `
                                <td class="pf2e-convenient-consumables description">
                                    <span>${choice.info[i]}</span>
                                </td>
                    `;
                }
                content += `
                            </tr>
                `;

                content += `
                        </table>
                    </button>
                `;
            }

            content += `
                </fieldset>
            `;
        }

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
