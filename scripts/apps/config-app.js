import { MODULE } from "../module.js";
import { HELPER } from "../../../simbuls-athenaeum/scripts/helper.js";
import { logger } from "../../../simbuls-athenaeum/scripts/logger.js";

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

    static _menus = new Collection();

    static get menus() {
        return CoverCalculatorSettingsConfig._menus;
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

    onTokenCoverChange(event) {
        this.toggleTokenSizesTabVisible(event.currentTarget.checked);
    }

    prepareVisibleForms() {
        const isLosTokenChecked = document.querySelector(`[name="${MODULE.data.name}.losWithTokens"]`)?.checked;
        this.toggleTokenSizesTabVisible(isLosTokenChecked);
    }

    toggleTokenSizesTabVisible(isVisible) {
        const tab = document.querySelector(".sheet-tabs :nth-child(3)");
        if (tab) {
            tab.style.display = isVisible ? 'block' : 'none';
        }
    }

    async _handleCoverControl(event) {

        const action = event.currentTarget.dataset.action;
        if (action === "add") {
            // Popup edit dialogue, use data to create
            const index = this.coverData.length - 1;
            const temp = this.coverData[index];
        } else {
            const index = parseInt(event.currentTarget.parentElement.parentElement.dataset.index);
            switch (action) {
                case "edit":
                    // Popup edit dialogue
                    break;
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
                            delete this.coverData[index];
                            this._redrawCoverLevels();
                        },
                        defaultYes: false
                    });
                    return;
            }
        }

        this._redrawCoverLevels();
    }

    _redrawCoverLevels() {
        const coverElement = document.querySelector("#scc-cover-levels-settings-body");
        coverElement.innerHTML = "";
        for (const [index, coverLevel] of Object.entries(this.coverData)) {
            coverElement.appendChild(this.buildCoverLevelElement(parseInt(index), coverLevel));
        }
    }

    buildCoverLevelElement(index, coverLevel) {
        const controls = [
            {title: "Edit Cover Level", action: "edit", icon: "fas fa-edit"},
            {title: "Move up", action: "up", icon: "fas fa-arrow-up", disabled: index === 0},
            {title: "Move down", action: "down", icon: "fas fa-arrow-down", disabled: index === Object.keys(this.coverData).length - 1},
            {title: "Delete Cover Level", action: "delete", icon: "fas fa-trash", disabled: index === 0 || index === Object.keys(this.coverData).length - 1}
        ]

        const containerEl = document.createElement("li");
        containerEl.className = "cover-level flexrow";
        containerEl.dataset.index = index;

        // Title
        {
            const titleEl = document.createElement("div");
            titleEl.className = "cover-title";
            titleEl.innerText = coverLevel.label;
            containerEl.appendChild(titleEl);
        }

        // AC Bonus
        {
            const acEl = document.createElement("div");
            acEl.className = "cover-ac-bonus";
            acEl.innerText = coverLevel.value;
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

    async _onSubmit(...args) {
        const formData = await super._onSubmit(...args);

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
        html.find(`[name="${MODULE.data.name}.losWithTokens"]`).change(this.onTokenCoverChange.bind(this));

        html.find(".cover-levels-container .cover-control").click(this._handleCoverControl.bind(this));

        // unsure if this is the right place
        this.prepareVisibleForms();
    }

    static get defaultGroupLabels() {
        return {
            'system': { faIcon: 'fas fa-cog', tabLabel: 'SCC.groupLabel.system'},
            'combat': { faIcon: 'fas fa-dice-d20', tabLabel: 'SCC.groupLabel.combat'},
            'token-sizes': { faIcon: 'fas fa-expand-arrows-alt', tabLabel: 'SCC.groupLabel.token-sizes', hint: 'SCC.groupHint.token-sizes'},
            'cover': { faIcon: 'fas fa-chart-simple', tabLabel: 'SCC.groupLabel.cover-levels'},
            'misc': { faIcon: 'fas fa-list-alt', tabLabel: 'SCC.groupLabel.misc'},
        }
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

        // Store coverData for manipulation
        this.coverData = Object.values(HELPER.setting(MODULE.data.name, "coverData"));

        logger.debug(MODULE.data.name, "GET DATA | DATA | ", data);

        return {
            user : game.user, canConfigure, systemTitle : game.system.title, data
        }
    }

    /*
        Need to add a "reRender" state based onChange of specific elements
    */
}
