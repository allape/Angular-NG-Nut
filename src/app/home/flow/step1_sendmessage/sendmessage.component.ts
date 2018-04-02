import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd';
import {environment} from '@env/environment';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '../../services/common.service';
import {DEFAULT_MQTT_TIMEOUT, MQTT_COMMANDS, MQTT_MODULES, STEP_FLAGS, TaskService} from '../../services/task.service';

@Component({
  selector: 'app-task-sendmessage',
  templateUrl: './sendmessage.component.html',
})
export class SendmessageComponent implements OnInit {

  // 验证表单
  validateForm: FormGroup;

  // 验证码倒计时
  verifyCode: any = {
    verifyCodeTips: '获取验证码',
    countdown: 60,
    disable: false
  };

  constructor(
    private http:               HttpClient,
    private fb:                 FormBuilder,
    private msg:                NzMessageService,
    public  cs:                 CommonService,
    public  ts:                 TaskService
  ) { }

  /**
   * 页面渲染前的事件
   */
  ngOnInit() {
    // 加载该页问题列表
    this.ts.loadInquiryList('task-send-message');

    // 初始化表单验证
    this.validateForm = this.fb.group({
      phoneNum: [null, [Validators.required, Validators.pattern(/^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/)]],
      SMSCode: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    // 绑定监听事件
    this.ts.onMsgCallbacks['A05-A06'] = [];
    this.ts.onMsgCallbacks['A05-A06'].push((res) => {
      // 检查动作是否为回调响应
      if (this.ts.checkStepCallback(res)) {
        // 执行跳转
        this.responsedJump();
      } else {
        // 设置loading
        this.ts.flags.loading = false;
      }
    });
  }

  // 表单验证
  getFormControl(name) {
    return this.validateForm.controls[name];
  }

  /**
   * 倒计时
   */
  settime() {
    if (this.verifyCode.countdown === 1) {
      this.verifyCode.countdown = 60;
      this.verifyCode.verifyCodeTips = '获取验证码';
      this.verifyCode.disable = false;
      return;
    } else {
      this.verifyCode.countdown--;
    }

    this.verifyCode.verifyCodeTips = '重新获取(' + this.verifyCode.countdown + ')';
    setTimeout(() => {
      this.verifyCode.verifyCodeTips = '重新获取(' + this.verifyCode.countdown + ')';
      this.settime();
    }, 1000);
  }

  /**
   * 点击获取验证码
   * @param {MouseEvent} e
   */
  getCode(e: MouseEvent) {
    // 验证手机号 禁用修改
    this.http.get(
      this.cs.getUrl(
        environment.REQ_URLS.sms.sendMsg,
        {phoneNum: this.validateForm.getRawValue()['phoneNum'], taskId: this.ts.current.taskId}
      )
    ).subscribe((res: any) => {
      if (res.code === environment.SERVICE_RES_CODES.ok) {
        this.msg.success('验证码已发送');

        // 发送更新指令
        this.ts.push({
          module: MQTT_MODULES.app.A05,
          action: MQTT_COMMANDS.sendData,
          data: {
            phoneNum: this.getFormControl('phoneNum').value,
            code: '',
            startCountDown: true
          },
        });
      } else {
        this.msg.warning('获取失败! err: ' + res.msg);
      }
    });
    // 发送验证码成功后开始倒计时
    this.verifyCode.disable = true;
    this.settime();
  }

  /**
   * 验证验证码
   */
  validateSmsCode() {

    // 发送验证码内容
    this.ts.push({
      module: MQTT_MODULES.app.A05,
      action: MQTT_COMMANDS.sendData,
      data: {
        phoneNum: this.getFormControl('phoneNum').value,
        code: this.getFormControl('SMSCode').value,
        startCountDown: false
      },
    });

    // 按钮显示加载中
    this.ts.flags.loading = true;

    // 请求网络
    this.http.post(this.cs.getUrl(environment.REQ_URLS.sms.validateCode), this.validateForm.getRawValue()).subscribe((res: any) => {
      if (res.data) {
        this.msg.success('验证码验证成功！');

        // 向android端发送跳转消息
        setTimeout(() => {
          // 发送命令
          this.ts.pushStepCommand(MQTT_MODULES.app.A05_A06);

          // 开启倒计时
          this.ts.utils.countDown = DEFAULT_MQTT_TIMEOUT / 1000;
          this.ts.flags.utils.showCountingDown = true;

          // 如果android未响应, 提示消息
          this.ts.flags.mqtt.responseTimeout = setTimeout(() => {
            // 提醒消息
            this.msg.warning('客户端响应超时!');
            // 清空倒计时
            this.ts.cleanCountdown();
            // 释放按钮
            this.ts.flags.loading = false;
          }, DEFAULT_MQTT_TIMEOUT);
        }, 3000);

        // TEST 模拟计时跳转
        /*setTimeout(() => {
            this.responsedJump();
        }, 3000);*/

      } else {
        this.getFormControl('SMSCode').setErrors({error: true, checked: true});
        this.msg.error('验证码验证失败！');

        // 释放按钮
        this.ts.flags.loading = false;
      }
    });

  }

  /**
   * 等待android端响应时才跳转页面
   */
  responsedJump() {
    // 清空倒计时
    this.ts.cleanCountdown();
    // 清空超时
    clearTimeout(this.ts.flags.mqtt.responseTimeout);
    // 释放按钮
    this.ts.flags.loading = false;
    // 跳转至试算界面
    this.ts.step = STEP_FLAGS[2];
  }

}
