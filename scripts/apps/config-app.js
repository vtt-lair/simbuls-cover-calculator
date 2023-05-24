import {MODULE} from "../module.js";
import {HELPER} from "../../../simbuls-athenaeum/scripts/helper.js";
import {logger} from "../../../simbuls-athenaeum/scripts/logger.js";
import {CoverCalculator} from "../modules/CoverCalculator.js";

/**
 * HelpersSettingConfig extends {SettingsConfig}
 *
 * Additional window for 5e Helper specific settings
 * Allows for Settings to be organized in 4 categories
 *  System Helpers
 *  NPC Features
 *  PC Features
 *  Combat Helpers
 *
 * @todo "display" value which is true or false based on some other setting
 * @todo "reRender" grabs (possibly saves) values and rerenders the Config to change what is displayed dynamically
 */
export class CoverCalculatorSettingsConfig extends SettingsConfig {
    constructor({subModule = null, subMenuId = null, groupLabels = CoverCalculatorSettingsConfig.defaultGroupLabels, parentMenu = null} = {}){
        super();
        this.options.subModule = subModule;
        this.options.groupLabels = groupLabels;
        this.options.subMenuId = subMenuId;
        this.options.parentMenu = parentMenu;
    }

    // Presets available for cover levels
    coverPresets = {
        none: {
            label: ""
        },
        dnd5e: {
            label: "DnD5e",
            config: {
                0: {
                    label: HELPER.localize("SCC.LoS_nocover"),
                    value: 0,
                    color: "0xff0000",
                    icon: "",
                    partial: [0, 0, 0, 0, 0]
                },
                1: {
                    label: HELPER.localize("SCC.LoS_halfcover"),
                    value: 2,
                    color: "0xffa500",
                    icon: `modules/${MODULE.data.name}/assets/cover-icons/Half_Cover.svg`,
                    partial: [0, 1, 1, 1, 1]
                },
                2: {
                    label: HELPER.localize("SCC.LoS_34cover"),
                    value: 5,
                    color: "0xffff00",
                    icon: `modules/${MODULE.data.name}/assets/cover-icons/ThreeQ_Cover.svg`,
                    partial: [0, 1, 1, 2, 2]
                },
                3: {
                    label: HELPER.localize("SCC.LoS_fullcover"),
                    value: 40,
                    color: "0x008000",
                    icon: `modules/${MODULE.data.name}/assets/cover-icons/Full_Cover.svg`,
                    partial: [0, 1, 1, 2, 3]
                },
            }
        },
        sw5e: {
            label: "SW5e",
            config: {
                0: {
                    label: HELPER.localize("SCC.LoS_nocover"),
                    value: 0,
                    color: "0xff0000",
                    icon: "",
                    partial: [0, 0, 0, 0, 0]
                },
                1: {
                    label: HELPER.localize("SCC.LoS_quartercover"),
                    value: 2,
                    color: "0xffa500",
                    icon: `modules/${MODULE.data.name}/assets/cover-icons/Q_Cover.svg`,
                    partial: [0, 1, 1, 1, 1]
                },
                2: {
                    label: HELPER.localize("SCC.LoS_halfcover"),
                    value: 3,
                    color: "0xffa500",
                    icon: `modules/${MODULE.data.name}/assets/cover-icons/Half_Cover.svg`,
                    partial: [0, 1, 1, 2, 2]
                },
                3: {
                    label: HELPER.localize("SCC.LoS_34cover"),
                    value: 5,
                    color: "0xffff00",
                    icon: `modules/${MODULE.data.name}/assets/cover-icons/ThreeQ_Cover.svg`,
                    partial: [0, 1, 2, 2, 3]
                },
                4: {
                    label: HELPER.localize("SCC.LoS_fullcover"),
                    value: 40,
                    color: "0x008000",
                    icon: `modules/${MODULE.data.name}/assets/cover-icons/Full_Cover.svg`,
                    partial: [0, 1, 2, 3, 4]
                },
            }
        }
    }

