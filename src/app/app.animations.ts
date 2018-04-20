import {animate, keyframes, state, style, transition, trigger} from '@angular/animations';

/**
 * 飞入动画
 * @type {AnimationTriggerMetadata}
 */
export const flyIn = trigger('flyIn', [
  // 默认平移0
  state('in', style({transform: 'translate(0)'})),
  // 进场动画
  transition('void => *', [
    animate(300, keyframes([
      style({opacity: 0, transform: 'translateX(-100%)', offset: 0}),
      style({opacity: 1, transform: 'translateX(25px)',  offset: 0.3}),
      style({opacity: 1, transform: 'translateX(0)',     offset: 1.0})
    ]))
  ]),
  // 离场动画
  transition('* => void', [
    animate(300, keyframes([
      style({opacity: 1, transform: 'translateX(0)',     offset: 0}),
      style({opacity: 1, transform: 'translateX(-25px)', offset: 0.7}),
      style({opacity: 0, transform: 'translateX(100%)',  offset: 1.0})
    ]))
  ])
]);

/**
 * 由下而上渐变切入
 * @type {AnimationTriggerMetadata}
 */
export const fadeInFromDown2Up = trigger('fadeInFromDown2Up', [
  // 进场动画
  transition('void => *', [
    animate('0.5s ease-in-out', keyframes([
      style({opacity: 0, offset: 0}),
      style({opacity: 0, transform: 'translateY(10%)', offset: 0.5}),
      style({opacity: 1, transform: 'translateY(0)',    offset: 1}),
    ]))
  ]),
  // 离场动画
  transition('* => void', [
    animate('0.3s ease-in-out', keyframes([
      style({opacity: 1, offset: 0}),
      style({opacity: 0, offset: 1}),
    ]))
  ])
]);

/**
 * 渐变切入
 * @type {AnimationTriggerMetadata}
 */
export const fadein = trigger('fadein', [
  // 进场动画
  transition('void => *', [
    animate('0.3s', keyframes([
      style({opacity: 0, offset: 0}),
      style({opacity: 1, offset: 1}),
    ]))
  ]),
  // 离场动画
  transition('* => void', [
    animate('0.3s', keyframes([
      style({opacity: 1, offset: 0}),
      style({opacity: 0, offset: 1}),
    ]))
  ])
]);

export class AppAnimations { }
