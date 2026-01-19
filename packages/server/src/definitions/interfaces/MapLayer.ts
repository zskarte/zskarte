import { MapLayerType } from '../constants';
import { Organization } from './collection-types';

export interface MapLayer {
  documentId: string;
  label: string;
  serverLayerName: string;
  type: MapLayerType;
  wms_source?: any;
  custom_source: string;
  media_source?: any; //Media;
  options: any;
  public: boolean;
  organization?: Organization
}