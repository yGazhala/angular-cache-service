import { TestBed, inject } from '@angular/core/testing';

import { CacheService } from './cache.service';

const msToMin = (ms: number): number => ms / 60000;

describe('CacheService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CacheService]
    });
  });

  it('should be created', inject([CacheService], (service: CacheService) => {
    expect(service).toBeTruthy();
  }));

  it('should set and get value', () => {
    const service = new CacheService();
    service.set(['parent', 'child'], true);
    expect(service.get(['parent', 'child'])).toBe(true);
  });

  it('should remove value', () => {
    const service = new CacheService();
    service.set(['test'], true);
    service.remove(['test']);
    expect(service.get(['test'])).toBeUndefined();
  });

  it('should remove value on timeout', () => {
    const service = new CacheService();
    service.set(['timeoutCheck'], true, msToMin(50));
    setTimeout(() => {
      expect(service.get(['timeoutCheck'])).toBeUndefined();
    }, 70);
  });

  it('should clear cache', () => {
    const service = new CacheService();
    service.set(['a'], true);
    service.set(['b'], true);
    service.clear();
    expect(service.get(['a'])).toBeUndefined();
    expect(service.get(['b'])).toBeUndefined();
  });

  it('should throw Error if the path is empty', () => {
    const service = new CacheService();
    expect(() => service.set([], true)).toThrowError(
      'CacheService.getPath() failed: pathArray can not be empty'
    );
  });

  it('should throw Error if expiresInMin is not a positive number', () => {
    const service = new CacheService();
    expect(() => service.set(['test'], true, 0)).toThrowError(
      'CacheService.getTimer() failed: expiresInMin is not a positive number'
    );
  });

  it('expiresInMin can be Infinity', () => {
    const service = new CacheService();

    service.set(['test'], true, msToMin(50));
    setTimeout(() => {
      service.set(['test'], true, Infinity);
    }, 30);
    setTimeout(() => {
      expect(service.get(['test'])).toBeTruthy();
    }, 70);
  });

  it('should update value and timeout', () => {
    const service = new CacheService();
    service.set(['counter'], 1, msToMin(50));
    setTimeout(() => {
      service.set(['counter'], 2, msToMin(50));
    }, 30);
    setTimeout(() => {
      expect(service.get(['counter'])).toBe(2);
    }, 60);
  });

});
