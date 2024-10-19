import { Pipe, PipeTransform } from '@angular/core';
import {
  ancientBase64,
  anubisBase64,
  assemblyBase64,
  cacheBase64,
  cbblBase64,
  dust2Base64,
  infernoBase64,
  italyBase64,
  mementoBase64,
  millsBase64,
  mirageBase64,
  nukeBase64,
  officeBase64,
  overpassBase64,
  theraBase64,
  trainBase64,
  vertigoBase64,
} from '../app/components/ban-statistics/maps.base64';

@Pipe({
  name: 'mapImage',
  standalone: true,
})
export class MapImagePipe implements PipeTransform {
  transform(value?: string): string {
    return this._getMapImage(value);
  }

  private _getMapImage(map?: string) {
    switch (map) {
      case 'Ancient':
        return ancientBase64;
      case 'Anubis':
        return anubisBase64;
      case 'Dust II':
        return dust2Base64;
      case 'Inferno':
        return infernoBase64;
      case 'Mirage':
        return mirageBase64;
      case 'Nuke':
        return nukeBase64;
      case 'Overpass':
        return overpassBase64;
      case 'Vertigo':
        return vertigoBase64;
      case 'Office':
        return officeBase64;
      case 'Thera':
        return theraBase64;
      case 'Mills':
        return millsBase64;
      case 'Memento':
        return mementoBase64;
      case 'Assembly':
        return assemblyBase64;
      case 'Italy':
        return italyBase64;
      case 'Cache':
        return cacheBase64;
      case 'Train':
        return trainBase64;
      case 'Cobblestone':
        return cbblBase64;
    }

    return '';
  }
}
