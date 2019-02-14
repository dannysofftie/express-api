/**
 * Compares expected object keys and supplied keys. Returns truthy on pass and falsy on fail.
 *
 * On fail, the difference between object keys is returned.
 *
 * @export
 */
export function compareObjects(expected: {}, supplied: {}) {
    const [required, incoming, diff] = [Object.keys(expected), Object.keys(supplied), []];

    for (const value of required) {
        const index = incoming.findIndex((a) => a === value);
        if (index < 0) {
            diff.push(value);
        } else {
            incoming.slice(index, 1);
        }
    }

    return { required, supplied: incoming, diff };
}

// to do:
// compare deep nested arrays where expected key has object(s) nested