    /**
     * Presets available for Cover by Token size, cover config is generated to be scaled to the
     */
    tokenPresets ={
        none: {
            label: ""
        },
        flat: {
            label: "Flat",
            generateConfig: (sizes) => {
                const config = {};
                for (const size of sizes) {
                    config[size] = {
                        normal: 1,
                        dead: 1,
                        prone: 1
                    };
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
                    config[size] = {
                        normal: coverValue,
                        dead: coverValue,
                        prone: coverValue
                    };
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
                    config[size] = {
                        normal: coverValue,
                        dead: deadCoverValue,
                        prone: deadCoverValue
                    };
                }

                return config;
            }
        },
        linearAlt: {
            label: "Linear (alt)",
            generateConfig: (sizes) => {
                const config = {};
                const maxCover = this.coverData.length - 2;
                for (const [index, size] of sizes.entries()) {
                    const coverValue = Math.ceil((index / sizes.length) * maxCover) + 1;
                    config[size] = {
                        normal: coverValue,
                        dead: coverValue,
                        prone: coverValue
                    };
                }

                return config;
            }
        },
        linearDeadAlt: {
            label: "Linear, half on death (alt)",
            generateConfig: (sizes) => {
                const config = {};
                const maxCover = this.coverData.length - 2;
                for (const [index, size] of sizes.entries()) {
                    const coverValue = Math.ceil((index / sizes.length) * maxCover) + 1;
                    const deadCoverValue = Math.floor(coverValue / 2);
                    config[size] = {
                        normal: coverValue,
                        dead: deadCoverValue,
                        prone: deadCoverValue
                    };
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
                    config[size] = {
                        normal: coverValue,
                        dead: coverValue,
                        prone: coverValue
                    };
                }

                return config;
            }
        },
        devPrefDead: {
            label: "Developer Preference, half on death",
            generateConfig: (sizes) => {
                const config = {};
                const maxCover = this.coverData.length - 2;
                for (const [index, size] of sizes.entries()) {
                    let x = index / sizes.length;
                    x = (2 * x) / (x + 1);

                    const coverValue = Math.ceil(x * maxCover) + 1;
                    const deadCoverValue = Math.floor(coverValue / 2);
                    config[size] = {
                        normal: coverValue,
                        dead: deadCoverValue,
                        prone: deadCoverValue
                    };
                }

                return config;
            }
        }
    }

    static _menus = new Collection();

    static get menus() {
        return CoverCalculatorSettingsConfig._menus;
    }

    static get defaultGroupLabels() {
        return {
            'system': { faIcon: 'fas fa-cog', tabLabel: 'SCC.groupLabel.system'},
            'combat': { faIcon: 'fas fa-dice-d20', tabLabel: 'SCC.groupLabel.combat'},
            'token-sizes': { faIcon: 'fas fa-expand-arrows-alt', tabLabel: 'SCC.groupLabel.token-sizes'},
            'cover': { faIcon: 'fas fa-chart-simple', tabLabel: 'SCC.groupLabel.cover-levels'},
            'misc': { faIcon: 'fas fa-list-alt', tabLabel: 'SCC.groupLabel.misc'},
        }
    }


    get menus() {
        return CoverCalculatorSettingsConfig.menus;
    }
    /**@override */
    static get defaultOptions(){
        return mergeObject(super.defaultOptions, {
            title : HELPER.localize("Helpers"),
            id : "cover-calculator-client-settings",
            template : `${MODULE.data.athenaeum}/templates/ModularSettings.html`,
            width : 600,
            height : "auto",
            tabs : [
                {navSelector: ".tabs", contentSelector: ".content", initial: "general"}
            ],
        });
    }

    _onClickReturn(event) {
        event.preventDefault();
        const menu = game.settings.menus.get('simbuls-cover-calculator.helperOptions');
        if ( !menu ) return ui.notifications.error("No parent menu found");
        const app = new menu.type();
        return app.render(true);
    }

