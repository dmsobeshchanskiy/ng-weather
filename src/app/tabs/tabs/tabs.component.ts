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
    this.tabs = value.toArray();
    if (this.tabs && this.tabs.length > 0) {
      this.ensureActiveTab();
      this.defineTemplateToRender();
    }
  };

  public tabs: TabDirective[];
  public templateToRender: TemplateRef<any>;

  constructor() { }

  public onTabClicked(tab: TabDirective): void {
    this.tabs.forEach(t => {
      t === tab ? t.active = true : t.active = false
    });
    this.defineTemplateToRender();
  }

  public onCloseTabClick(tab: TabDirective, event: MouseEvent): void {
    event.stopImmediatePropagation();
    tab.closeTabClicked.emit(null);
  }

  private ensureActiveTab(): void {
    if (!this.tabs.find(t => t.active)) {
      this.tabs[0].active = true;
    }
  }

  private defineTemplateToRender(): void {
    this.templateToRender = this.tabs.find(t => t.active).templateRef;
  }


}
