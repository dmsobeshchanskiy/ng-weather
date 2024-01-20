import {CurrentConditions} from './models/current-conditions.type';

export interface ConditionsAndZip {
    zip: string;
    data: CurrentConditions;
}
