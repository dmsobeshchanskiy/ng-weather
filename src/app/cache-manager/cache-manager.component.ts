import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ICacheManager, ICacheManagerToken } from '../cache/i-cache-manager';

@Component({
  selector: 'app-cache-manager',
  templateUrl: './cache-manager.component.html',
  styleUrls: ['./cache-manager.component.css']
})
export class CacheManagerComponent {

  public cacheSetupForm: FormGroup;
  
  constructor(@Inject(ICacheManagerToken) private cache: ICacheManager) {
    this.cacheSetupForm = new FormGroup({
      weatherCacheTime: new FormControl(this.cache.getWeatherCacheSec(), [Validators.required, Validators.min(0)]),
      forecastCacheTime: new FormControl(this.cache.getForecastCacheSec(), [Validators.required, Validators.min(0)])
    });
  }

  public applyCacheSetup(): void {
    this.cache.applyCacheTimings(this.cacheSetupForm.value.weatherCacheTime,
                                this.cacheSetupForm.value.forecastCacheTime);
    alert('Timings applied.');
  }

  public clearWeatherCache(): void {
    if (confirm('Delete cached data for current weather conditions?')) {
      this.cache.clearWeatherCache();
      alert('Deleted.');
    }
  }

  public clearForecastCache(): void {
    if (confirm('Delete cached data for weather forecasts?')) {
      this.cache.clearForecastCache();
      alert('Deleted.');
    }
  }

}
