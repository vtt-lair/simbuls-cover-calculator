/**
 * Approximate the cover level look up table
 * <br>
 * This matches exactly the original look up tables for tokens for all values (0-3), then approximates future ones
 * using linear interpolation
 * <br>
 * Working out, where t is the cover level: {@link https://www.desmos.com/calculator/3lykzkmfb5}
 * @param coverLevel The level to create the LUT for
 * @returns {Number[]} A look up table for the cover level at each level of cover for the given cover level
 */
export function calculateCoverLevelLut(coverLevel) {
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
