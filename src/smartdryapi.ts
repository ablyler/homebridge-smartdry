import * as querystring from 'querystring';
import axios from 'axios';
import { Logger } from 'homebridge';

interface SmartDryApiResponse {
    loadStart: bigint;
}

export class SmartDryApi {
    public id: string;
    private log: Logger;
    apiEndpointUrl: string;

    public constructor(apiEndpointUrl: string, id: string, log: Logger) {
      this.apiEndpointUrl = apiEndpointUrl;
      this.id = id;
      this.log = log;
    }

    public getDeviceState() : Promise<SmartDryApiResponse> {
      return new Promise((resolve, reject) => {
        axios.get(this.apiEndpointUrl + '?' + querystring.stringify({ Id: this.id, Write: 0, SQLString: 'select * from DryerballList' }))
          .then((response) => {
            resolve(response.data[0]);
          })
          .catch((error) => {
            reject(error);
          });
      });
    }
}