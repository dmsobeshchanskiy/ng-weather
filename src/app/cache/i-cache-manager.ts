import { InjectionToken } from '@angular/core';

export interface ICacheManager {
    getWeatherCacheSec(): number;
    getForecastCacheSec(): number;
    applyCacheTimings(weatherSec: number, forecastSec: number): void;
    clearWeatherCache(): void;
    clearForecastCache(): void;
}

export const ICacheManagerToken = new InjectionToken<ICacheManager>('ICacheManager');
