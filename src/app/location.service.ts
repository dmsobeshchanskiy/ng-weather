import { Injectable, Signal, effect, signal } from '@angular/core';
import { isZipcodeValid } from './tools';
import { Observable, Subject } from 'rxjs';

export const LOCATIONS : string = "locations";

@Injectable()
export class LocationService {

  public get $duplicatedLocationAdded(): Observable<string> {
    return this.duplicatedLocationAdded.asObservable();
  }

  public getLocationsSignal(): Signal<string[]> {
    return this.locationSignal.asReadonly();
  }
  private locationSignal = signal<string[]>([]);

  private duplicatedLocationAdded: Subject<string> = new Subject();

  constructor() {
    let locString = localStorage.getItem(LOCATIONS);
    if (locString) {
      const locations: string[] = JSON.parse(locString);
      this.locationSignal.set(locations);
    }
    effect(() => {
      localStorage.setItem(LOCATIONS, JSON.stringify(this.locationSignal()));
    });
  }

  public addLocation(zipcode : string): void {
    if (!isZipcodeValid(zipcode)) {
      return;
    }
    const currentLocations = this.locationSignal();
    if (currentLocations.indexOf(zipcode) === -1) {
      this.locationSignal.update((locations) => [...locations, zipcode]);
    } else {
      this.duplicatedLocationAdded.next(zipcode);
    }
  }

  public removeLocations(zipcodes : string[]): void {
    if (!zipcodes) {
      return;
    }
    this.locationSignal.update((locations) => {
      locations = locations.filter(l => !zipcodes.find(zc => zc === l));
      return locations;
    });
  }

}
