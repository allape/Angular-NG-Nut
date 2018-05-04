import {FormGroup} from '@angular/forms';
import {AbstractControl} from '@angular/forms/src/model';

export class ComponentBase {

  /**
   * fc = Form Control
   * 根据名称获取FormGroup中对应的FormControl对象
   * @param {FormGroup} form    对应的表单
   * @param {string} name       获取的控件的名称
   * @returns {AbstractControl}     控件; 可能为null
   */
  public fc(form: FormGroup, name: string): AbstractControl {
    return form.controls[name];
  }

  /**
   * dt = dirty or touched
   * 检查对应字段是否被修改或被点击
   * @param {FormGroup} form    对应的表单
   * @param {string} name       检查的控件的名称
   */
  public dot(form: FormGroup, name: string) {
    return this.fc(form, name).dirty || this.fc(form, name).touched;
  }

}
