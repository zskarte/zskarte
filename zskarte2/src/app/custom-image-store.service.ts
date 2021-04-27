/*
 * Copyright © 2018-2020 ZSO Bern Plus / PCi Fribourg
 *
 * This file is part of Zivilschutzkarte 2.
 *
 * Zivilschutzkarte 2 is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * Zivilschutzkarte 2 is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along with
 * Zivilschutzkarte 2.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 */

import {Injectable} from '@angular/core';
import {Sign} from "./entity/sign";
import {Md5} from "ts-md5";
import {NgxIndexedDBService} from "ngx-indexed-db";
import {SharedStateService} from "./shared-state.service";

@Injectable({
    providedIn: 'root'
})
export class CustomImageStoreService {

    private static inMemoryCache = {}

    public static STORE_IMAGES = "images";

    constructor(private dbService: NgxIndexedDBService, private sharedState: SharedStateService) {
    }

    public getAllEntriesForCurrentSession() {
        return Object.values(CustomImageStoreService.inMemoryCache).filter(i => this.isValidForCurrentSession(i));
    }

    public importImages(images: any[]): Promise<any> {
        return new Promise<any>(resolve => {
            if(!images){
                resolve(null);
            }
            let promises = [];
            images.forEach(i => {
                let hash = i.sign.src;
                if (!CustomImageStoreService.isCustomImage(hash)) {
                    CustomImageStoreService.inMemoryCache[hash] = i;
                    promises.push(this.dbService.update(CustomImageStoreService.STORE_IMAGES, i, hash));
                }
            })
            if(promises.length>0) {
                Promise.all(promises).then(() => resolve(null));
            }
            else {
                resolve(null);
            }
        });
    }

    public static getAllSigns(): Sign[] {
        // @ts-ignore
        return Object.values(CustomImageStoreService.inMemoryCache).map(i => <Sign>i.sign);
    }

    public static isCustomImage(hash: string) {
        return hash in this.inMemoryCache;
    }

    private isValidForCurrentSession(image) {
        return !image.sign.onlyForSessionId || image.sign.onlyForSessionId === this.sharedState.getCurrentSession().uuid;
    }


    public loadSignsInMemory(): Promise<any> {
        return new Promise<any>(resolve => {
            this.dbService.getAll(CustomImageStoreService.STORE_IMAGES).toPromise().then(images => {
                CustomImageStoreService.inMemoryCache = {};
                images.forEach(image => {
                    if (this.isValidForCurrentSession(image)) {
                        // @ts-ignore
                        CustomImageStoreService.inMemoryCache[image.sign.src] = image;
                    }
                });
                resolve(null);
            });
        });
    }

    public deleteSign(hash: string): Promise<any> {
        delete CustomImageStoreService.inMemoryCache[hash];
        return this.dbService.delete(CustomImageStoreService.STORE_IMAGES, hash).toPromise();
    }

    public saveSign(sign: Sign, payload, originalPayload, nativeDimensions: number[]): Promise<any> {
        sign.src = Md5.hashStr(payload).toString();
        let newSign = {
            sign: sign,
            image: payload,
            originalImage: originalPayload,
            nativeDimensions: nativeDimensions
        }
        return new Promise<any>(resolve => {
            this.dbService.update(CustomImageStoreService.STORE_IMAGES, newSign, sign.src).toPromise().then(() => {
                CustomImageStoreService.inMemoryCache[sign.src] = newSign;
                resolve(sign);
            });
        });
    }

    public static getSign(hash: string): Sign {
        let fromMemory = CustomImageStoreService.inMemoryCache[hash];
        if (fromMemory) {
            return fromMemory.sign;
        }
        return null;
    }

    public static getDimensions(hash: string): number[] {
        let fromMemory = CustomImageStoreService.inMemoryCache[hash];
        if (fromMemory) {
            return fromMemory.nativeDimensions;
        }
        return null;
    }

    public static getImageDataUrl(hash: string) {
        let fromMemory = CustomImageStoreService.inMemoryCache[hash];
        if (fromMemory) {
            return fromMemory.image;
        }
        return null;
    }

    public static getOriginalImageDataUrl(hash: string) {
        let fromMemory = CustomImageStoreService.inMemoryCache[hash];
        if (fromMemory) {
            return fromMemory.originalImage;
        }
        return null;
    }


}
