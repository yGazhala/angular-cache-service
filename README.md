# CacheService for Angular apps

With this service, you can store received server data in one place instead of storing in many different services.

## Features

- Easy to clear all data by calling only one method. This is useful when you make a logout or switching between accounts.

- Preventing memory leaks. By default, stored value will be removed after 5 minutes. You can configure this in two ways: 
by passing `expiresInMin` argument each time you call `CacheService.set()` method, or by updating `CacheService.defaultExpiresInMin` property once.

- Simple, lightweight and tested.

## How to use  

1. Grab `src/app/cache.service.ts` and `src/app/cache.service.spec.ts` files.

2. Provide `CacheService` into your app as any other service as usual. See: `src/app/app.module.ts`.

3. Inject `CacheService` into your service that makes remote calls and use it like in this example.

```typescript
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { CacheService } from './src/app/cache.service.ts';

@Injectable()
class TestService {

  constructor(cache: CacheService, http: HttpService) {}

  // Tip: use the optional isRefresh flag to get data from 
  // the server, if you need to update cached value.
  public getData(id: string, isRefresh: boolean = false): Promise<any> {
    // try to get localy stored data
    if(!isRefresh) {
      const data = this.cache.get([id]);
      if(data) {
        return Promise.resolve(data);
      }
    }
    // make http call
    return this.http.get(`url/${id}`).toPromise()
      .then((res: Response) => {
        const data: any = res.json();
        // cache retrieved data
        this.cache.set([id], data);
        return data;
      })
      .catch((err: Response) => {
        // handle error as usual
      });
  }
}
```

## API

```typescript
/**
 * Clears all stored data.
 */
clear(): undefined;

/**
 * Extracts a stored value.
 * @param path An array of strings. An empty array is not allowed.
 * @example get(['parent', 'child']) returns the value from the path: parent.child
 * @return A stored value or undefined if not found or storing time is expired.
 */
get(path: string[]): any | undefined;


/**
 * Removes a stored value.
 * @param path An array of strings. An empty array is not allowed.
 * @example remove(['parent', 'child']) deletes the value on the path: parent.child
 */
remove(path: string[]): undefined

/**
 * Sets a value.
 * @param path An array of strings. An empty array is not allowed.
 * @param data Data to store.
 * @param expiresInMin A positive number as a timer for deleting data automatically.
 * @example set(['parent', 'child'], 'value') Stores the string on the path parent.child during 5 minutes by default.
 * @example set(['parent', 'child'], 'value', 10) Stores the string during 10 minutes.
 * @example set(['parent', 'child'], 'value', Infinity) Stores the string until window object refreshes.
 */
set(path: string[], data: any, expiresInMin?: number): undefined
```

## Running unit tests

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.2.1.

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).



