export const localize = (key) => game.i18n.localize("pf2e-convenient-consumables." + key);
export const format = (key, data) => game.i18n.format("pf2e-convenient-consumables." + key, data);

export function showWarning(warningMessage) {
    ui.notifications.warn(warningMessage);
}
