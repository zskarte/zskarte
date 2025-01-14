import { FeatureLike } from 'ol/Feature';
export interface FillStyle {
    name: string;
    size?: number;
    angle?: number;
    spacing?: number;
}
export interface Sign {
    id?: number;
    type: string;
    src: string;
    kat?: string;
    size?: string;
    protected?: boolean;
    de?: string;
    fr?: string;
    en?: string;
    text?: string;
    label?: string;
    createdBy?: string;
    labelShow?: boolean;
    fontSize?: number;
    style?: string;
    fillStyle?: FillStyle;
    example?: string;
    fillOpacity?: number;
    color?: string;
    strokeWidth?: number;
    hideIcon?: boolean;
    iconOffset?: number;
    flipIcon?: boolean;
    topCoord?: number[];
    onlyForSessionId?: string;
    description?: string;
    arrow?: string;
    iconSize?: number;
    images?: string[];
    iconOpacity?: number;
    rotation?: number;
    filterValue?: string;
    origSrc?: string;
    createdAt?: Date;
    reportNumber?: number;
    affectedPersons?: number;
}
export declare function getFirstCoordinate(feature: FeatureLike): any;
export declare function getLastCoordinate(feature: FeatureLike): any;
export declare const signCategories: SignCategory[];
export interface SignCategory {
    name: string;
    color: string;
}
export declare function getColorForCategory(category: string): string;
export declare const signatureDefaultValues: SignatureDefaultValues;
export declare function defineDefaultValuesForSignature(signature: Sign): void;
export interface SignatureDefaultValues {
    style: string;
    size?: string;
    color: (kat?: string) => string;
    fillOpacity: number;
    strokeWidth: number;
    fontSize: number;
    fillStyle: FillStyle;
    fillStyleAngle: number;
    fillStyleSize: number;
    fillStyleSpacing: number;
    iconOffset: number;
    protected: boolean;
    labelShow: boolean;
    arrow: string;
    iconSize: number;
    iconOpacity: number;
    rotation: number;
    images: string[];
    flipIcon: boolean;
    hideIcon: boolean;
    affectedPersons: number | undefined;
}
