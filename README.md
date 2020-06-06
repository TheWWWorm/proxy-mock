# proxy-mock
A mock that can be used for anything

Recursively creates properties on demand(they are created as new copy of proxy-mock), can be called as function, supports toPrimitive and iterator methods.

## Use

```js
const mock = getProxyMock();
const { a, b, c} = mock; // a, b, c will be new proxy-mock copies
const nested = mock.db.users[3].address.street; // will work, all the keys will be created as new proxy-mock copies
const fnResult = mock.get('/cats'); // will result in yet another proxy-mock copy
const math = mock * 2; // will result in 84, since in case of toPrimitive calls we return primitive value, in this case it's 42
```

### auto spy(jasmine example)
proxy mock supports auto spying on newly created properties, you just have to pass the the spy function to proxy-mock
```js
const spyFn = (name, fn) => {
    return jasmine.createSpy(name, fn).and.callThrough();
}
const mock = getProxyMock({}, 'httpClient', spyFn);
mock.post('/api/call');
expect(mock).toHaveBeenCalled();
```
spyFn will be called each time new proxy is created and target will get neatly wrapped by the spy



