import { CurrentConditions } from '../models/current-conditions.type';
import { Forecast } from '../models/forecast.type';

export interface CacheRecord {
    zip: string;
    data: CurrentConditions | Forecast;
    lastUpdateDate: Date;
}
