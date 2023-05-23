import { MODULE } from "../module.js";
import { HELPER } from '../../../simbuls-athenaeum/scripts/helper.js'

const NAME = "CoverCalculatorTokenSizes";

export class CoverCalculatorTokenSizes {
    static Downed = {
        Prone: "Prone",
        Unconscious: "Unconscious",
    }

    static register() {
        CoverCalculatorTokenSizes.defaults();
        CoverCalculatorTokenSizes.handlebars();
        CoverCalculatorTokenSizes.settings();
        CoverCalculatorTokenSizes.hooks();
    }

    static defaults() {
    }

    static handlebars() {
        loadTemplates({
            "scc.tokenSizesDefaultsPartial": MODULE.data.path + "/templates/partials/TokenSizeDefaults.hbs"
        })
    }

    static settings() {
        const config = false;
        const menuData = {
            actorSizePath: {
                scope : "world", config, group : "token-sizes", type : String,
                default : "system.traits.size"
            },
            tokenSizesDefault : {
                scope : "world", config, group : "token-sizes", type : Object, customPartial: "scc.tokenSizesDefaultsPartial",
                // As systems can have differing actor sizes, fetch the systems actor sizes and
                default : Object.entries(CONFIG[game.system.id.toUpperCase()].actorSizes)
                    .reduce((acc, [key, name]) => {
                        acc[key] = {
                            label: name,
                            normal : 1,
                            dead : 1,
                            prone : 1
                        }
                        return acc;
                    }, {})
            }
        };

        MODULE.applySettings(menuData);
    }

    static hooks() {
        // Hooks.on(`canvasReady`, CoverCalculatorTokenSizes._canvasReady);
        // Hooks.on(`createToken`, CoverCalculatorTokenSizes._createOrUpdateToken);
        // Hooks.on(`updateToken`, CoverCalculatorTokenSizes._createOrUpdateToken);
        // Hooks.on(`preUpdateActor`, CoverCalculatorTokenSizes._preUpdateActor);
        // Hooks.on("preCreateActiveEffect", CoverCalculatorTokenSizes._preCreateActiveEffect);
        // Hooks.on("preDeleteActiveEffect", CoverCalculatorTokenSizes._preDeleteActiveEffect);
    }

    static userDefined() {
        let keys = Object.keys(CONFIG[game.system.id.toUpperCase()].tokenSizes)

        let noCover = HELPER.setting(MODULE.data.name, "noCoverTokenSizes").split(",")
        for (let size of noCover) {
            if (!keys.includes(size)) {
                if(!!size) console.error(`Cover TokenSizes: ${size} is not a valid size`);
                continue;
            }
            MODULE[NAME][size].cover = 0;
        }

        let quarterCover = HELPER.setting(MODULE.data.name, "threeQuartersCoverTokenSizes").split(",")
        for (let size of quarterCover) {
            if (!keys.includes(size)) {
                if(!!size) console.error(`Cover TokenSizes: ${size} is not a valid size`);
                continue;
            }
            MODULE[NAME][size].cover = 2
        }

        let noDeadCover = HELPER.setting(MODULE.data.name, "noDeadTokenSizes").split(",")
        for (let size of noDeadCover) {
            if (!keys.includes(size)) {
                if(!!size) console.error(`Cover TokenSizes: ${size} is not a valid size`);
                continue;
            }
            MODULE[NAME][size].dead = 0
        }

        let halfDead = HELPER.setting(MODULE.data.name, "halfDeadTokenSizes").split(",")
        for (let size of halfDead) {
            if (!keys.includes(size)) {
                if(!!size) console.error(`Cover TokenSizes: ${size} is not a valid size`);
                continue;
            }
            MODULE[NAME][size].dead = 1
        }

        let quarterDead = HELPER.setting(MODULE.data.name, "threeQuartersDeadTokenSizes").split(",")
        for (let size of quarterDead) {
            if (!keys.includes(size)) {
                if(!!size) console.error(`Cover TokenSizes: ${size} is not a valid size`);
                continue;
            }
            MODULE[NAME][size].dead = 2
        }

        let fullDead = HELPER.setting(MODULE.data.name, "fullDeadTokenSizes").split(",")
        for (let size of fullDead) {
            if (!keys.includes(size)) {
                if(!!size) console.error(`Cover TokenSizes: ${size} is not a valid size`);
                continue;
            }
            MODULE[NAME][size].dead = 3
        }
    }

