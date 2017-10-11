import { Injectable } from '@angular/core';

// This interface is used only inside this service
interface CacheRecord {
  // stored data
  data: any;
  // the object returned by setTimeout()
  timerId?: any;
}

@Injectable()
export class CacheService {

  private cache: { [key: string]: any } = {};
  private readonly defaultExpiresInMin = 5;
  private timerIDs: any[] = [];

  public clear(): void {
    // cancel all setTimeout
    this.timerIDs.forEach((timer) => {
      clearTimeout(timer);
    });
    this.timerIDs.length = 0;
    this.cache = {};
  }

  public get(path: string[]): any {

    const ref = this.getRef(path);
    const key: string = path[path.length - 1];
    const record: CacheRecord | void = ref[key];
    if (record) {
      return record.data;
    }
    return undefined;
  }

  public remove(path: string[]): void {

    const ref = this.getRef(path);
    const key: string = path[path.length - 1];
    const record: CacheRecord = ref[key];
    if (!record) {
      return;
    }
    // cancel setTimeout if storage time is not infinite
    if (record.timerId) {
      clearTimeout(record.timerId);
    }
    delete ref[key];
  }

  public set(path: string[], data: any, expiresInMin?: number | 'infinite'): void {

    const ref = this.getRef(path);
    const newKey = path[path.length - 1];
    const timer = this.getTimer(expiresInMin);

    if (timer !== 'infinite') {
      const timerId = setTimeout(() => {
        delete ref[newKey];
      }, timer);

      ref[newKey] = {
        timerId: timerId,
        data: data
      } as CacheRecord;

      this.timerIDs.push(timerId);
      return;
    }
    ref[newKey] = { data: data } as CacheRecord;
  }

  // Returns timeout value in milliseconds
  private getTimer(expiresInMin?: number | 'infinite'): number | 'infinite' {

    if (expiresInMin === 'infinite') {
      return expiresInMin;
    }
    let ms: number;
    if (!expiresInMin || typeof expiresInMin !== 'number') {
      ms = this.defaultExpiresInMin * 60 * 1000;
    } else {
      ms = expiresInMin * 60 * 1000;
    }
    return ms;
  }

  private getRef(path: string[]): any {

    let ref = this.cache;
    if (path.length === 0) {
      throw new Error('CacheService.getPath() failed: pathArray can not be empty');
    }
    const length: number = path.length - 1;
    for (let i = 0; i < length; i++) {
      const key = path[i];
      if (!ref[key]) {
        ref[key] = {};
      }
      ref = ref[key];
    }
    return ref;
  }

}
