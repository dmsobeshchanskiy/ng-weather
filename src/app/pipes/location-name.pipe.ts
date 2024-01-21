import { Pipe, PipeTransform } from '@angular/core';
import { ConditionsAndZip } from '../models/conditions-and-zip.type';

@Pipe({
  name: 'locationName'
})
export class LocationNamePipe implements PipeTransform {

  public transform(location: ConditionsAndZip): string {
    return `${location.data.name} (${location.zip})`
  }

}
