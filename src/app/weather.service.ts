import {Injectable, Signal, signal} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import {HttpClient} from '@angular/common/http';
import {CurrentConditions} from './models/current-conditions.type';
import {ConditionsAndZip} from './models/conditions-and-zip.type';
import {Forecast} from './models/forecast.type';
import { LocationService } from './location.service';
import { API_URL, APPID, FORECAST_ACTION, ICON_URL, WEATHER_ACTION } from './constants';
import { isZipcodeValid } from './tools';


@Injectable()
export class WeatherService {

  static readonly WEATHERURL = API_URL + WEATHER_ACTION;
  static readonly FORECASTURL = API_URL + FORECAST_ACTION;

  public get currentConditionsSignal(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }

  public get currentlyActiveConditionSignal(): Signal<string> {
    return this.currentlyActiveCondition.asReadonly();
  }

  private currentConditions = signal<ConditionsAndZip[]>([]);
  private currentlyActiveCondition = signal<string>('')


  constructor(private http: HttpClient, 
              private locationService: LocationService) {
    toObservable(this.locationService.getLocationsSignal()).pipe(
      switchMap(zipcodes => {
        const zipsToCheck = this.getNotCheckedLocations(zipcodes);
        if (zipsToCheck.length) {
          return forkJoin(zipsToCheck.map(zipcode => {
            return this.callApiForWeather(zipcode)
          }))
        } else {
          return of([]);
        }
      }),
      catchError(e => of([]))
    ).subscribe((newConditions: ConditionsAndZip[]) => {
      const newValidConditions = newConditions.filter(c => c.data);
      const notValidConditions = newConditions.filter(c => !c.data);
      if (newValidConditions.length) {
        this.currentConditions.update((conditions) => {
          return [...conditions, ...newValidConditions];
        });
        this.activateConditionForLocation(newValidConditions[0].zip);
      }
      if (notValidConditions.length) {
        alert(`Fail get weather for next condition(s): 
              ${notValidConditions.map(l => l.zip)}`);
      }
    });

    // another method
    toObservable(this.locationService.duplicatedLocationAddedSignal)
      .subscribe(zipcode => {
        this.activateConditionForLocation(zipcode);
      });
  }

  private getNotCheckedLocations(zipcodes: string[]): string[] {
    if (!zipcodes) {
      return [];
    }
    const checkedZipCodes = this.currentConditions().map(c => c.zip);
    const zipsToCheck = zipcodes.filter(zip => !checkedZipCodes.find(c => c === zip));
    return zipsToCheck;
  }

  public activateConditionForLocation(zipcode: string): void {
    if (!isZipcodeValid(zipcode) ||
        !this.currentConditions().find(c => c.zip === zipcode)) {
          // not valid zipcode or no suitable condition to activate
      return;
    }
    // update information for activated condition ...
    this.callApiForWeather(zipcode).subscribe((condition: ConditionsAndZip) => {
      this.currentConditions.update((conditions) => {
        const condToUpdate = conditions.find(c => c.zip === zipcode);
        condToUpdate.data = condition.data;
        return [...conditions];
      });
      // ... and actually activate it
      this.currentlyActiveCondition.set(zipcode);
    });
  }

  public removeConditionForLocation(zipcode: string): void {
    if (!isZipcodeValid(zipcode)) {
      return;
    }
    const conditionToActivate = this.getLocationToActivateBeforeDeletion(zipcode);
    this.currentConditions.update((conditions) => {
      conditions = conditions.filter(c => c.zip !== zipcode);
      return conditions;
    });
    this.activateConditionForLocation(conditionToActivate);
    this.locationService.removeLocation(zipcode);
  }

  public addCurrentConditions(zipcode: string): void {
    if (!isZipcodeValid(zipcode)) {
      return;
    }
    if (this.currentConditions().find(c => c.zip === zipcode) &&
        this.currentlyActiveCondition() !== zipcode) {
      this.activateConditionForLocation(zipcode);
    } else {
      this.callApiForWeather(zipcode).subscribe((condition: ConditionsAndZip) => {
        if (condition.data) {
          this.currentConditions.update((conditions) => {
            return [...conditions, condition];
          });
          this.currentlyActiveCondition.set(zipcode);
        } else {
          alert(`Fail to load weather for zip: ${zipcode}`);
        }
      });
    }
  }

  public getForecast(zipcode: string): Observable<Forecast> {
    if (!isZipcodeValid(zipcode)) {
      return;
    }
    const params = { 
      zip: zipcode + ',us',
      units: 'imperial',
      cnt: 5,
      APPID: APPID
    }
    return this.http.get<Forecast>(WeatherService.FORECASTURL, { params: params });
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

  private callApiForWeather(zipcode: string): Observable<ConditionsAndZip> {
    const params = {
      zip: zipcode + ',us',
      units: 'imperial',
      APPID: APPID
    }
    return this.http.get<CurrentConditions>(WeatherService.WEATHERURL, { params: params })
          .pipe(
            map((conditions: CurrentConditions) => {
              return { zip: zipcode, data: conditions }
            }),
            catchError(e => {
              console.error('Error while getting condition: ', e);
              return of({ zip: zipcode, data: undefined });
            })
          )
  }

  private getLocationToActivateBeforeDeletion(zipcode: string): string {
    const currentLocations = this.currentConditions();
    const deletionIndex = currentLocations.findIndex(c => c.zip === zipcode);
    let locationToActivate = '';
    if (deletionIndex < currentLocations.length - 1) {
      locationToActivate = currentLocations[(deletionIndex + 1)].zip;
    } else if (deletionIndex > 0) {
      locationToActivate = currentLocations[(deletionIndex - 1)].zip;
    }                            
    return locationToActivate;
  }

}


