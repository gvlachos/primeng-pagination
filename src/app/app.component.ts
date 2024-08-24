import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DataViewLazyLoadEvent, DataViewModule, DataViewPageEvent } from 'primeng/dataview';
import { InputNumberModule } from 'primeng/inputnumber';
import { todos } from './todos';


const PageSize = 3;
interface PagedRequest {
  sortBy?: string;
  page: number;
  pageSize: number;
}

interface Todo {
    id: number,
    userId: number,
    title: string,
    completed: boolean
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    CardModule,
    FormsModule,
    ButtonModule,
    CommonModule,
    DataViewModule,
    InputNumberModule,
  ],
})
export class AppComponent {

  loadTimeout: any;

  loading = true;

  dataList: Todo[] = [];
  totalRecords = 0;

  pagedOptions: PagedRequest = {
    page: 1,
    pageSize: PageSize
  };
  first = 0;

  userId: number | null = null;
  hasFilterUpdate = false;

  trackBy = (index: number, item: Todo) => {
    return item.id;
  }

  constructor(public cd: ChangeDetectorRef){
    this.dataList = todos;
    this.totalRecords = todos.length;
  }

  onPage(event: DataViewPageEvent) : void {
    console.log('onPage', event)
  }

  load(event?: DataViewLazyLoadEvent): void {
    this.loading = true;

    clearTimeout(this.loadTimeout);

    this.loadTimeout = setTimeout(() => {
      console.log('load', event)

      let result: Todo[] = todos;

      // filter by userid if present or reset filter
      if (this.userId !== null) {
        result = this.userId
          ? result.filter(todo => todo.userId === this.userId)
          : todos;
      }

      // show records as indicated by the event page
      if (event) {
        const start = event.first;
        const end = event.first + PageSize;
        result = result.slice(start, end);
      }

      // set the data to display
      this.dataList = result;

      // if data was filtered reset the pagination state
      // update the total records and reset the filter flag
      if (this.hasFilterUpdate) {
        this.totalRecords = this.dataList.length;
        this.hasFilterUpdate = false;
        this.resetPagination();
        this.loading = false;
        this.cd.detectChanges();
      } else {
        this.loading = false;
        this.cd.detectChanges();
      }
    }, 300);
  }

  resetPagination(detectChanges?: boolean) {
    this.first = 0;
    if (detectChanges) {
      this.cd.detectChanges();
    }
  }

  updateFilter(load: boolean, event?: number) {
    if (this.userId !== event) {
      this.hasFilterUpdate = true;
    }
    this.userId = event ?? null;

    if (load) {
      this.load();
    } else {
      this.cd.detectChanges();
    }
  }
}
