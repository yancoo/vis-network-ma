# vis-network 9.1.9 => 微信小程序

## 问题
1. 不能直接npm引入
2. 不能使用H5 document、window、canvas

## 移植过程
1. vis-network、vis-util、vis-data源码复制到lib
  - npm引入hammerjs、crypo-js、uuid等
2. 原代码未直接删除，增加typeof wx !== 'undefined'做小程序兼容处理
3. 使用小程序canvas事件
  - 增加WxCanvasHammer/WxCanvasHammerHandler，基于小程序canvas四个touch事件仿hammerjs生成panstart/panmove/panend/pinch或wxWheel事件，用于tap点击、press按下、drag pan拖拽、pinch/wxWheel缩放处理
4. 逐帧渲染window.requestAnimationFrame换成canvas.requestAnimationFrame
5. 周期调度windows.setTimeout/windows.clearTimeout换成小程序setTimeout/clearTimeout
6. import xxx.css 注释，小程序不支持
7. edge新增时id生成采用uuid+crypto，小程序不支持crypto，引入crypto-js，不过并未采用uuid（仍报错）

## 后续
1. Node Image处理仍存在document依赖，可逐步替换
2. ManipulationSystem同上