import { Component, ContentChildren, QueryList, TemplateRef } from '@angular/core';
import { TabDirective } from './tab.directive';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent {

  @ContentChildren(TabDirective)
  public set tabItems(value: QueryList<TabDirective>) {
    console.log('set tabs: ', value);
    this.tabs = value;
    if (this.tabs.length > 0) {
      this.onTabClicked(this.tabs.first, 0);
    }
  };

  public tabs: QueryList<TabDirective>;
  public templateToRender: TemplateRef<any>;
  public activeIndex = 0;

  constructor() { }

  public onTabClicked(tab: TabDirective, index: number): void {
    this.templateToRender = tab.templateRef;
    this.activeIndex = index;
  }

  public onCloseTabClick(tab: TabDirective, event: MouseEvent): void {
    event.stopImmediatePropagation();
    tab.closeTabClicked.emit(null);
  }

}
