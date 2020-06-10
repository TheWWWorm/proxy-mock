'use strict';

/**
 * @param {Object} [specifics={}] specifics - allows avoid generating specific keys, will use keys from provided object instead
 * @param {String} [name='proxyMock'] name - useful in testing scenarios, when you want to see if spy failed or not
 * @param {Function} spyWrap - spy wrapper, can be used for auto-spying on the proxy. Should accept (name, function) for spying
 */
const getProxyMock = (specifics = {}, name = 'proxyMock', wrap) => {
    function _target() {
        getProxyMock();
    }

    const target = wrap ? wrap(name, _target) : _target;

    target[Symbol.toPrimitive] = (hint) => {
        if (hint === 'string') {
            return 'proxyString';
        } else if (hint === 'number') {
            return 42;
        }
        return '1337';
    }
    target[Symbol.iterator] = function*() {
        yield getProxyMock({}, `${name}.Symbol(Symbol.iterator)`, wrap);
    }

    return new Proxy(target, {
        get(obj, key) {
            key = key.toString();
            if (specifics.hasOwnProperty(key)) {
                return specifics[key];
            }
            if (key === 'Symbol(Symbol.toPrimitive)') {
                return obj[Symbol.toPrimitive]
            }
            if (key === 'Symbol(Symbol.iterator)') {
                return obj[Symbol.iterator]
            }
            if (!obj.hasOwnProperty(key)) {
                obj[key] = getProxyMock({}, `${name}.${key}`, wrap);
            }
            return obj[key];
        }
    })
}

exports.getProxyMock = getProxyMock;