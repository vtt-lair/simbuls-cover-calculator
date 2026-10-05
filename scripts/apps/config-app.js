import {MODULE} from "../module.js";
import {calculateCoverLevelLut} from "../cover-utils.js";
import {HELPER} from "../../../simbuls-athenaeum/scripts/helper.js";
import {logger} from "../../../simbuls-athenaeum/scripts/logger.js";
import CoverLevelConfig from "./cover-level-app.js";

export class CoverCalculatorSettingsConfig extends foundry.applications.settings.SettingsConfig {
    constructor(options = {}){
        const { subModule = null, subMenuId = null, groupLabels = CoverCalculatorSettingsConfig.defaultGroupLabels, parentMenu = null, ...appOpts } = options;
        super(appOpts);
        this.options = this.options || {};
        this.options.subModule = subModule;
        this.options.groupLabels = groupLabels;
        this.options.subMenuId = subMenuId;
        this.options.parentMenu = parentMenu;
    }

    coverPresets = {
        none: { label: "" },
        dnd5e: {
            label: "DnD5e",
            config: {
                0: { label: "No Cover", value: 0, color: "0xff0000", icon: "", partial: [0, 0, 0, 0, 0] },
                1: { label: "Half Cover", value: 2, color: "0xffa500", icon: `modules/${MODULE.data.name}/assets/cover-icons/Half_Cover.svg`, partial: [0, 1, 1, 1, 1] },
                2: { label: "Three-Quarters Cover", value: 5, color: "0xffff00", icon: `modules/${MODULE.data.name}/assets/cover-icons/ThreeQ_Cover.svg`, partial: [0, 1, 1, 2, 2] },
                3: { label: "Full Cover", value: 40, color: "0x008000", icon: `modules/${MODULE.data.name}/assets/cover-icons/Full_Cover.svg`, partial: [0, 1, 1, 2, 3] }
            }
        },
        sw5e: {
            label: "SW5e",
            config: {
                0: { label: "No Cover", value: 0, color: "0xff0000", icon: "", partial: [0, 0, 0, 0, 0] },
                1: { label: "Quarter Cover", value: 2, color: "0xffa500", icon: `modules/${MODULE.data.name}/assets/cover-icons/Q_Cover.svg`, partial: [0, 1, 1, 1, 1] },
                2: { label: "Half Cover", value: 3, color: "0xffa500", icon: `modules/${MODULE.data.name}/assets/cover-icons/Half_Cover.svg`, partial: [0, 1, 1, 2, 2] },
                3: { label: "Three-Quarters Cover", value: 5, color: "0xffff00", icon: `modules/${MODULE.data.name}/assets/cover-icons/ThreeQ_Cover.svg`, partial: [0, 1, 2, 2, 3] },
                4: { label: "Full Cover", value: 40, color: "0x008000", icon: `modules/${MODULE.data.name}/assets/cover-icons/Full_Cover.svg`, partial: [0, 1, 2, 3, 4] }
            }
        },
        pf2e: {
            label: "PF2e",
            config: {
                0: { label: "No Cover", value: 0, color: "0xff0000", icon: "", partial: [0, 0, 0, 0, 0] },
                1: { label: "Lesser Cover", value: 1, color: "0xffa500", icon: `modules/${MODULE.data.name}/assets/cover-icons/Q_Cover.svg`, partial: [0, 1, 1, 1, 1] },
                2: { label: "Standard Cover", value: 2, color: "0xffa500", icon: `modules/${MODULE.data.name}/assets/cover-icons/Half_Cover.svg`, partial: [0, 1, 1, 2, 2] },
                3: { label: "Greater Cover", value: 4, color: "0xffff00", icon: `modules/${MODULE.data.name}/assets/cover-icons/ThreeQ_Cover.svg`, partial: [0, 1, 2, 2, 3] },
                4: { label: "Full Cover", value: 40, color: "0x008000", icon: `modules/${MODULE.data.name}/assets/cover-icons/Full_Cover.svg`, partial: [0, 1, 2, 3, 4] }
            }
        }
    }

