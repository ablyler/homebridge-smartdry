export class SmartDryConstants {

    // Numbers
    static readonly INTERVAL_RESTART_MS = 1000; // 1 second
    static readonly INTERVAL_RUNNING_MS = 60000; // 60 seconds
    static readonly INTERVAL_STOPPED_MS = 300000; // 5 minutes

    // Strings
    static readonly API_ENDPOINT = 'https://qn54iu63v9.execute-api.us-east-1.amazonaws.com/prod/RDSQuery';
    static readonly SERVICE_TYPE_CONTACT_SENSOR = 'contactSensor';
    static readonly SERVICE_TYPE_SWITCH = 'switch';
    static readonly INFORMATION_MANUFACTURER = 'Smart Dry';
    static readonly INFORMATION_MODEL = 'v1';

    // Defaults
    static readonly DEFAULT_BINARY_STATE = false;
}
