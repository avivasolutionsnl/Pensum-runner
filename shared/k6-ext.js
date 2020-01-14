// Several K6 extensions to make e.g. checking and debugging easier
import { group as k6Group, check as k6Check, fail } from 'k6';

export function group (name, fun) {
    console.debug(`group ${name}`);
    return k6Group(name, fun);
}

export function check (val, sets, tags = {}) {
    console.debug(`check response from url: ${val.request.url}`);
    return k6Check(val, sets, tags);
}

/* Fail if check returns false */
export function failCheck (val, sets, tags = {}, message = 'fail because check returned false') {
    const res = check(val, sets, tags);
    if (res) {
        return res;
    }

    const logMessage = `${message}, request: ${JSON.stringify(val.request)}`;
    fail(logMessage);
    return false;
}

/* Checks all the responses for a batch for a certain condition */
export function checkAll (batch, condition) {
    let res = true;
    for (var propertyName in batch) {
        res = check(batch[propertyName], condition) && res;
    }
    return res;
}

/* Checks all the responses for a batch for a certain condition, fail if checkAll returns false */
export function failCheckAll (batch, condition, message = 'fail because checkAll returned false') {
    const res = checkAll(batch, condition);
    if (res) {
        return res;
    }

    fail(message);
    return false;
}