    tokenPresets = {
        none: { label: "" },
        flat: {
            label: "Flat",
            generateConfig: (sizes) => {
                const config = {};
                for (const size of sizes) {
                    config[size] = { normal: 1, dead: 1, prone: 1 };
                }
                return config;
            }
        },
        linear: {
            label: "Linear",
            generateConfig: (sizes) => {
                const config = {};
                const maxCover = this.coverData.length - 1;
                for (const [index, size] of sizes.entries()) {
                    const coverValue = Math.ceil((index / sizes.length) * maxCover);
                    config[size] = { normal: coverValue, dead: coverValue, prone: coverValue };
                }
                return config;
            }
        },
        linearDead: {
            label: "Linear, half on death",
            generateConfig: (sizes) => {
                const config = {};
                const maxCover = this.coverData.length - 1;
                for (const [index, size] of sizes.entries()) {
                    const coverValue = Math.ceil((index / sizes.length) * maxCover);
                    const deadCoverValue = Math.floor(coverValue / 2);
                    config[size] = { normal: coverValue, dead: deadCoverValue, prone: deadCoverValue };
                }
                return config;
            }
        },
        linearAlt: {
            label: "Linear Alt",
            generateConfig: (sizes) => {
                const config = {};
                const maxCover = this.coverData.length - 2;
                for (const [index, size] of sizes.entries()) {
                    const coverValue = Math.ceil((index / sizes.length) * maxCover) + 1;
                    config[size] = { normal: coverValue, dead: coverValue, prone: coverValue };
                }
                return config;
            }
        },
        linearDeadAlt: {
            label: "Linear Half Alt",
            generateConfig: (sizes) => {
                const config = {};
                const maxCover = this.coverData.length - 2;
                for (const [index, size] of sizes.entries()) {
                    const coverValue = Math.ceil((index / sizes.length) * maxCover) + 1;
                    const deadCoverValue = Math.floor(coverValue / 2);
                    config[size] = { normal: coverValue, dead: deadCoverValue, prone: deadCoverValue };
                }
                return config;
            }
        },
        devPref: {
            label: "Developer Preference",
            generateConfig: (sizes) => {
                const config = {};
                const maxCover = this.coverData.length - 2;
                for (const [index, size] of sizes.entries()) {
                    let x = index / sizes.length;
                    x = (2 * x) / (x + 1);
                    const coverValue = Math.ceil(x * maxCover) + 1;
                    config[size] = { normal: coverValue, dead: coverValue, prone: coverValue };
                }
                return config;
            }
        },
        devPrefDead: {
            label: "Developer Preference Half",
            generateConfig: (sizes) => {
                const config = {};
                const maxCover = this.coverData.length - 2;
                for (const [index, size] of sizes.entries()) {
                    let x = index / sizes.length;
                    x = (2 * x) / (x + 1);
                    const coverValue = Math.ceil(x * maxCover) + 1;
                    const deadCoverValue = Math.floor(coverValue / 2);
                    config[size] = { normal: coverValue, dead: deadCoverValue, prone: deadCoverValue };
                }
                return config;
            }
        }
    }

    static _menus = new Collection();
    static get menus() { return CoverCalculatorSettingsConfig._menus; }
    get menus() { return CoverCalculatorSettingsConfig.menus; }

    static get defaultGroupLabels() {
        return {
            'system': { faIcon: 'fas fa-cog', tabLabel: 'SCC.groupLabel.system'},
            'cover': { faIcon: 'fas fa-chart-simple', tabLabel: 'SCC.groupLabel.cover-levels'},
            'combat': { faIcon: 'fas fa-dice-d20', tabLabel: 'SCC.groupLabel.combat'},
            'token-sizes': { faIcon: 'fas fa-expand-arrows-alt', tabLabel: 'SCC.groupLabel.token-sizes'},            
            'misc': { faIcon: 'fas fa-list-alt', tabLabel: 'SCC.groupLabel.misc'},
        }
    }

    static DEFAULT_OPTIONS = {
        id : "cover-calculator-client-settings",
        window: { title: "Helpers" },
        position: { width : 830, height : "auto" },
    };

    static PARTS = {
        main: {
            template: `/modules/simbuls-athenaeum/templates/ModularSettings.html`
        }
    };

    _onClickReturn(event, options) {
        event?.preventDefault();
        const menu = game.settings.menus.get('simbuls-cover-calculator.helperOptions');
        if ( !menu ) return ui.notifications.error("No parent menu found");
        const app = new menu.type();
        return app.render(true, options);
    }

