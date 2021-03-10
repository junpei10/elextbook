import { NgModule } from '@angular/core';
import { MlPortalOutletDirective } from './outlet.directive';

@NgModule({
  declarations: [MlPortalOutletDirective],
  exports: [MlPortalOutletDirective],
})
export class MlPortalModule { }
