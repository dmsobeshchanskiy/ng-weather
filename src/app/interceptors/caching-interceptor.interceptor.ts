import { HttpEvent, HttpEventType, HttpHandler,
        HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../cache/cache.service';
import { FORECAST_ACTION, WEATHER_ACTION } from '../constants';
import { CacheRecord } from '../cache/cache-record';

@Injectable()
export class CachingInterceptor implements HttpInterceptor {

  constructor(private cacheService: CacheService) {}
  
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
                              saveRecordToCache: (zipcode: string, record: CacheRecord) => void): Observable<HttpEvent<any>> {
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
