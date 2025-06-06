/**
 * WxCanvasHammer
 * 
 * - 不同于@egjs/hammerjs/index.js，后者依赖H5 canvas
 * - 不同于vis-utils Hammer$1 hammerMock，后者emit事件被丢弃、导致不触发on事件
 * 
 * hack by yan（1220041986@qq.com） 2025.6.5
 */
class WxCanvasHammer {

  constructor() {
    // 存储事件和对应的监听器
    this.events = new Map()

    // 存储key/value集合
    this.kvs = new Map()
  }

  // 触发事件
  emit(eventName, ...args) {
    if (this.events.has(eventName)) {
      // 复制监听器数组，避免在执行过程中被修改
      const listeners = [...this.events.get(eventName)];

      listeners.forEach(listener => {
        listener(...args);
      });
    }
    return this;
  }

  // 注册事件监听器
  on(eventName, callback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    this.events.get(eventName).push(callback);
    return this; // 支持链式调用
  }

  // 移除事件监听器
  off(eventName, callback) {
    if (this.events.has(eventName)) {
      // 过滤掉要移除的回调函数
      const listeners = this.events.get(eventName);
      this.events.set(
        eventName,
        listeners.filter(listener => listener !== callback)
      );
    }
    return this;
  }

  // 只触发一次的监听器
  once(eventName, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(eventName, wrapper); // 执行后立即移除
    };

    this.on(eventName, wrapper);
    return this;
  }

  get(key) {
    let kvs = this.kvs
    return {
      set(value) {
        kvs.set(key, value)
      }
    }
  }

  destroy() {
    this.events = new Map()
    this.kvs = new Map()
  }

}

export default WxCanvasHammer