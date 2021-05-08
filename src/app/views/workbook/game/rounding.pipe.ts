import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rounding'
})
export class RoundingPipe implements PipeTransform {
  transform(value: number): number | '-' {
    if (!value) {
      return value === 0
        ? 0
        : '-';
    }

    return Math.round(value * 1000) / 10;
  }
}
