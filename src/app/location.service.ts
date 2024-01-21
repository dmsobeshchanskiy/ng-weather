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
    const currentLocations = this.locationSignal();
    if (currentLocations.indexOf(zipcode) === -1) {
      this.locationSignal.update((locations) => [...locations, zipcode]);
    }
    this.lastAddedLocation.set(zipcode);
  }

  public removeLocation(zipcode : string): void {
    if (!zipcode || zipcode.length === 0) {
      return;
    }
    const currentLocations = this.locationSignal();
    let index = currentLocations.indexOf(zipcode);
    if (index !== -1) {
      this.lastAddedLocation.set(this.getLocationToActivate(index, currentLocations));
      this.locationSignal.update((locations) => {
        locations.splice(index, 1);
        return [...locations];
      });

    }
  }

  private getLocationToActivate(deletionIndex: number,
                                currentLocations: string[]): string {
    let locationToActivate = '';
    if (deletionIndex < currentLocations.length - 1) {
      locationToActivate = currentLocations[++deletionIndex];
    } else if (deletionIndex > 0) {
      locationToActivate = currentLocations[--deletionIndex];
    }                            
    return locationToActivate;
  }
}
