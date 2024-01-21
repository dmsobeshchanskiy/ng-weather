import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { ConditionsAndZip } from '../models/conditions-and-zip.type';
import { WeatherService } from '../weather.service';

@Component({
  selector: 'app-weather-card',
  templateUrl: './weather-card.component.html',
  styleUrls: ['./weather-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeatherCardComponent {

  @Input() public location: ConditionsAndZip;
  
  public weatherService = inject(WeatherService);
  
  constructor() { }

}
