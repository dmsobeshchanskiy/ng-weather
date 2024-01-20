import { InjectionToken } from '@angular/core';
import { CurrentConditions } from '../models/current-conditions.type';
import { Forecast } from '../models/forecast.type';
import { CacheRecord } from './cache-record';

export interface ICacheProvider {
    saveWeatherToCache(zipcode: string, condition: CurrentConditions): void;
    getWeatherCachedRecord(zipcode: string): CacheRecord;
    saveForecastToCache(zipcode: string, forecast: Forecast): void;
    getForecastCachedRecord(zipcode: string): CacheRecord;
}

export const ICacheProviderToken = new InjectionToken<ICacheProvider>('ICacheProvider');