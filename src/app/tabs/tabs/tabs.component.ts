import { Component, ContentChildren, EventEmitter,
        Input, Output, QueryList, TemplateRef } from '@angular/core';
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
      this.defineTemplateToRender();
    } else {
      this.templateToRender = undefined;
    }
  };

  @Input()
  public set activeTabId(value: string) {
    if (this.activeTabId !== value) {
      this._activeTabId = value;
      this.defineTemplateToRender();
    }
  }

  public get activeTabId(): string {
    return this._activeTabId;
  }

  @Output()
  public activeTabIdChanged = new EventEmitter<string>();

  @Output()
  public closeTabClicked = new EventEmitter<string>();


  public tabs: TabDirective[];
  public templateToRender: TemplateRef<any>;

  private _activeTabId: string;

  constructor() { }

  public onTabClicked(tab: TabDirective): void {
    if (this.activeTabId !== tab.tabId) {
      this.activeTabIdChanged.emit(tab.tabId);
      this.activeTabId = tab.tabId;
    }
  }

  public onCloseTabClick(tab: TabDirective, event: MouseEvent): void {
    event.stopImmediatePropagation();
    this.closeTabClicked.emit(tab.tabId);
  }


  private defineTemplateToRender(): void {
    if (!this.tabs || this.tabs.length === 0) {
      this.templateToRender = undefined;
    } else {
      this.templateToRender = this.tabs.find(t => t.tabId === this.activeTabId)?.templateRef ||
                              this.tabs[0].templateRef;
    }
  }


}
