import {Injectable, Signal, signal} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {Observable, forkJoin, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import {HttpClient} from '@angular/common/http';
import {CurrentConditions} from './models/current-conditions.type';
import {ConditionsAndZip} from './models/conditions-and-zip.type';
import {Forecast} from './models/forecast.type';
import { LocationService } from './location.service';
import { API_URL, APPID, FORECAST_ACTION, ICON_URL, WEATHER_ACTION } from './constants';


@Injectable()
export class WeatherService {

  static readonly WEATHERURL = API_URL + WEATHER_ACTION;
  static readonly FORECASTURL = API_URL + FORECAST_ACTION;

  private currentConditions = signal<ConditionsAndZip[]>([]);
  private zipCodes: string[];

  constructor(private http: HttpClient, 
              private locationService: LocationService) {
    toObservable(this.locationService.getLocationsSignal()).pipe(
      tap(zipCodes => this.zipCodes = zipCodes),
      switchMap(zipCodes => {
        if (zipCodes.length) {
          return forkJoin(zipCodes.map(zipcode => {
            return this.http.get<CurrentConditions>(WeatherService.WEATHERURL, { params: this.getWeatherParams(zipcode)})
                  .pipe(catchError(e => {
                    console.error('Error while getting condition: ', e);
                    return of(undefined);
                  }))
          }))
        } else {
          return of([]);
        }
      }),
      catchError(e => of([]))
    ).subscribe(conditions => this.applyConditions(conditions));
  }

  addCurrentConditions(zipcode: string): void {
    // Here we make a request to get the current conditions data from the API. Note the use of backticks and an expression to insert the zipcode
    this.http.get<CurrentConditions>(WeatherService.WEATHERURL, { params: this.getWeatherParams(zipcode)})
      .subscribe(data => this.currentConditions.update(conditions => [...conditions, {zip: zipcode, data}]));
  }

  removeCurrentConditions(zipcode: string) {
    this.currentConditions.update(conditions => {
      for (let i in conditions) {
        if (conditions[i].zip == zipcode)
          conditions.splice(+i, 1);
      }
      return conditions;
    })
  }

  getCurrentConditions(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }

  getForecast(zipcode: string): Observable<Forecast> {
    // Here we make a request to get the forecast data from the API. Note the use of backticks and an expression to insert the zipcode
    return this.http.get<Forecast>(WeatherService.FORECASTURL, { params: this.getForecastParams(zipcode) });

  }

  getWeatherIcon(id): string {
    if (id >= 200 && id <= 232)
      return ICON_URL + "art_storm.png";
    else if (id >= 501 && id <= 511)
      return ICON_URL + "art_rain.png";
    else if (id === 500 || (id >= 520 && id <= 531))
      return ICON_URL + "art_light_rain.png";
    else if (id >= 600 && id <= 622)
      return ICON_URL + "art_snow.png";
    else if (id >= 801 && id <= 804)
      return ICON_URL + "art_clouds.png";
    else if (id === 741 || id === 761)
      return ICON_URL + "art_fog.png";
    else
      return ICON_URL + "art_clear.png";
  }

  private applyConditions(conditions: CurrentConditions[]): void {
    const zipConditions = [];
    const notFoundLocations = [];
    for (let i = 0; i < this.zipCodes.length; i++) {
      if (conditions[i]) {
        zipConditions.push({zip: this.zipCodes[i], data: conditions[i]})
      } else {
        notFoundLocations.push(this.zipCodes[i]);
      }
    }
    this.currentConditions.set(zipConditions);
    if (notFoundLocations.length) {
      this.locationService.removeNotFoundLocations(notFoundLocations);
    }
  }

  private getWeatherParams(zipcode: string): { } {
    return { 
      zip: zipcode + ',us',
      units: 'imperial',
      APPID: APPID
    }
  }

  private getForecastParams(zipcode: string): { } {
    return { 
      zip: zipcode + ',us',
      units: 'imperial',
      cnt: 5,
      APPID: APPID
    }
  }

}


