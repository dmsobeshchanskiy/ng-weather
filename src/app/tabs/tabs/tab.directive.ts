import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appTab]'
})
export class TabDirective {

  @Input('appTab') public caption: string = '';
  @Input() public tabId: string;

  constructor(public templateRef: TemplateRef<any>) {}

}
