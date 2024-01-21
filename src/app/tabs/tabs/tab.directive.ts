import { Directive, EventEmitter, Input, Output, TemplateRef } from '@angular/core';


@Directive({
  selector: '[appTab]'
})
export class TabDirective {

  @Input('appTab') public caption: string = '';
  @Output() public closeTabClicked: EventEmitter<void> = new EventEmitter();

  constructor(public templateRef: TemplateRef<any>) {
  }

}
