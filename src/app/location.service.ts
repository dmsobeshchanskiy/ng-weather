import { Injectable, Signal, effect, signal } from '@angular/core';

export const LOCATIONS : string = "locations";

@Injectable()
export class LocationService {

  public getLocationsSignal(): Signal<string[]> {
    return this.locationSignal.asReadonly();
  }

  private locationSignal = signal<string[]>([]);

  constructor() {
    let locString = localStorage.getItem(LOCATIONS);
    if (locString) {
      this.locationSignal.set(JSON.parse(locString));
    }
    effect(() => {
      localStorage.setItem(LOCATIONS, JSON.stringify(this.locationSignal()));
    });
  }

  public addLocation(zipcode : string): void {
    if (!zipcode || zipcode.length === 0) {
      return;
    }
    this.locationSignal.update((locations) => [...locations, zipcode]);
  }

  public removeLocation(zipcode : string): void {
    if (!zipcode || zipcode.length === 0) {
      return;
    }
    const currentLocations = this.locationSignal();
    let index = currentLocations.indexOf(zipcode);
    if (index !== -1){
      this.locationSignal.update((locations) => {
        locations.splice(index, 1);
        return [...locations];
      });

    }
  }
}
