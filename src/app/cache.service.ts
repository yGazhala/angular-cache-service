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

  public get(pathArray: string[]): any {

    const ref = this.getRef(pathArray);
    const key: string = pathArray[pathArray.length - 1];
    const record: CacheRecord | void = ref[key];
    if (record) {
      return record.data;
    }
    return undefined;
  }

  public remove(pathArray: string[]): void {

    const ref = this.getRef(pathArray);
    const key: string = pathArray[pathArray.length - 1];
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

  public set(pathArray: string[], data: any, expiresInMin?: number | 'infinite'): void {

    const ref = this.getRef(pathArray);
    const newKey = pathArray[pathArray.length - 1];
    const expires = this.getExpiresOn(expiresInMin);

    if (expires !== 'infinite') {
      const timerId = setTimeout(() => {
        delete ref[newKey];
      }, expires);

      ref[newKey] = {
        timerId: timerId,
        data: data
      } as CacheRecord;

      this.timerIDs.push(timerId);
      return;
    }
    ref[newKey] = { data: data } as CacheRecord;
  }

  /**
   * Converts minutes to milliseconds
   */
  private getExpiresOn(expiresInMin: number | 'infinite'): number | 'infinite' {

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

  private getRef(pathArray: string[]): any {

    let path = this.cache;
    if (pathArray.length === 0) {
      throw new Error('CacheService.getPath() failed: pathArray can not be empty');
    }
    const length: number = pathArray.length - 1;
    for (let i = 0; i < length; i++) {
      const key = pathArray[i];
      if (!path[key]) {
        path[key] = {};
      }
      path = path[key];
    }
    return path;
  }

}
