import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonService} from '../../../base/services/common.service';
import {Title} from '@angular/platform-browser';
import {flyIn, fadeInFromDown2Up} from '../../../app.animations';
import {HttpService} from '../../../base/services/http/http.service';

@Component({
  selector: 'app-homepage-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
  animations: [
    flyIn, fadeInFromDown2Up
  ]
})
export class IndexComponent implements OnInit, OnDestroy {

  /**
   * 当前组件在自定义服务中注册器中的名称
   * @type {string}
   */
  private COMPONENT_NAME = 'HomepageIndexComponent';

  constructor(
    public  cs:         CommonService,
    public  http:       HttpService,
    private title:      Title,
  ) {
    this.title.setTitle('主页');
  }

  ngOnInit() {
    this.cs.registerComponent(this.COMPONENT_NAME, this);
    this.http.get('/health').subscribe(
      (res: any) => {
        console.log(res);
      }
    );
  }

  ngOnDestroy(): void {
    this.cs.unregisterComponent(this.COMPONENT_NAME);
  }

}
