import { HttpEvent, HttpEventType, HttpHandler,
        HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FORECAST_ACTION, WEATHER_ACTION } from '../constants';
import { CacheRecord } from '../cache/cache-record';
import { ICacheProvider, ICacheProviderToken } from '../cache/i-cache-provider';
import { CurrentConditions } from '../models/current-conditions.type';
import { Forecast } from '../models/forecast.type';

@Injectable()
export class CachingInterceptor implements HttpInterceptor {

  constructor(@Inject(ICacheProviderToken) private cacheService: ICacheProvider) {}
  
  public intercept(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.indexOf(WEATHER_ACTION) > 0) {
      return this.handleWeatherRequest(req, handler);
    } else if (req.url.indexOf(FORECAST_ACTION) > 0) {
      return this.handleForecastRequest(req, handler);
    } 
    return handler.handle(req);
  }

  private handleWeatherRequest(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    return this.handleCachedRequest(req, handler, 
                                    this.cacheService.getWeatherCachedRecord,
                                    this.cacheService.saveWeatherToCache);
  }

  private handleForecastRequest(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    return this.handleCachedRequest(req, handler, 
                                    this.cacheService.getForecastCachedRecord,
                                    this.cacheService.saveForecastToCache);
  }

  private handleCachedRequest(req: HttpRequest<any>, handler: HttpHandler,
                              getCachedRecord: (zipcode: string) => CacheRecord,
                              saveRecordToCache: (zipcode: string, data: CurrentConditions | Forecast) => void): Observable<HttpEvent<any>> {
    const zipcode = req.params.get('zip');
    const cachedRecord = getCachedRecord(zipcode)
    if (cachedRecord) {
      return of(new HttpResponse({ body: cachedRecord.data }));
    }
    return handler.handle(req).pipe(
      tap(event => {
        if (event.type === HttpEventType.Response) {
          saveRecordToCache(zipcode, event.body);
        }
      })
    )
  }
  
  
}