    async _prepareContext(options) {
        const canConfigure = game.user.can("SETTING_MODIFY") || game.user.can("SETTINGS_MODIFY");
        const settings = Array.from(game.settings.settings);

        let data = {
            title: HELPER.format('SCC.ConfigApp.title'),
            tabs: foundry.utils.duplicate(this.options.groupLabels),
            hasParent: !!this.options.subMenuId,
            parentMenu: this.options.parentMenu
        };

        const registerTabSetting = (tabName) => {
            if (!data.tabs[tabName].settings) data.tabs[tabName].settings = [];
        }

        const registerTabMenu = (tabName) => {
            if (!data.tabs[tabName].menus) data.tabs[tabName].menus = [];
        }

        for (let [_, setting] of settings.filter(([_, setting]) => setting.namespace == MODULE.data.name && setting.hidden != true)) {
            if (!setting.config) {
                if (!canConfigure && setting.scope !== "client") continue;
                setting.group = data.tabs[setting.group] ? setting.group : 'misc'
                registerTabSetting(setting.group);

                let groupTab = data.tabs[setting.group] ?? false;
                if (groupTab) {
                    let additional;
                    if (setting.additional) {
                        additional = HELPER.setting(MODULE.data.name, `temporary_${setting.additional}`) 
                            ?? HELPER.setting(MODULE.data.name, setting.additional);
                    }

                    const value = HELPER.setting(MODULE.data.name, setting.key)
                    if (setting.key === 'tokenSizesDefault') {
                        for (var key in value) {
                            if (value.hasOwnProperty(key)) {
                                value[key].label = value[key].label.label ?? value[key].label;
                            }
                        }
                    }

                    groupTab.settings.push({
                        ...setting,
                        type : setting.type instanceof Function ? setting.type.name : "String",
                        isCheckbox : setting.type === Boolean,
                        isSelect : setting.choices !== undefined,
                        isRange : setting.type === Number && setting.range,
                        isCustom : !!setting.customPartial,
                        value : value,
                        path: `${setting.namespace}.${setting.key}`,
                        additional: setting.additional ? Object.values(additional) : null
                    });                    
                } 
            }
        }

        const childMenus = this.menus.filter( menu => menu.parentMenu == this.options.subMenuId )
        childMenus.forEach( menu => {
            registerTabMenu(menu.tab);
            let groupTab = data.tabs[menu.tab] ?? false;
            if (groupTab) groupTab.menus.push(menu);
        });

        data.tabs = Object.entries(data.tabs).reduce( (acc, [name, val]) => {
            if(!!val.settings || !!val.menus) acc[name] = val;
            return acc;
        }, {})

        this.coverData = HELPER.setting(MODULE.data.name, "temporary_coverData") 
            ?? HELPER.setting(MODULE.data.name, "coverData");
        this.coverData = Object.values(this.coverData);

        data.coverPresets = this.coverPresets;
        data.tokenPresets = this.tokenPresets;

        logger.debug(game.settings.get(MODULE.data.name, "debug"), "GET DATA | DATA | ", data);

        return { user : game.user, canConfigure, systemTitle : game.system.title, data }
    }

    close(options) {
        game.settings.set(MODULE.data.name, "temporary_coverData", null);
        super.close(options);
    }

    async _onSubmitForm(config, event) {
        game.settings.set(MODULE.data.name, "coverData",
            this.coverData.reduce((acc, coverLevel, index) => {
                acc[index] = coverLevel;
                return acc;
            }, {})
        )

        if (this.element.querySelector(`[name="${MODULE.data.name}.losWithTokens"]`)?.checked) {
            const defaultTokenSizes = HELPER.setting(MODULE.data.name, "tokenSizesDefault");
            const tokenCoverSettings = this.element.querySelector("#scc-token-cover-settings-body");
            for (const tokenCover of tokenCoverSettings.children) {
                foundry.utils.mergeObject(defaultTokenSizes[tokenCover.dataset.size], this._getTokenSizeValues(tokenCover));
            }
            game.settings.set(MODULE.data.name, "tokenSizesDefault", defaultTokenSizes);
        }        

        const formData = await super._onSubmitForm(config, event);        

        if( this.options.subMenuId ){
            await this._onClickReturn(event);
        }

        return formData;
    }

