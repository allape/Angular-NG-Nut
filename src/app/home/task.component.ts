import {Component, OnInit} from '@angular/core';
import {IndexComponent} from './flow/index/index.component';
import {TaskService} from './services/task.service';

// 任务组件下的子组件集合
export const TASK_FLOW = [
  IndexComponent
];

@Component({
  selector: 'app-home',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
})
export class TaskComponent implements OnInit {

  constructor(
    private ts:             TaskService,
  ) { }

  ngOnInit() {

  }

}
