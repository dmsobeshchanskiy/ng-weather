import { Injectable, Signal, effect, signal } from '@angular/core';

export const LOCATIONS : string = "locations";

@Injectable()
export class LocationService {

  public getLocationsSignal(): Signal<string[]> {
    return this.locationSignal.asReadonly();
  }

  public get lastAddedLocationSignal(): Signal<string> {
    return this.lastAddedLocation.asReadonly();
  }

  private locationSignal = signal<string[]>([]);
  private lastAddedLocation = signal<string>('');

  constructor() {
    let locString = localStorage.getItem(LOCATIONS);
    if (locString) {
      const locations: string[] = JSON.parse(locString);
      this.lastAddedLocation.set(locations.length > 0 ? locations[0] : '');
      this.locationSignal.set(locations);
    }
    effect(() => {
      localStorage.setItem(LOCATIONS, JSON.stringify(this.locationSignal()));
    });
  }

  public addLocation(zipcode : string): void {
    if (!zipcode || zipcode.length === 0) {
      return;
    }
    this.lastAddedLocation.set(zipcode);
    this.locationSignal.update((locations) => [...locations, zipcode]);
  }

  public removeLocation(zipcode : string): void {
    if (!zipcode || zipcode.length === 0) {
      return;
    }
    const currentLocations = this.locationSignal();
    let index = currentLocations.indexOf(zipcode);
    if (index !== -1) {
      this.lastAddedLocation.set(currentLocations.length > 0 ? currentLocations[0] : '');
      this.locationSignal.update((locations) => {
        locations.splice(index, 1);
        return [...locations];
      });

    }
  }
}
