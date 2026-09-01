import '@angular/compiler';
import 'zone.js';
import 'zone.js/testing';
import { beforeEach } from 'vitest';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

try {
  getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: true },
  });
} catch {
  // already initialized
}

const ProxyZoneSpec = (Zone as any)['ProxyZoneSpec'];
if (ProxyZoneSpec) {
  const proxyZone = Zone.current.fork(new ProxyZoneSpec());
  const origIt = (globalThis as any).it;
  if (origIt) {
    (globalThis as any).it = new Proxy(origIt, {
      apply(target, thisArg, args) {
        const [name, fn, timeout] = args;
        if (typeof fn !== 'function') {
          return Reflect.apply(target, thisArg, args);
        }
        return Reflect.apply(target, thisArg, [
          name,
          (...testArgs: any[]) => proxyZone.run(fn, null, testArgs),
          timeout,
        ]);
      },
    });
  }

  beforeEach(() => {
    const spec = (Zone as any).current.get('ProxyZoneSpec');
    if (spec) {
      spec.resetDelegateTo(null);
    }
  });
}