    _onRender(context, options) {
        super._onRender(context, options);
        
        const returnBtn = this.element.querySelector('button[name="return"]');
        if (returnBtn) returnBtn.addEventListener('click', this._onClickReturn.bind(this));

        const losTokens = this.element.querySelector(`[name="${MODULE.data.name}.losWithTokens"]`);
        if (losTokens) losTokens.addEventListener('click', this._onTokenCoverChange.bind(this));

        this.element.querySelectorAll('[data-tab]').forEach(el => el.addEventListener('click', this._resizeScreen.bind(this)));
        
        const tokenSizesTab = this.element.querySelector('[data-tab="token-sizes"]');
        if (tokenSizesTab) tokenSizesTab.addEventListener('click', this._onTokenSizeTabClick.bind(this));

        this.element.querySelectorAll(".cover-preset").forEach(el => el.addEventListener('change', this._handleCoverPresetSelected.bind(this)));
        
        const addBtn = this.element.querySelector('.cover-levels-table .cover-control[data-action="add"]');
        if (addBtn) addBtn.addEventListener('click', this._handleCoverControl.bind(this));

        this.element.querySelectorAll(".token-cover-preset").forEach(el => el.addEventListener('change', this._handleTokenCoverPresetSelected.bind(this)));
        this.element.querySelectorAll("#scc-token-cover-settings-body select").forEach(el => el.addEventListener('change', this._updateTokenSizeCoverRowWarnings.bind(this)));

        this._prepareVisibleForms();
        this._redrawCoverLevels(false);
        this._updateTokenSizeCoverRowWarnings();
    }

    _onTokenCoverChange(event) {
        this._toggleTokenSizesTabVisible(event.currentTarget.checked);
    }

    _onTokenSizeTabClick(event) {
        if (this.coverDataChanged) {
            this.coverDataChanged = false;
            this._onClickReturn(null, {activeCategory: 'token-sizes'});
        }
    }

    _resizeScreen(event) {
        this.element.style.height = 'auto';
    }

    _prepareVisibleForms() {
        const isTokenCoverChecked = this.element.querySelector(`[name="${MODULE.data.name}.losWithTokens"]`)?.checked;
        this._toggleTokenSizesTabVisible(isTokenCoverChecked);
    }

    _toggleTokenSizesTabVisible(isVisible) {
        const tab = this.element.querySelector(".sheet-tabs :nth-child(4)");
        if (tab) {
            tab.style.display = isVisible ? 'block' : 'none';
        }
    }

    async _createCoverLevelDialog(index, add = true) {
        let data;
        if (add) {
            data = {
                label: HELPER.localize("scc.coverData.newCoverLevelName"), value: null, color : "0x008000",
                icon : `modules/${MODULE.data.name}/assets/cover-icons/Full_Cover.svg`,
                partial: calculateCoverLevelLut(index),
                coverLevels: {
                    [index]: HELPER.localize("scc.coverData.newCoverLevelName"),
                    ...this.coverData.reduce((acc, value, currentIndex) => {
                        acc[currentIndex >= index ? currentIndex + 1 : currentIndex] = value.label
                        return acc;
                    }, {})
                }
            }
        } else {
            data = {
                ...this.coverData[index],
                coverLevels: this.coverData.reduce((acc, value, currentIndex) => {
                    acc[currentIndex] = value.label
                    return acc;
                }, {}),
            };
        }

        new CoverLevelConfig(add, data, index, (coverLevel) => {
            if (add) {
                const coverIndex = this.coverData.length - 1;
                const temp = this.coverData[coverIndex];
                this.coverData[coverIndex] = coverLevel;
                this.coverData.push(temp)
            } else {
                this.coverData[index] = coverLevel;
            }

            this._redrawCoverLevels(true);
        }).render(true);
    }

    async _handleCoverPresetSelected(event) {
        try {
            const presetKey = event.currentTarget.value;
            if (presetKey.length === 0) return;
            const preset = this.coverPresets[presetKey];
            if (preset === undefined) return;

            if (!this.checkedCoverChange) {
                await Dialog.confirm({
                    title: HELPER.localize("scc.sureCheck.title"),
                    content: HELPER.localize("scc.coverData.sureCheckPreset"),
                    yes: () => { this.checkedCoverChange = true; },
                    defaultYes: false
                });
                if (!this.checkedCoverChange) return;
            }

            this.coverData = Object.values(foundry.utils.deepClone(preset.config));
            this._redrawCoverLevels(true);
        } finally {
            event.currentTarget.value = "none";
        }
    }

