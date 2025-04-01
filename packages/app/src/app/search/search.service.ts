import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { IResultSet, IZsMapSearchConfig, SearchFunction } from '../../../../types/state/interfaces';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private _searchConfigs: IZsMapSearchConfig[] = [];

  public addSearch(
    searchFunc: SearchFunction,
    searchName: string,
    maxResultCount: number | undefined = undefined,
    resultOrder: number | undefined = undefined,
  ) {
    const configs = this._searchConfigs;
    const config: IZsMapSearchConfig = {
      label: searchName,
      func: searchFunc,
      active: true,
      maxResultCount: maxResultCount ?? 50,
      resultOrder: resultOrder ?? 0,
    };
    configs.push(config);
    configs.sort((a, b) => a.resultOrder - b.resultOrder);
    this._searchConfigs = configs;
  }

  public removeSearch(searchFunc: SearchFunction) {
    this._searchConfigs = this._searchConfigs.filter((conf) => conf.func !== searchFunc);
  }

  createSearchInstance(): {
    searchResults$: Observable<IResultSet[] | null>;
    updateSearchTerm: (searchText: string) => void;
  } {
    const searchSubject = new BehaviorSubject<string>('');
    let abortController: AbortController | undefined;

    const searchResults$ = searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(async (searchText) => {
        if (abortController) {
          abortController.abort();
        }
        abortController = new AbortController();

        return this.processConfigs(searchText, abortController);
      }),
    );

    return {
      searchResults$,
      updateSearchTerm: (searchText: string) => {
        searchSubject.next(searchText);
      },
    };
  }

  private async processConfigs(searchText: string, abortController: AbortController): Promise<IResultSet[] | null> {
    if (searchText.length <= 1) {
      return [];
    }
    const resultSets: IResultSet[] = [];

    for (const config of this._searchConfigs) {
      if (!config.active) continue;

      if (abortController.signal.aborted) {
        return null;
      }

      try {
        const results = await config.func(searchText, config.maxResultCount);
        if (results.length > 0) {
          resultSets.push({ config, results, collapsed: 'peek' });
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return [];
        }
        console.error('Error on handle search config:', error);
      }
    }

    return resultSets;
  }
}
