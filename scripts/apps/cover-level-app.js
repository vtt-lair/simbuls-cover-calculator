import {MODULE} from "../module.js";
import {calculateCoverLevelLut} from "../cover-utils.js";
import {HELPER} from "../../../simbuls-athenaeum/scripts/helper.js";

/**
 * A class to allow modification of a specific cover level
 */
export default class CoverLevelConfig extends FormApplication {
    constructor(add, coverLevel, coverIndex, callback) {
        super(null, {
            title: add ? HELPER.localize("scc.coverLevelConfig.titleAdd") : HELPER.localize("scc.coverLevelConfig.titleEdit"),
            icon: (add ? `<i class="fas fa-plus"></i>` : undefined)
        });
        this.add = add;
        this.coverLevel = coverLevel;
        this.coverIndex = coverIndex;
        this.callback = callback;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["form", "cover-level-config"],
            width : 600,
            height : "auto",
            template: `${MODULE.data.path}/templates/CoverLevelConfig.hbs`,
            id: 'cover-calculator-cover-level-settings',
            title: ""
        });
    }

    async getData() {
        // Send data to the template
        return this.coverLevel;
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Add reset functionality to reset partials button
        html.find("[name=\"reset-partials\"]")[0].onclick = (event) => {
            const partial = calculateCoverLevelLut(this.coverIndex);

            const quarterEl = html.find("[name=\"quarter-cover\"]")[0];
            quarterEl.value = partial[1];
            const halfEl = html.find("[name=\"half-cover\"]")[0];
            halfEl.value = partial[2];
            const threeQuaterEl = html.find("[name=\"three-q-cover\"]")[0];
            threeQuaterEl.value = partial[3];
            const fullEl = html.find("[name=\"full-cover\"]")[0];
            fullEl.value = partial[4];
        }

        html.find("[name=\"icon\"]").change(this._updateIcon.bind(this))
    }

    _updateIcon(event) {
        this.form.querySelector(".cover-settings-image").src = event.currentTarget.value
    }

    async _updateObject(event, formData) {
        // Validation
        // Label
        if (formData.label.length === 0) {
            const error = HELPER.localize("scc.coverLevelConfig.errorNoLabel");
            ui.notifications.error(error);
            throw new Error(error);
        }

        // AC Bonus
        formData.value ||=  0;

        // Cover Partials
        {
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
        }

        this.callback(formData)
    }
}