    /**@override */
    getData(options){
        const canConfigure = game.user.can("SETTING_MODIFY");
        const settings = Array.from(game.settings.settings);

        options.title = HELPER.format('SCC.ConfigApp.title');
        let data = {
            tabs: duplicate(options.groupLabels),
            hasParent: !!options.subMenuId,
            parentMenu: options.parentMenu
        }

        const registerTabSetting = (tabName) => {
            /* this entry exists already or the setting does NOT have a group,
            * dont need to create another tab. Core settings do not have this field.
            */
            if (data.tabs[tabName].settings) return false;

            /* it doesnt exist, so add a new entry */
            data.tabs[tabName].settings = [];
        }

        const registerTabMenu = (tabName) => {
            /* this entry exists already or the setting does NOT have a group,
            * dont need to create another tab. Core settings do not have this field.
            */
            if (data.tabs[tabName].menus) return false;

            /* it doesnt exist, so add a new entry */
            data.tabs[tabName].menus = [];
        }

        for (let [_, setting] of settings.filter(([_, setting]) => setting.namespace == MODULE.data.name)) {

            /* only add an actual setting if the menu ids match */
            if (!setting.config) {

                if (!canConfigure && setting.scope !== "client") continue;
                setting.group = data.tabs[setting.group] ? setting.group : 'misc'

                /* ensure there is a tab to hold this setting */
                registerTabSetting(setting.group);

                let groupTab = data.tabs[setting.group] ?? false;
                if(groupTab) groupTab.settings.push({
                    ...setting,
                    type : setting.type instanceof Function ? setting.type.name : "String",
                    isCheckbox : setting.type === Boolean,
                    isSelect : setting.choices !== undefined,
                    isRange : setting.type === Number && setting.range,
                    isCustom : !!setting.customPartial,
                    value : HELPER.setting(MODULE.data.name, setting.key),
                    path: `${setting.namespace}.${setting.key}`
                });
            }
        }

        /* check if we are the parent of any registered submenus and add those */
        const childMenus = this.menus.filter( menu => menu.parentMenu == this.options.subMenuId )
        childMenus.forEach( menu => {
            registerTabMenu(menu.tab);
            let groupTab = data.tabs[menu.tab] ?? false;
            if(groupTab) groupTab.menus.push(menu);
        });

        /* clean out tabs that have no entries */
        data.tabs = Object.entries(data.tabs).reduce( (acc, [name, val]) => {
            /* if we have any settings or any menus, keep the tab */
            if(!!val.settings || !!val.menus) acc[name] = val;
            return acc;
        }, {})

        // Store coverData and token cover data for manipulation
        this.coverData = Object.values(HELPER.setting(MODULE.data.name, "coverData"));

        // Presets
        data.coverPresets = this.coverPresets;
        data.tokenPresets = this.tokenPresets;  // This needs to occur after cover data is set

        logger.debug(game.settings.get(MODULE.data.name, "debug"), "GET DATA | DATA | ", data);

        return {
            user : game.user, canConfigure, systemTitle : game.system.title, data
        }
    }

    async _onSubmit(...args) {
        const formData = await super._onSubmit(...args);

        // We need to save the cover data separately as the FormApplication#_updateObject function will flatten the object and break
        game.settings.set(MODULE.data.name, "coverData",
            this.coverData.reduce((acc, coverLevel, index) => {
                acc[index] = coverLevel;
                return acc;
            }, {})
        )

        // Save the changes to token sizes
        {
            const defaultTokenSizes = HELPER.setting(MODULE.data.name, "tokenSizesDefault");
            const tokenCoverSettings = this.form.querySelector("#scc-token-cover-settings-body");
            for (const tokenCover of tokenCoverSettings.children) {
                const tokenSize = defaultTokenSizes[tokenCover.dataset.size];
                foundry.utils.mergeObject(tokenSize, this._getTokenSizeValues(tokenCover));
            }

            game.settings.set(MODULE.data.name, "tokenSizesDefault", defaultTokenSizes);
        }

        if( this.options.subMenuId ){
            /* submitting from a subMenu, re-render parent */
            await this._onClickReturn(...args);
        }

        return formData;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('button[name="return"]').click(this._onClickReturn.bind(this));

        html.find(".cover-preset").change(this._handleCoverPresetSelected.bind(this));
        html.find(".token-cover-preset").change(this._handleTokenCoverPresetSelected.bind(this));

        html.find("#scc-token-cover-settings-body input").change(this._updateTokenSizeCoverRowWarnings.bind(this));

        // unsure if this is the right place
        this._redrawCoverLevels();
        this._updateTokenSizeCoverRowWarnings()
    }

    /* --------------------------------------------- */
    /* Cover Level Helpers                           */
    /* --------------------------------------------- */

