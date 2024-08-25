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
    this.dataList = [...todos];
    this.totalRecords = this.dataList.length;
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
        result = result.filter(todo => todo.userId === this.userId);
        this.totalRecords = result.length;
      } else {
        result = [...todos]
        this.totalRecords = result.length;
      }

      // show records as indicated by the event page
      if (event && !this.hasFilterUpdate) {
        const start = event.first;
        const end = event.first + PageSize;
        this.first = event.first;
        result = result.slice(start, end);
      }

      // set the data to display
      this.dataList = result;
      this.loading = false;

      this.resetPagination();
    }, 300);
  }

  resetPagination() {
    console.log(this.hasFilterUpdate, this.first, 'reset')

    if (this.hasFilterUpdate) {
      this.first = 0;
      this.hasFilterUpdate = false;
    }

    this.cd.detectChanges();
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
