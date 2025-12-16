exports.cleanObject = (obj, expectedKeys) => {
    if (!obj) return;
    Object.keys(obj).forEach(key => {
        if (!expectedKeys.includes(key)) {
            delete obj[key];
        }
    });
    return obj;
};