    /**
     * Create a dialog for modifying a cover level
     * @param {Number} index The index of
     * @param {Boolean} [add] Whether the dialog is for adding a new cover level or modifying an existing one
     * @private
     */
    async _createCoverLevelDialog(index, add = true) {
        let data;
        if (add) {
            // Create a template cover level
            data = {
                label: "New Cover Level", value: null, color : "0x008000",
                icon : `modules/${MODULE.data.name}/assets/cover-icons/Full_Cover.svg`,
                partial: CoverCalculatorSettingsConfig._calculateCoverLevelLut(index),
                coverLevels: {
                    [index]: "New Cover Level",
                    ...this.coverData.reduce((acc, value, currentIndex) => {
                        acc[currentIndex >= index ? currentIndex + 1 : currentIndex] = value.label
                        return acc;
                    }, {})
                }
            }
        } else {
            // Get the existing cover level
            data = {
                ...this.coverData[index],
                coverLevels: this.coverData.reduce((acc, value, currentIndex) => {
                    acc[currentIndex] = value.label
                    return acc;
                }, {}),
            };
        }

        new Dialog({
                title: add ? "Add a new cover level" : "Edit Cover Level",
                content: await renderTemplate(`${MODULE.data.path}/templates/CoverLevelConfig.hbs`, data),
                buttons: {
                    submit: {
                        label: add ? "Add" : "Apply",
                        callback: (html) => {
                            const coverLevel = {};
                            // Label
                            {
                                const labelEl = html.find("[name=\"label\"]")[0];
                                if (labelEl.value.length === 0) throw new Error("You must provide a label");
                                coverLevel.label = labelEl.value;
                            }

                            // AC Bonus
                            {
                                const labelEl = html.find("[name=\"value\"]")[0];
                                coverLevel.value = parseInt(labelEl.value) || 0;
                            }

                            // Cover Partials
                            {
                                const partial = [0];
                                const quarterEl = html.find("[name=\"quarter-cover\"]")[0];
                                partial.push(parseInt(quarterEl.value));
                                const halfEl = html.find("[name=\"half-cover\"]")[0];
                                partial.push(parseInt(halfEl.value));
                                const threeQuaterEl = html.find("[name=\"three-q-cover\"]")[0];
                                partial.push(parseInt(threeQuaterEl.value));
                                const fullEl = html.find("[name=\"full-cover\"]")[0];
                                partial.push(parseInt(fullEl.value));

                                coverLevel.partial = partial;
                            }

                            if (add) {
                                const coverIndex = this.coverData.length - 1;
                                const temp = this.coverData[coverIndex];
                                this.coverData[coverIndex] = coverLevel;
                                this.coverData.push(temp)
                            } else {
                                this.coverData[index] = coverLevel;
                            }
                            this._redrawCoverLevels();
                        },
                        icon: (add ? `<i class="fas fa-plus"></i>` : undefined)
                    },
                },
                default: "submit",
                render: (html) => {
                    // Add reset functionality to reset partials button
                    html.find("[name=\"reset-partials\"]")[0].onclick = (event) => {
                        const partial = CoverCalculatorSettingsConfig._calculateCoverLevelLut(index);

                        const quarterEl = html.find("[name=\"quarter-cover\"]")[0];
                        quarterEl.value = partial[1];
                        const halfEl = html.find("[name=\"half-cover\"]")[0];
                        halfEl.value = partial[2];
                        const threeQuaterEl = html.find("[name=\"three-q-cover\"]")[0];
                        threeQuaterEl.value = partial[3];
                        const fullEl = html.find("[name=\"full-cover\"]")[0];
                        fullEl.value = partial[4];
                    }
                }
            },
            {
                classes: ["cover-level-config"]
            }).render(true);
    }

    /**
     * An event to handle when the user selects a preset for cover levels
     * @param event The event that triggered the preset change
     * @private
     */
    _handleCoverPresetSelected(event) {
        try {
            const presetKey = event.currentTarget.value;
            if (presetKey.length === 0) return;
            const preset = this.coverPresets[presetKey];
            if (preset === undefined) {
                return;
            }

            if (!this.checkedCoverChange) {
                Dialog.confirm({
                    title: "Are you sure?",
                    content: "Are you sure you want to completely change the cover levels? Existing walls, tiles, and " +
                        "tokens in the world will not be updated and may behave unexpectedly unless corrected",
                    yes: () => {
                        this.checkedCoverChange = true;
                        this.coverData = Object.values(foundry.utils.deepClone(preset.config));
                        this._redrawCoverLevels();
                    },
                    defaultYes: false
                });
                return;
            }

            this.coverData = Object.values(foundry.utils.deepClone(preset.config));
            this._redrawCoverLevels();
        } finally {
            event.currentTarget.value = "none";
        }
    }

