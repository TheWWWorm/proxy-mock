export type SpyWrapFn = (name: string, target: () => any) => void;

/**
 * @param {Object} [specifics={}] specifics - allows avoid generating specific keys, will use keys from provided object instead
 * @param {String} [name='proxyMock'] name - useful in testing scenarios, when you want to see if spy failed or not
 * @param {Function} spyWrap - spy wrapper, can be used for auto-spying on the proxy. Should accept (name, function) for spying
 */
export function getProxyMock<T extends {}>(
  specifics: Partial<T> = {},
  name: string = 'proxyMock',
  spyWrap: SpyWrapFn = null
): T {
  function _target() {
    return getProxyMock({}, `${name}.call`, spyWrap);
  }

  const target: any = spyWrap ? spyWrap(name, _target) : _target;

  target[Symbol.toPrimitive] = (hint: string) => {
    if (hint === 'string') {
      return 'proxyString';
    } else if (hint === 'number') {
      return 42;
    }
    return '1337';
  }

  target[Symbol.iterator] = function* () {
    yield getProxyMock({}, `${name}.Symbol(Symbol.iterator)`, spyWrap);
  }

  return new Proxy(target, {
    get(obj: any, key: string) {
      key = key.toString();

      if (specifics.hasOwnProperty(key)) {
        return specifics[key as keyof Partial<T>];
      }
      if (key === 'Symbol(Symbol.toPrimitive)') {
        return obj[Symbol.toPrimitive]
      }
      if (key === 'Symbol(Symbol.iterator)') {
        return obj[Symbol.iterator]
      }
      if (!obj.hasOwnProperty(key)) {
        obj[key] = getProxyMock({}, `${name}.${key}`, spyWrap);
      }
      return obj[key];
    },
    
    ownKeys(obj) {
      return [...Reflect.ownKeys(obj), ...Reflect.ownKeys(specifics)];
    },

    getOwnPropertyDescriptor(obj, key) {
      let descriptor = Reflect.getOwnPropertyDescriptor(obj, key);

      if (descriptor) {
        descriptor = {
          value: this.get && this.get(obj, key, getProxyMock({}, key.toString())),
          enumerable: true,
          configurable: true,
          writable: true,
        }

        Object.defineProperty(obj, key, descriptor);
      }

      return descriptor;
    }
  }) as unknown as T;
}