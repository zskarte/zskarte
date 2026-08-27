import { inject, Injectable } from '@angular/core';
import { IZsChangeset, IZsMapOperation, IZsSigningKey } from '@zskarte/types';
import { ApiService } from '../api/api.service';
import { sortKeysDeep } from '@zskarte/common';

export interface IZsSignKeyConfig {
  publicKey: CryptoKey;
  algorithm: AlgorithmIdentifier | RsaPssParams | EcdsaParams;
}

@Injectable({
  providedIn: 'root',
})
export class SigningService {
  private _api = inject(ApiService);
  private encoder = new TextEncoder();
  private publicKeys: Record<string, IZsSignKeyConfig> = {};

  private base64ToBytes(base64: string) {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  }

  public async loadAllKeys(operation: IZsMapOperation) {
    if (!operation.signingKeyIds){
        return;
    }
    for (const signKeyId of operation.signingKeyIds) {
      let keyConfig: IZsSignKeyConfig | null = this.publicKeys[signKeyId];
      if (!keyConfig) {
        keyConfig = await this.loadKey(signKeyId, undefined);
        if (keyConfig) {
          this.publicKeys[signKeyId] = keyConfig;
        } else {
          console.error(`publicKey '${signKeyId}' could not be loaded from server.`);
        }
      }
    }
  }

  private async loadKey(keyId: string, serverId?: string): Promise<IZsSignKeyConfig | null> {
    const { error, result } = await this._api.get<IZsSigningKey>(`/api/signing-key/bykey/${keyId}`);
    if (error || !result) {
      console.error(`Load signing Key '${keyId}' failed: ${JSON.stringify(error) || 'result empty'}.`);
      return null;
    }

    if (serverId && result.serverId !== serverId) {
      console.error(`Expect serverId = '${serverId}' for key '${keyId}' but it is '${result.serverId}'.`);
      return null;
    }
    if (!result.publicKey || !result.keyType) {
      console.error(`Key '${keyId}' missing publicKey or keyType.`);
      return null;
    }

    let algorithm: AlgorithmIdentifier | RsaPssParams | EcdsaParams;
    if (result.keyType === 'rsa') {
      algorithm = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };
    } else {
      algorithm = { name: 'Ed25519' };
    }
    const publicKey = await crypto.subtle.importKey('spki', this.base64ToBytes(result.publicKey), algorithm, false, [
      'verify',
    ]);
    return { publicKey, algorithm };
  }

  private async verifyData(data: object, signatureB64: string, keyConfig: IZsSignKeyConfig) {
    const dataBytes = this.encoder.encode(JSON.stringify(sortKeysDeep(data)));
    const sigBytes = this.base64ToBytes(signatureB64);

    const { publicKey, algorithm } = keyConfig;
    return crypto.subtle.verify(algorithm, publicKey, sigBytes, dataBytes);
  }

  public async verifyChangesetSign(changeset: IZsChangeset, operation: IZsMapOperation) {
    let signValid = false;
    const tryLoadingKeys = new Set<string>();
    if (changeset.signKeyId && changeset.serverId && operation.changesetSigns?.[changeset.id]) {
      let keyConfig: IZsSignKeyConfig | null = this.publicKeys[changeset.signKeyId];
      if (!keyConfig) {
        tryLoadingKeys.add(changeset.signKeyId);
        if (tryLoadingKeys.has(changeset.signKeyId)) {
          keyConfig = await this.loadKey(changeset.signKeyId, changeset.serverId);
          if (keyConfig) {
            this.publicKeys[changeset.signKeyId] = keyConfig;
          }
        } else {
          return false;
        }
      }
      if (keyConfig) {
        signValid = await this.verifyData(changeset, operation.changesetSigns[changeset.id], keyConfig);
        if (!signValid) {
          console.error(`changeset with id ${changeset.id} have invalid signature`, changeset, keyConfig);
        }
      } else {
        console.error(
          `publicKey '${changeset.signKeyId}' for verify changeset with id '${changeset.id}' could not be loaded from server.`,
        );
      }
    }
    return signValid;
  }
}