    /**
     * Handle clicking one of the buttons on the cover levels menu
     * @param {Event} event The click Event
     * @private
     */
    async _handleCoverControl(event) {
        const action = event.currentTarget.dataset.action;
        if (action === "add") {
            const newIndex = this.coverData.length - 1;
            await this._createCoverLevelDialog(newIndex, true);
            return;
        }
        if (["up", "down", "delete"].includes(action) && !this.checkedCoverChange) {
            Dialog.confirm({
                title: "Are you sure?",
                content: "Are you sure you want to modify the order of the cover levels? Existing walls, tiles, and " +
                    "tokens in the world will not be updated and may behave unexpectedly unless corrected",
                yes: () => {
                    this.checkedCoverChange = true;
                },
                defaultYes: false
            });
            return;
        }

        const index = parseInt(event.currentTarget.parentElement.parentElement.dataset.index);
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
                Dialog.confirm({
                    title: "Are you sure?",
                    content: "Are you sure you want to delete that cover level?",
                    yes: () => {
                        this.coverData.splice(index, 1);
                        this._redrawCoverLevels();
                    },
                    defaultYes: false
                });
                return;
        }

        this._redrawCoverLevels();
    }

    /**
     * Redraw all the cover levels in the config tab
     * @private
     */
    _redrawCoverLevels() {
        const coverElement = document.querySelector("#scc-cover-levels-settings-body");
        coverElement.innerHTML = "";

        // Clone so we don't touch the actual data
        const data = foundry.utils.deepClone(this.coverData);

        for (const [index, coverLevel] of Object.entries(data)) {
            const indexNum = parseInt(index);
            coverLevel.warnings = this._getCoverLevelWarnings(coverLevel, indexNum);

            coverElement.appendChild(this._buildCoverLevelElement(indexNum, coverLevel));
        }

        // When we redraw we may have done something that has messed up the token cover levels, so check for warnings
        this._updateTokenSizeCoverRowWarnings()
    }

    _getCoverLevelWarnings(coverLevel, index) {
        const warnings = [];
        if (!coverLevel.partial.includes(index)) {
            warnings.push("The partial cover values never return this cover level, an actor will never be regarded as fully in cover of this type.")
        }

        const coverMax = Math.max(...coverLevel.partial);
        if (coverMax > index) {
            warnings.push("A partial level returns a value greater than this cover level, this may have unexpected results.")
        }

        if (coverMax >= this.coverData.length) {
            warnings.push("This partial returns a cover level that doesn't exist, this may have unexpected results.")
        }

        return warnings;
    }

    /**
     * Build an element that represents a cover level row
     * @param {Number} index The index of the Cover Level
     * @param {Object} coverLevel The data for the cover level
     * @return {HTMLLIElement}
     * @private
     */
    _buildCoverLevelElement(index, coverLevel) {
        const controls = [
            {title: "Edit Cover Level", action: "edit", icon: "fas fa-edit"},
            {title: "Move up", action: "up", icon: "fas fa-arrow-up", disabled: index === 0},
            {title: "Move down", action: "down", icon: "fas fa-arrow-down", disabled: index === this.coverData.length - 1},
            {title: "Delete Cover Level", action: "delete", icon: "fas fa-trash", disabled: index === 0 || index === this.coverData.length - 1}
        ]

        const containerEl = document.createElement("li");
        containerEl.className = "athenaeum-table-row flexrow";
        containerEl.dataset.index = index;

        // Title
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

        // AC Bonus
        {
            const acEl = document.createElement("div");
            acEl.className = "cover-ac-bonus";
            acEl.innerText = (coverLevel.value > 0 ? "+" : "") + coverLevel.value;
            containerEl.appendChild(acEl)
        }

        // Controls
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

    /**
     * Approximate the cover level look up table
     * <br>
     * This matches exactly the original look up tables for tokens for all values (0-3), then approximates future ones
     * using linear interpolation
     * <br>
     * Working out, where t is the cover level: {@link https://www.desmos.com/calculator/3lykzkmfb5}
     * @param coverLevel The level to create the LUT for
     * @returns {Number[]} A look up table for the cover level at each level of cover for the given cover level
     * @private
     */
    static _calculateCoverLevelLut(coverLevel) {
        const lut = [];
        for (let i = 0; i < 5; i++) {
            let value;
            if (coverLevel > 3) {
                // Anything bigger than 3 looks best on a linear curve
                value = Math.ceil(coverLevel*i/4);
            } else {
                // Everything else can be approximated with this equation and some creative rounding
                const x = i/4;
                value = (1.4 * Math.pow(x, 3) - 2.1 * Math.pow(x, 2) + 1.7 * x) * coverLevel;

                if (coverLevel < 3) {
                    // Ceil 1 & 2
                    value = Math.ceil(value);
                } else {
                    // This bad rounding matches better than the regular kind of rounding
                    if (value % 1 > 0.5) value = Math.ceil(value);
                    else value = Math.floor(value);
                }
            }
            lut.push(value);
        }
        return lut;
    }

    /* --------------------------------------------- */
    /* Token Size Cover Helpers                      */
    /* --------------------------------------------- */

    /**
     * An event to handle when the user selects a preset for token cover levels
     * @param event The event that triggered the preset change
     * @private
     */
    _handleTokenCoverPresetSelected(event) {
        try {
            const presetKey = event.currentTarget.value;
            if (presetKey.length === 0) return;
            const preset = this.tokenPresets[presetKey];
            if (preset === undefined) {
                return;
            }

            if (!this.checkedTokenCoverChange) {
                Dialog.confirm({
                    title: "Are you sure?",
                    content: "Are you sure you want to apply a token cover level preset? Existing tokens already " +
                        "placed in the world will not be updated",
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

    /**
     * Apply the given preset config to the settings menu
     * @param preset {Object} the preset config to use
     * @private
     */
    _applyTokenPreset(preset) {
        const tokenCoverSettingsEle = this.form.querySelector("#scc-token-cover-settings-body");

        const presetConfig = preset.generateConfig(Object.keys(CONFIG[game.system.id.toUpperCase()].actorSizes));
        for (const [key, value] of Object.entries(presetConfig)) {
            const settingsEle = tokenCoverSettingsEle.querySelector(`[data-size="${key}"]`);
            settingsEle.querySelector(".token-cover-normal").value = value.normal;
            settingsEle.querySelector(".token-cover-dead").value = value.dead;
            settingsEle.querySelector(".token-cover-prone").value = value.prone;
        }

        // Check for warnings incase they've been removed or something has gone very wrong
        this._updateTokenSizeCoverRowWarnings();
    }

    /**
     * Update the warnings on each size
     * @private
     */
    _updateTokenSizeCoverRowWarnings() {
        const tokenCoverSettingsEle = this.form.querySelector("#scc-token-cover-settings-body");

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

    /**
     * Get the warnings for a size
     * @param sizeKey {String} The key of the size to check for warnings
     * @return {String[]}
     * @private
     */
    _getTokenSizeCoverRowWarning(sizeKey) {
        const warnings = [];

        const sizeRow = this.form.querySelector(`#scc-token-cover-settings-body [data-size="${sizeKey}"]`)
        const coverLevels = this._getTokenSizeValues(sizeRow);
        const prevSizeRow = sizeRow.previousElementSibling;

        // Check below max
        {
            const maxCoverLevel = this.coverData.length - 1
            if (Object.values(coverLevels).some(coverLevel => coverLevel > maxCoverLevel)) {
                warnings.push(`A cover level has been set to greater than the maximum available cover level, this will be clamped to the max cover level: ${maxCoverLevel}.`);
            }
        }

        // Check Above or equal to previous
        if (prevSizeRow) {
            const prevCoverLevels = this._getTokenSizeValues(prevSizeRow);
            if (Object.entries(coverLevels).some(([actorState, coverLevel]) => coverLevel < prevCoverLevels[actorState])) {
                warnings.push("The cover level of this size is less than the cover level of the previous size, this may be a mistake, or the sizes are out of order.");
            }
        }

        return warnings
    }

    /**
     * Get the normal, dead, and prone values of a specific actor size from the form
     * @param sizeRowEl {Element} The size row element that contains the fields
     * @return {{normal: (number), dead: (number), prone: (number)}}
     * @private
     */
    _getTokenSizeValues(sizeRowEl) {
        return {
            normal: parseInt(sizeRowEl.querySelector(".token-cover-normal").value) || 0,
            dead: parseInt(sizeRowEl.querySelector(".token-cover-dead").value) || 0,
            prone: parseInt(sizeRowEl.querySelector(".token-cover-prone").value) || 0,
        }
    }
}
