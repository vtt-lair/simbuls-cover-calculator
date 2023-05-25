import {logger} from '../../../simbuls-athenaeum/scripts/logger.js';
import {HELPER} from '../../../simbuls-athenaeum/scripts/helper.js'
import {MODULE} from "../module.js";


/*
 * Changelog:
 * 1:
 *      Added custom cover system, reimplemented token cover
 */

const NAME = "simbuls-cover-calculator-migration";
const currentMigrationVersion = 1;

export default class Migration {
    static register() {
        Migration.settings();
        Migration.hooks();
    }

    static settings() {
        game.settings.register(MODULE.data.name, "migrationVersion", {
            name : "migrationVersion",
            hint : "The current migration version the world is on",
            scope : "world",
            config : false,
            type : Number,
            default : -1
        });
    }

    static hooks() {
        Hooks.on(`ready`, Migration._ready);
    }

    static async _ready() {
        if (!game.user.isGM) return false;

        const actualVersion = HELPER.setting(MODULE.data.name, "migrationVersion")
        if (actualVersion < currentMigrationVersion) {
            await Migration.migrate(actualVersion);
        }
    }

    /**
     * Kick of migration
     * @param actualVersion {Number} The version that the world currently thinks it is
     * @return {Promise<void>}
     */
    static async migrate(actualVersion) {
        logger.info(NAME, "Beginning Migration");
        if (actualVersion < 1) {
            await Migration.migrateTokenCoverSettings();
        }

        game.settings.set(MODULE.data.name, "migrationVersion", currentMigrationVersion);
        logger.info(NAME, "Migration Completed");
    }

    /**
     * Migrate tokenSizeCover Settings from 1.0.0
     * @return {Promise<void>}
     */
    static async migrateTokenCoverSettings() {
        logger.info(NAME, "Migrating Token Cover Settings");

        const tokenSizeCover = HELPER.setting(MODULE.data.name, "tokenSizesDefault");

        const proneDeadSetting = game.settings.storage.get("world").getSetting(`${MODULE.data.name}.proneActsLikeDead`);
        const proneDead = proneDeadSetting?.value || false;

        // Specify cover for token sizes
        {
            const setting = game.settings.storage.get("world").getSetting(`${MODULE.data.name}.specifyCoverForTokenSizes`);
            if (setting) {
                await setting.delete();
            }
        }

        // No Cover token sizes
        {
            const setting = game.settings.storage.get("world").getSetting(`${MODULE.data.name}.noCoverTokenSizes`);
            if (setting) {
                const sizes = setting.value.split(",")
                for (const size of sizes) {
                    if (!tokenSizeCover.hasOwnProperty(size)) {
                        logger.info(NAME, `Unknown size: ${size}, skipping`);
                    } else {
                        tokenSizeCover[size].normal = 0;
                    }
                }

                await setting.delete();
            }
        }

        // Three Quarters token sizes
        {
            const setting = game.settings.storage.get("world").getSetting(`${MODULE.data.name}.threeQuartersCoverTokenSizes`);
            if (setting) {
                const sizes = setting.value.split(",")
                for (const size of sizes) {
                    if (!tokenSizeCover.hasOwnProperty(size)) {
                        logger.info(NAME, `Unknown size: ${size}, skipping`);
                    } else {
                        tokenSizeCover[size].normal = 2;
                    }
                }

                await setting.delete();
            }
        }

        // No Cover Dead token sizes
        {
            const setting = game.settings.storage.get("world").getSetting(`${MODULE.data.name}.noDeadTokenSizes`);
            if (setting) {
                const sizes = setting.value.split(",")
                for (const size of sizes) {
                    if (!tokenSizeCover.hasOwnProperty(size)) {
                        logger.info(NAME, `Unknown size: ${size}, skipping`);
                    } else {
                        tokenSizeCover[size].dead = 0;
                        tokenSizeCover[size].prone = proneDead ? 0 : tokenSizeCover[size].normal;
                    }
                }

                await setting.delete();
            }
        }

        // Half Cover Dead token sizes
        {
            const setting = game.settings.storage.get("world").getSetting(`${MODULE.data.name}.halfDeadTokenSizes`);
            if (setting) {
                const sizes = setting.value.split(",")
                for (const size of sizes) {
                    if (!tokenSizeCover.hasOwnProperty(size)) {
                        logger.info(NAME, `Unknown size: ${size}, skipping`);
                    } else {
                        tokenSizeCover[size].dead = 1;
                        tokenSizeCover[size].prone = proneDead ? 1 : tokenSizeCover[size].normal;
                    }
                }

                await setting.delete();
            }
        }

        // Three Quarter Cover Dead token sizes
        {
            const setting = game.settings.storage.get("world").getSetting(`${MODULE.data.name}.threeQuartersDeadTokenSizes`);
            if (setting) {
                const sizes = setting.value.split(",")
                for (const size of sizes) {
                    if (!tokenSizeCover.hasOwnProperty(size)) {
                        logger.info(NAME, `Unknown size: ${size}, skipping`);
                    } else {
                        tokenSizeCover[size].dead = 2;
                        tokenSizeCover[size].prone = proneDead ? 2 : tokenSizeCover[size].normal;
                    }
                }

                await setting.delete();
            }
        }

        // Full Cover Dead token sizes
        {
            const setting = game.settings.storage.get("world").getSetting(`${MODULE.data.name}.fullDeadTokenSizes`);
            if (setting) {
                const sizes = setting.value.split(",")
                for (const size of sizes) {
                    if (!tokenSizeCover.hasOwnProperty(size)) {
                        logger.info(NAME, `Unknown size: ${size}, skipping`);
                    } else {
                        tokenSizeCover[size].dead = 3;
                        tokenSizeCover[size].prone = proneDead ? 3 : tokenSizeCover[size].normal;
                    }
                }

                await setting.delete();
            }
        }


        if (proneDeadSetting) {
            await proneDeadSetting.delete();
        }
    }
}
