export interface CompatibilityResponse {
  success: boolean;
  backendVersion: string;
  frontendVersion: string;
  isCompatible: boolean;
}
