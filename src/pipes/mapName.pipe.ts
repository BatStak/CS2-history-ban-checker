import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapName',
  standalone: true,
})
export class MapNamePipe implements PipeTransform {
  transform(value?: string): string {
    return value ? this._capitalizeFirstLetter(value.replace(/^(de_|cs_)(.*)$/, '$2')) : '';
  }

  private _capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
