export interface SmartDrySensorConfig {
    name: string;
    id: string;
    serviceType: string;
}

export interface SmartDryApiResponse {
    loadStart: bigint;
}
