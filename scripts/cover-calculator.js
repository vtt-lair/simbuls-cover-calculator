/**
 * Main Module Organizational Tools
 */
import { MODULE } from './module.js';

/**
 * Sub Modules
 */
import { CoverCalculator } from './modules/CoverCalculator.js';

const SUB_MODULES = {
    MODULE,
    CoverCalculator
};

/*
  Initialize Module
*/
MODULE.build();

/*
  Initialize all Sub Modules
*/
Hooks.on(`setup`, () => {
    Object.values(SUB_MODULES).forEach(cl => cl.register());
    Hooks.callAll('covercalcReady', {MODULE, logger});
});