    async _handleCoverControl(event) {
        const action = event.currentTarget.dataset.action;
        const index = parseInt(event.currentTarget.parentElement.parentElement.dataset.index);

        if (action === "add") {
            const newIndex = this.coverData.length - 1;
            await this._createCoverLevelDialog(newIndex, true);
            return;
        }
        if (["up", "down", "delete"].includes(action) && !this.checkedCoverChange) {
            await Dialog.confirm({
                title: HELPER.localize("scc.sureCheck.title"),
                content: HELPER.localize("scc.coverData.sureCheckMove"),
                yes: () => { this.checkedCoverChange = true; },
                defaultYes: false
            });
            if (!this.checkedCoverChange) return;
        }
        switch (action) {
            case "edit":
                await this._createCoverLevelDialog(index, false)
                return
            case "up":
                if (index === 0) return;
                const up = this.coverData[index - 1];
                this.coverData[index - 1] = this.coverData[index];
                this.coverData[index] = up;
                break;
            case "down":
                if (index === this.coverData.length - 1) return;
                const down = this.coverData[index + 1];
                this.coverData[index + 1] = this.coverData[index];
                this.coverData[index] = down;
                break;
            case "delete":
                if (index === 0 || index === this.coverData.length - 1) return;
                await Dialog.confirm({
                    title: HELPER.localize("scc.sureCheck.title"),
                    content: HELPER.localize("scc.coverData.sureCheckDelete"),
                    yes: () => {}, defaultYes: false
                });
                this.coverData.splice(index, 1);
                break;
        }

        this._redrawCoverLevels(true);
    }

    _redrawCoverLevels(flagForRerender) {
        const coverElement = this.element.querySelector("#scc-cover-levels-settings-body");
        if (!coverElement) return;
        
        coverElement.innerHTML = "";
        const data = foundry.utils.deepClone(this.coverData);

        for (const [index, coverLevel] of Object.entries(data)) {
            const indexNum = parseInt(index);
            coverLevel.warnings = this._getCoverLevelWarnings(coverLevel, indexNum);
            coverElement.appendChild(this._buildCoverLevelElement(indexNum, coverLevel));
        }

        this._updateTokenSizeCoverRowWarnings();
        if (flagForRerender && this.element.querySelector(`[name="${MODULE.data.name}.losWithTokens"]`)?.checked) {
            game.settings.set(MODULE.data.name, "temporary_coverData",
                this.coverData.reduce((acc, coverLevel, index) => {
                    acc[index] = coverLevel;
                    return acc;
                }, {})
            );            
            this.coverDataChanged = true;
        }        
    }

    _getCoverLevelWarnings(coverLevel, index) {
        const warnings = [];
        if (!coverLevel.partial.includes(index)) warnings.push(HELPER.localize("scc.coverData.warningMissingSelf"))
        const coverMax = Math.max(...coverLevel.partial);
        if (coverMax > index) warnings.push(HELPER.localize("scc.coverData.warningExceedsSelf"))
        if (coverMax >= this.coverData.length) warnings.push(HELPER.localize("scc.coverData.warningUnknownLevel"))
        return warnings;
    }

    _buildCoverLevelElement(index, coverLevel) {
        const controls = [
            {title: "Edit", action: "edit", icon: "fas fa-edit"},
            {title: "Move Up", action: "up", icon: "fas fa-arrow-up", disabled: index === 0},
            {title: "Move Down", action: "down", icon: "fas fa-arrow-down", disabled: index === this.coverData.length - 1},
            {title: "Delete", action: "delete", icon: "fas fa-trash", disabled: index === 0 || index === this.coverData.length - 1}
        ]

        const containerEl = document.createElement("li");
        containerEl.className = "athenaeum-table-row flexrow";
        containerEl.dataset.index = index;

        {
            const titleEl = document.createElement("div");
            titleEl.className = "cover-title";
            titleEl.innerText = coverLevel.label;

            if (coverLevel.warnings.length > 0) {
                const warnEl = document.createElement("i");
                warnEl.className = "athenaeum-warn-parent fas fa-triangle-exclamation";
                const warningsEl = document.createElement("ul");
                warningsEl.className = "athenaeum-warn-container";
                for (const warning of coverLevel.warnings) {
                    const warningEl = document.createElement("li");
                    warningEl.className = "athenaeum-warn";
                    warningEl.innerText = warning;
                    warningsEl.appendChild(warningEl);
                }
                warnEl.appendChild(warningsEl);
                titleEl.appendChild(warnEl);
            }
            containerEl.appendChild(titleEl);
        }

        {
            const acEl = document.createElement("div");
            acEl.className = "cover-ac-bonus";
            acEl.innerText = (coverLevel.value > 0 ? "+" : "") + coverLevel.value;
            containerEl.appendChild(acEl)
        }

        {
            const controlContainerEl = document.createElement("div");
            controlContainerEl.className = "cover-controls flexrow";
            for (const control of controls) {
                const controlEl = document.createElement("a");
                controlEl.className = "cover-control";
                controlEl.title = control.title;
                controlEl.dataset.action = control.action;
                if (control.disabled) {
                    controlEl.classList.add("cover-control-disabled")
                } else {
                    controlEl.onclick = this._handleCoverControl.bind(this);
                }

                const iconEl = document.createElement("i");
                iconEl.className = control.icon;
                controlEl.appendChild(iconEl);

                controlContainerEl.appendChild(controlEl);
            }
            containerEl.appendChild(controlContainerEl);
        }

        return containerEl;
    }

