import { Injectable } from '@angular/core';
import { CacheRecord } from './cache-record';
import { CurrentConditions } from '../models/current-conditions.type';
import { Forecast } from '../models/forecast.type';

@Injectable()
export class CacheService {

  private readonly weatherCacheTTLsec = 20; 
  private readonly forecastCacheTTLsec = 20; 
  private readonly weatherCacheKey: string = "weather-cached-records";
  private readonly forecastCacheKey: string = "forecast-cached-records";

  constructor() { }

  public saveWeatherToCache = (zipcode: string, condition: any): void => {
    this.saveToCache(this.weatherCacheKey, zipcode, condition);
  }

  public getWeatherCachedRecord = (zipcode: string): CacheRecord => {
    if (!zipcode || zipcode.length === 0) {
      return undefined;
    }
    const record = this.getCachedRecords(this.weatherCacheKey)?.find(r => r.zip === zipcode);
    return this.isCacheRecordValid(record, this.weatherCacheTTLsec) ? record : undefined;
  }

  public saveForecastToCache = (zipcode: string, condition: any): void => {
    this.saveToCache(this.forecastCacheKey, zipcode, condition);
  }

  public getForecastCachedRecord = (zipcode: string): CacheRecord => {
    if (!zipcode || zipcode.length === 0) {
      return undefined;
    }
    const record = this.getCachedRecords(this.forecastCacheKey)?.find(r => r.zip === zipcode);
    return this.isCacheRecordValid(record, this.forecastCacheTTLsec) ? record : undefined;
  }



  private isCacheRecordValid(record: CacheRecord, ttlsec: number): boolean {
    if (!record) {
      return undefined;
    }
    const cacheDate = new Date(record.lastUpdateDate);
    const currentDate = new Date();
    const valid = (currentDate.getTime() - cacheDate.getTime()) < (ttlsec * 1000);
    return valid;
  }

  private saveToCache(cacheKey: string, zipcode: string, data: CurrentConditions | Forecast): void {
    const cachedRecords = this.getCachedRecords(cacheKey);
    if (cachedRecords) {
      const existingCacheRecord = cachedRecords.find(r => r.zip === zipcode);
      if (existingCacheRecord) {
        existingCacheRecord.data = data;
        existingCacheRecord.lastUpdateDate = new Date();
      } else {
        cachedRecords.push({
            zip: zipcode,
            lastUpdateDate: new Date(),
            data: data
          }
        );
      }
      localStorage.setItem(cacheKey, JSON.stringify(cachedRecords));
    } else {
      const newRecord: CacheRecord = {
        zip: zipcode,
        lastUpdateDate: new Date(),
        data: data
      }
      localStorage.setItem(cacheKey, JSON.stringify([newRecord]));
    }
  }

  private getCachedRecords(key: string): CacheRecord[] {
    let cachedRecords: CacheRecord[];
    const cacheString = localStorage.getItem(key);
    if (cacheString) {
      cachedRecords = JSON.parse(cacheString);
    }
    return cachedRecords;
  }

}