    static coverValue(actor, key) {
        CoverCalculatorTokenSizes.userDefined();
        return MODULE[NAME][actor.system.traits.size][key];
    }

    static async setCover(coverStatus, actor, token) {
        let cover = CoverCalculatorTokenSizes.coverValue(actor, coverStatus)
        await token.setFlag(MODULE.data.name, "coverLevel", cover)
    }

    static isDowned(status, token) {
        return (
            status === CoverCalculatorTokenSizes.Downed.Prone &&
            !token.actor.effects.find(eff => eff.label === CoverCalculatorTokenSizes.Downed.Unconscious) &&
            !token.actor.system.attributes.hp.value === 0
        ) ||
        (
            status === CoverCalculatorTokenSizes.Downed.Unconscious &&
            !token.actor.effects.find(eff => eff.label === CoverCalculatorTokenSizes.Downed.Prone) &&
            !token.actor.system.attributes.hp.value === 0
        );
    }

    static isIncomingDataDifferentThanSpecifiedCover(data, cover) {
        if (!data?.flags) return false;
        if (cover !== data?.flags['simbuls-cover-calculator'].coverLevel) return true;

        return false;
    }

    static _canvasReady() {
        if (HELPER.setting(MODULE.data.name, 'specifyCoverForTokenSizes') === false) return;

        CoverCalculatorTokenSizes.userDefined()
    }

    static async _createOrUpdateToken(document, data, id) {
        if (HELPER.setting(MODULE.data.name, 'specifyCoverForTokenSizes') === false) return;
        if (!document.canUserModify(game.user, "update")) return;

        let cover = CoverCalculatorTokenSizes.coverValue(document.actor, "cover");
        if (CoverCalculatorTokenSizes.isIncomingDataDifferentThanSpecifiedCover(data, cover)) return;

        await document.update({ 'flags.simbuls-cover-calculator.coverLevel': cover });
    }

    static async _preUpdateActor(actor, update) {
        if (HELPER.setting(MODULE.data.name, 'specifyCoverForTokenSizes') === false) return;
        if (!actor.token && !actor.getActiveTokens()[0]?.document) return;

        let hp = getProperty(update, "system.attributes.hp.value");
        let token = actor.token ?? actor.getActiveTokens()[0].document;

        if (hp === 0) {
            await CoverCalculatorTokenSizes.setCover('dead', actor, token);
        }
        if (actor.system.attributes.hp.value === 0 && hp > 0) {
            if (CoverCalculatorTokenSizes.isIncomingDataDifferentThanSpecifiedCover(data, cover)) return;
            await CoverCalculatorTokenSizes.setCover('cover', actor, token);
        }
    }

    static async _preCreateActiveEffect(effect) {
        if (HELPER.setting(MODULE.data.name, 'specifyCoverForTokenSizes') === false) return;
        if (HELPER.setting(MODULE.data.name, 'proneActsLikeDead') === false) return;

        if (!effect.parent.parent && !effect.parent.getActiveTokens()[0]?.document) return;

        let status = effect.label;
        let token = effect.parent.parent ?? effect.parent.getActiveTokens()[0].document;
        let actor = token.actor;

        if (status === CoverCalculatorTokenSizes.Downed.Unconscious || status === CoverCalculatorTokenSizes.Downed.Prone) {
            await CoverCalculatorTokenSizes.setCover('dead', actor, token);
        }
    }

    static async _preDeleteActiveEffect(effect) {
        if (HELPER.setting(MODULE.data.name, 'specifyCoverForTokenSizes') === false) return;
        if (HELPER.setting(MODULE.data.name, 'proneActsLikeDead') === false) return;

        if (!effect.parent.parent && !effect.parent.getActiveTokens()[0]?.document) return;

        let status = effect.label;
        let token = effect.parent.parent ?? effect.parent.getActiveTokens()[0].document;
        let actor = token.actor;

        if (CoverCalculatorTokenSizes.isDowned(status, token)) {
            await CoverCalculatorTokenSizes.setCover('cover', actor, token);
        }
    }
}
