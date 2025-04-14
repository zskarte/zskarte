import { Pipe, PipeTransform, inject } from '@angular/core';
import { SearchService } from './search.service';

@Pipe({
  name: 'replaceAllAddressTokens',
})
export class ReplaceAllAddressTokensPipe implements PipeTransform {
  private _search = inject(SearchService);
  transform(value: string | undefined, withMarkers = false) {
    return this._search.replaceAllAddressTokens(value, withMarkers);
  }
}