    _handleTokenCoverPresetSelected(event) {
        try {
            const presetKey = event.currentTarget.value;
            if (presetKey.length === 0) return;
            const preset = this.tokenPresets[presetKey];
            if (preset === undefined) return;

            if (!this.checkedTokenCoverChange) {
                Dialog.confirm({
                    title: HELPER.localize("scc.sureCheck.title"),
                    content: HELPER.localize("scc.tokenSizes.sureCheckPreset"),
                    yes: () => {
                        this.checkedTokenCoverChange = true;
                        this._applyTokenPreset(preset);
                    },
                    defaultYes: false
                });
                return;
            }

            this._applyTokenPreset(preset);
        } finally {
            event.currentTarget.value = "none";
        }
    }

    _applyTokenPreset(preset) {
        const tokenCoverSettingsEle = this.element.querySelector("#scc-token-cover-settings-body");
        const presetConfig = preset.generateConfig(Object.keys(CONFIG[game.system.id.toUpperCase()].actorSizes));
        for (const [key, value] of Object.entries(presetConfig)) {
            const settingsEle = tokenCoverSettingsEle.querySelector(`[data-size="${key}"]`);
            if (settingsEle) {
                settingsEle.querySelector(".token-cover-normal").value = value.normal;
                settingsEle.querySelector(".token-cover-dead").value = value.dead;
                settingsEle.querySelector(".token-cover-prone").value = value.prone;
            }
        }
        this._updateTokenSizeCoverRowWarnings();
    }

    _updateTokenSizeCoverRowWarnings() {
        const tokenCoverSettingsEle = this.element.querySelector("#scc-token-cover-settings-body");
        if (!tokenCoverSettingsEle) return;
        
        for (const sizeRow of tokenCoverSettingsEle.children) {
            const warnings = this._getTokenSizeCoverRowWarning(sizeRow.dataset.size);
            const warningsEl = sizeRow.querySelector(".athenaeum-warn-parent");
            if (warnings.length) {
                warningsEl.classList.remove("hidden");
                warningsEl.firstElementChild.replaceChildren(...warnings.map(warning => {
                    const el = document.createElement("li");
                    el.className = "athenaeum-warn";
                    el.innerText = warning;
                    return el;
                }));
            } else {
                warningsEl.classList.add("hidden");
                warningsEl.firstElementChild.replaceChildren();
            }
        }
    }

    _getTokenSizeCoverRowWarning(sizeKey) {
        const warnings = [];
        const sizeRow = this.element.querySelector(`#scc-token-cover-settings-body [data-size="${sizeKey}"]`)
        if (!sizeRow) return warnings;
        
        const coverLevels = this._getTokenSizeValues(sizeRow);
        const prevSizeRow = sizeRow.previousElementSibling;

        {
            const maxCoverLevel = this.coverData.length - 1
            if (Object.values(coverLevels).some(coverLevel => coverLevel > maxCoverLevel)) {
                warnings.push(HELPER.localize("scc.tokenSizes.warningUnknownLevel"));
            }
        }

        if (prevSizeRow) {
            const prevCoverLevels = this._getTokenSizeValues(prevSizeRow);
            if (Object.entries(coverLevels).some(([actorState, coverLevel]) => coverLevel < prevCoverLevels[actorState])) {
                warnings.push(HELPER.localize("scc.tokenSizes.warningBadSizeOrder"));
            }
        }

        return warnings
    }

    _getTokenSizeValues(sizeRowEl) {
        return {
            normal: parseInt(sizeRowEl.querySelector(".token-cover-normal").value) || 0,
            dead: parseInt(sizeRowEl.querySelector(".token-cover-dead").value) || 0,
            prone: parseInt(sizeRowEl.querySelector(".token-cover-prone").value) || 0,
        }
    }
}