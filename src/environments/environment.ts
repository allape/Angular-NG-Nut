// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  // 是否为生产环境
  production:     false,
  // 路由全局配置
  ROUTER: {
    // 是否使用hash
    useHash:        true,
    // 是否打印导航信息, 仅限于调试和开发中
    enableTracing: false
  },

  // 默认展示的图片
  DEFAULT_PHOTO: 'assets/img/yyjr-logo.svg',

  // 默认的直播地址网站
  DEFAULT_LIVING_STREAM_INDEX: 'http://120.55.52.28/ls/index.html',
  // 默认的直播推送地址
  DEFAULT_LIVING_STREAM_PUSH_POINT: 'rtmp://120.55.52.28:1935/hls/',

  // 服务地址
  HOST: 'http://120.55.52.28:8080',
  // 请求的接口列表
  REQ_URLS: {
    // 登陆授权
    auth: {
      // 登陆授权
      token:                              '/auth/token'
    },
    // 管理员
    user: {
      // 获取当前登录对象信息及角色
      current:                            '/api/sys/permission/user/current',
      // 修改用户在线状态
      updateUserOnlineState:              '/api/sys/permission/user/updateUserOnlineState',
    },
    // 问题
    question: {
      // 根据操作标识符获取问题列表
      question:                           '/api/business/operationflow/questions/getQuestionByOperatorCode',
      // 查询所有问题
      all:                                '/api/business/question/all',
    },
    // 任务
    task: {
      // 修改订单处理状态, 无效状态
      updateTaskState:                    '/api/core/business/machineTask/updateTaskState',
      // 根据任务ID获取用户信息
      getUserInfoByTask:                  '/api/core/business/taskUserInfo/getUserInfoByTask',
      // 根据任务修改添加用户信息
      editUserInfoByTask:                 '/api/core/business/taskUserInfo/editUserInfoByTask',
      // 根据文件路径修改文件状态
      updateStateByFileURL:               '/api/core/business/machineTaskFile/updateStateByFileURL',
      // 更改任务当前处理步骤
      updateTaskStep:                     '/api/core/business/machineTask/updateTaskStep',
      // 获取当前管理员正在处理的任务
      getDoingTaskStep:                    '/api/core/business/machineTask/getDoingTaskStep',
      // 修改/操作任务的链接
      task:                                '/api/core/business/machineTask/',
      // 获取当前管理员推送的任务
      getOnwerTaskList:                    '/api/core/business/machineTask/getOnwerTaskList'
    },
    // 公共接口
    common: {
      // 获取文件访问路径
      getFilePath:                        '/api/business/files/auth/getFilePath'
    }
  },
  // 服务器自定义状态码
  SERVICE_RES_CODES: {
    ok: 200001,
  },

  // MQTT服务配置
  MQTT_OPTIONS: {
    hostname: 'mqtt-cn-4590ig7p007.mqtt.aliyuncs.com',
    topic: 'Topci_A_Test',
    port: 80,
    path: '/',
    connectTimeout: 2000,
    accessKey: 'LTAI53JYm17bGJnV',
    secretKey: 'Psl7PmiapFvVTSlRsq2iVNBRWIZjd2',
    groupId: 'GID_phkjTest1',
    clientId: 'GID_phkjTest1@@@web_test_1_v2'
  },
  // MQTT终端响应代号
  MQTT_RES_CODES: {
    ok: '200'
  },

  // 标识符/字典库
  DICTIONARY: {
    // 管理员
    user: {
      // 在线状态
      state: {
        // 离线
        OFFLINE:        '0',
        // 空闲
        ONLINE:         '1',
        // 等待接受任务
        WAITING:        '2',
        // 忙碌
        BUSY:           '3',
        // 离开
        OUT_OF_SERVICE: '4'
      }
    }
  }
};
