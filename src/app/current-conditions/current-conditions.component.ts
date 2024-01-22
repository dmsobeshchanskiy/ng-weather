import {Component, inject, Signal} from '@angular/core';
import {WeatherService} from "../weather.service";
import {Router} from "@angular/router";
import {ConditionsAndZip} from '../models/conditions-and-zip.type';

@Component({
  selector: 'app-current-conditions',
  templateUrl: './current-conditions.component.html',
  styleUrls: ['./current-conditions.component.css']
})
export class CurrentConditionsComponent {

  protected weatherService = inject(WeatherService);
  protected currentConditionsByZip: Signal<ConditionsAndZip[]> = this.weatherService.currentConditionsSignal;

  private router = inject(Router);

  showForecast(zipcode : string){
    this.router.navigate(['/forecast', zipcode])
  }
}
