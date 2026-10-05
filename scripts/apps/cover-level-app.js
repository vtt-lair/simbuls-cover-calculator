import {MODULE} from "../module.js";
import {calculateCoverLevelLut} from "../cover-utils.js";
import {HELPER} from "../../../simbuls-athenaeum/scripts/helper.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * A class to allow modification of a specific cover level
 * Migrated to AppV2 for V14 support.
 */
export default class CoverLevelConfig extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(add, coverLevel, coverIndex, callback) {
        super({
            window: { title: add ? HELPER.localize("scc.coverLevelConfig.titleAdd") : HELPER.localize("scc.coverLevelConfig.titleEdit") }
        });
        this.add = add;
        this.coverLevel = coverLevel;
        this.coverIndex = coverIndex;
        this.callback = callback;
    }

    static DEFAULT_OPTIONS = {
        classes: ["form", "cover-level-config"],
        id: 'cover-calculator-cover-level-settings',
        position: {
            width: 600,
            height: "auto"
        }
    };

    static PARTS = {
        main: {
            template: `modules/simbuls-cover-calculator/templates/CoverLevelConfig.hbs`
        }
    }

    async _prepareContext() {
        return this.coverLevel;
    }

    _onRender(context, options) {
        super._onRender(context, options);

        const resetBtn = this.element.querySelector("[name=\"reset-partials\"]");
        if (resetBtn) {
            resetBtn.addEventListener("click", (event) => {
                const partial = calculateCoverLevelLut(this.coverIndex);
                this.element.querySelector("[name=\"quarter-cover\"]").value = partial[1];
                this.element.querySelector("[name=\"half-cover\"]").value = partial[2];
                this.element.querySelector("[name=\"three-q-cover\"]").value = partial[3];
                this.element.querySelector("[name=\"full-cover\"]").value = partial[4];
            });
        }

        const iconInput = this.element.querySelector("[name=\"icon\"]");
        if (iconInput) {
            iconInput.addEventListener("change", this._updateIcon.bind(this));
        }
        
        // Emulate FormApplication submit behavior for the parent app logic
        const submitBtn = this.element.querySelector("button[type=\"submit\"]");
        if (submitBtn) {
            submitBtn.addEventListener("click", async (e) => {
                e.preventDefault();
                const formData = new FormData(this.element.querySelector("form"));
                const data = Object.fromEntries(formData.entries());
                await this._updateObject(e, data);
            });
        }
    }

    _updateIcon(event) {
        this.element.querySelector(".cover-settings-image").src = event.currentTarget.value;
    }

    async _updateObject(event, formData) {
        if (formData.label.length === 0) {
            const error = HELPER.localize("scc.coverLevelConfig.errorNoLabel");
            ui.notifications.error(error);
            throw new Error(error);
        }

        formData.value ||= 0;

        const partial = [0];
        partial.push(parseInt(formData["quarter-cover"]));
        delete formData["quarter-cover"];
        partial.push(parseInt(formData["half-cover"]));
        delete formData["half-cover"];
        partial.push(parseInt(formData["three-q-cover"]));
        delete formData["three-q-cover"];
        partial.push(parseInt(formData["full-cover"]));
        delete formData["full-cover"];

        formData.partial = partial;
        this.callback(formData);
        this.close();
    }
}