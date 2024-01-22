import { Injectable, Signal, effect, signal } from '@angular/core';
import { isZipcodeValid } from './tools';

export const LOCATIONS : string = "locations";

@Injectable()
export class LocationService {

  public getLocationsSignal(): Signal<string[]> {
    return this.locationSignal.asReadonly();
  }

  public get duplicatedLocationAddedSignal(): Signal<string> {
    return this.duplicatedLocationSignal.asReadonly();
  }

  private locationSignal = signal<string[]>([]);
  private duplicatedLocationSignal = signal<string>('');

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
      this.duplicatedLocationSignal.set(zipcode);
    }
  }

  public removeLocation(zipcode : string): void {
    if (!isZipcodeValid(zipcode)) {
      return;
    }
    this.locationSignal.update((locations) => {
      locations = locations.filter(l => l !== zipcode);
      return locations;
    });
  }

}
