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
        CoverCalculatorTokenSizes.settings();
        CoverCalculatorTokenSizes.hooks();
    }

    static defaults() {
        MODULE[NAME] = {
            tiny: {
                cover: 1,
                dead: 1
            },
            sm: {
                cover: 1,
                dead: 1
            },
            med: {
                cover: 1,
                dead: 1
            },
            lg: {
                cover: 1,
                dead: 1
            },
            huge: {
                cover: 1,
                dead: 1
            },
            grg: {
                cover: 1,
                dead: 1
            }
        }
    }    

    static settings() {
        const config = false;
        const menuData = {
            noCoverTokenSizes : {
                scope : "world", config, group : "token-sizes", default : "", type : String,
            },
            threeQuartersCoverTokenSizes : {
                scope : "world", config, group : "token-sizes", default : "", type : String,
            },
            noDeadTokenSizes : {
                scope : "world", config, group : "token-sizes", default : "", type : String,
            },
            halfDeadTokenSizes : {
                scope : "world", config, group : "token-sizes", default : "", type : String,
            },
            threeQuartersDeadTokenSizes : {
                scope : "world", config, group : "token-sizes", default : "", type : String,
            },
            fullDeadTokenSizes : {
                scope : "world", config, group : "token-sizes", default : "", type : String,
            },
            proneActsLikeDead : {
                scope : "world", config, group : "token-sizes", default : "", type : Boolean,
            },
        };

        MODULE.applySettings(menuData);
    }

    static hooks(){
        Hooks.on(`canvasReady`, CoverCalculatorTokenSizes._canvasReady);
        Hooks.on(`createToken`, CoverCalculatorTokenSizes._createToken);        
        Hooks.on(`preUpdateActor`, CoverCalculatorTokenSizes._preUpdateActor);
        Hooks.on("preCreateActiveEffect", CoverCalculatorTokenSizes._preCreateActiveEffect);
        Hooks.on("preDeleteActiveEffect", CoverCalculatorTokenSizes._preDeleteActiveEffect);
    }

    static userDefined() {
        let keys = Object.keys(CONFIG.DND5E.tokenSizes)

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
        return MODULE[NAME][actor.system.traits.size][key]
    }

    static async setCover(coverStatus, actor, token) {
        let cover = CoverCalculatorTokenSizes.coverValue(actor, coverStatus)
        await token.setFlag(MODULE.data.name, "coverLevel", cover)
    }

    static isDowned(status) {
        return (
            status === CoverCalculatorTokenSizes.Downed.Prone &&
            !token.actor.effects.find(eff => eff.data.label === CoverCalculatorTokenSizes.Downed.Unconscious) && 
            !token.actor.getRollData().attributes.hp.value === 0
        ) ||
        (
            status === CoverCalculatorTokenSizes.Downed.Unconscious &&
            !token.actor.effects.find(eff => eff.data.label === CoverCalculatorTokenSizes.Downed.Prone) && 
            !token.actor.getRollData().attributes.hp.value === 0
        );
}

    static _canvasReady(){
        CoverCalculatorTokenSizes.userDefined()
    }

    static async _createToken(document, data, id) {
        if (!document.canUserModify(game.user, "update")) {
            return;
        }
        
        let cover = CoverCalculatorTokenSizes.coverValue(document.actor, "cover");
        await document.update({ 'flags.simbuls-cover-calculator.coverLevel': cover });
    }    

    static async _preUpdateActor(actor, update) {
        if (!actor.token || !actor.getActiveTokens()[0]?.document) return;

        let hp = getProperty(update, "system.attributes.hp.value");
        let token = actor.token ?? actor.getActiveTokens()[0].document;
    
        if (hp === 0) {
            await CoverCalculatorTokenSizes.setCover('dead', actor, token);            
        }
        if (actor.system.attributes.hp.value === 0 && hp > 0) {
            await CoverCalculatorTokenSizes.setCover('cover', actor, token);
        }
    }    

    static async _preCreateActiveEffect(effect) {
        if (HELPER.setting(MODULE.data.name, 'proneActsLikeDead') === false) return;

        if (!effect.parent.parent || !effect.parent.getActiveTokens()[0]?.document) return;

        let status = effect.label;
        let token = effect.parent.parent ?? effect.parent.getActiveTokens()[0].document;
        let actor = token.actor;
        
        if (status === CoverCalculatorTokenSizes.Downed.Unconscious || status === CoverCalculatorTokenSizes.Downed.Prone) {
            await CoverCalculatorTokenSizes.setCover('dead', actor, token);
        }        
    }
    
    static async _preDeleteActiveEffect(effect) {
        if (HELPER.setting(MODULE.data.name, 'proneActsLikeDead') === false) return;

        if (!effect.parent.parent || !effect.parent.getActiveTokens()[0]?.document) return;

        let status = effect.label;
        let token = effect.parent.parent ?? effect.parent.getActiveTokens()[0].document;
        let actor = token.actor;

        if (CoverCalculatorTokenSizes.isDowned(status)) {
            await CoverCalculatorTokenSizes.setCover('cover', actor, token);
        }
    }
}