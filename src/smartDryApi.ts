import axios from 'axios';
import { Logger } from 'homebridge';
import * as querystring from 'querystring';
import { SmartDryConstants } from './smartDryConstants';
import { SmartDryApiResponse } from './smartDryTypes';

export class SmartDryApi {

  public constructor(public log: Logger) {}

  public getDeviceState(id: string) : Promise<SmartDryApiResponse> {

    return new Promise((resolve, reject) => {
      axios.get(`${SmartDryConstants.API_ENDPOINT}?${this.buildQueryParam(id)}`)
        .then((response) => {
          resolve(response.data[0]);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  private buildQueryParam(id:string): string {
    return querystring.stringify({ Id: id, Write: 0, SQLString: 'select * from DryerballList' });
  }
}
