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
  private readonly defaultExpiresInMin: number = 5;
  private timerIDs: any[] = [];

  /**
   * Clears all stored data.
   */
  public clear(): void {
    // cancel all setTimeout
    this.timerIDs.forEach((timer) => {
      clearTimeout(timer);
    });
    this.timerIDs.length = 0;
    this.cache = {};
  }

  /**
   * Extracts a stored value.
   * @param path An array of strings. An empty array is not allowed.
   * @example get(['parent', 'child']) returns the value from the path: parent.child
   * @return A stored value or undefined if not found or storing time is expired.
   */
  public get(path: string[]): any | undefined {

    const ref = this.getRef(path);
    const key: string = path[path.length - 1];
    const record: CacheRecord | void = ref[key];
    if (record) {
      return record.data;
    }
    return undefined;
  }

  /**
   * Removes a stored value.
   * @param path An array of strings. An empty array is not allowed.
   * @example remove(['parent', 'child']) deletes the value on the path: parent.child
   */
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

  /**
   * Sets a value.
   * @param path An array of strings. An empty array is not allowed.
   * @param data Data to store.
   * @param expiresInMin A positive number as a timer for deleting data automatically.
   * @example set(['parent', 'child'], 'value') Stores the string on the path parent.child during 5 minutes by default.
   * @example set(['parent', 'child'], 'value', 10) Stores the string during 10 minutes.
   * @example set(['parent', 'child'], 'value', Infinity) Stores the string until window object refreshes.
   */
  public set(path: string[], data: any, expiresInMin?: number): void {

    const ref = this.getRef(path);
    const newKey = path[path.length - 1];
    const timer = this.getTimer(expiresInMin);

    if (isFinite(timer)) {
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

  /**
   * Returns a timeout value in milliseconds
   */
  private getTimer(expiresInMin?: number): number {

    if (typeof expiresInMin === 'undefined') {
      return this.defaultExpiresInMin * 60 * 1000;
    }
    if (!isFinite(expiresInMin)) {
      return Infinity;
    }
    if (!this.isPositiveNumber(expiresInMin)) {
      throw new Error('CacheService.getTimer() failed: expiresInMin is not a positive number');
    }
    return expiresInMin * 60 * 1000;
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

  private isPositiveNumber(arg: any): boolean {
    return !isNaN(parseFloat(arg)) && isFinite(arg) && arg > 0;
  }
}
