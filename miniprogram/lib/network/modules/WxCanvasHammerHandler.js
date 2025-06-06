/**
 * wx canvas <> hammer 事件处理
 * 
 * wx canvas只有4个touch事件
 * 
 * Tap：短时间（默认 < 250ms）+ 小距离（默认 < 10px）
 * Press: 单指触摸屏幕并保持不动至少250ms
 * Pan：单指移动距离超过阈值（默认 > 10px），无论时间长短
 * Pinch：双指操作
 */

const tapMaxTime = 250 // ms
const tapMaxDistance = 10 // px
const pressMinTime = 250 // ms

const debugLogOpen = false // true open, false close

class WxCanvasHammerHandler {

  /**
   * @param {object} body
   */
  constructor(hammer) {
    this.hammer = hammer
    this.pressCheckTimer = null
    this.pinching = false // 两指缩放，wheel+deltaY缩放，pinch缩放（需自己算scale）
    this.wxStartEvent = {}
    this._debugLog('WxCanvasHammerHandler construtor')
  }

  onWxCanvasEvent(event) {
    const touches = event.changedTouches
    if (this.debugLogOpen) {
      this._debugLog('onWxCanvasEvent', event.type, touches.length, JSON.stringify(touches.map(item => ({
        identifier: item.identifier,
        clientX: item.clientX,
        clientY: item.clientY
      }))))
    }
    if (event.type === 'touchstart') {
      this._clearPressCheckTimer()
      // 双指缩放
      if (touches.length === 2) { // 据观察，双指、单指可能会交错出现
        this.pinching = true
        this.wxStartEvent = this._toHammerPinchEvent(touches)
      }
      // 单指拖拽
      else if (touches.length === 1) {
        this.wxStartEvent = this._toHammerPanEvent(touches[0])
        this.hammer.emit('onTouch', this.wxStartEvent)

        this._debugLog('set pressCheckTimer')
        this.pressCheckTimer = setTimeout(() => {
          if (!this.wxStartEvent.panstartEmit) {
            this.hammer.emit('press', this.wxStartEvent) // 按下未移动，则press选中
          }
        }, pressMinTime)
      }
    } else if (event.type === 'touchmove') {
      // 双指缩放
      if (touches.length === 2) {
        this._clearPressCheckTimer()
        if (!this.pinching) {
          this.pinching = true
          this.wxStartEvent = this._toHammerPinchEvent(touches)
        } else {
          const dist = this._calcPinchDist(touches)
          const pinchStartDist = this.wxStartEvent.pinchStartDist
          const scale = dist / pinchStartDist
          const center = this.wxStartEvent.center
          if (false) {
            this.hammer.emit('pinch', { // pinch和预期有差别
              scale,
              center
            })
          } else {
            this.hammer.emit('wxWheel', { // hacker
              deltaY: scale > 1 ? -1 : 1,
              clientX: center.x,
              clientY: center.y,
              preventDefault: () => {}
            })
          }
        }
      }
      // 双指变单指
      else if (touches.length === 1 && this.pinching) {
        this.pinching = false // 再变双指时，重置wxStartEvent，否则来回缩放不符预期
      }
      // 单指拖拽
      else if (touches.length === 1 && !this.pinching) {
        const dist = this._calcPanMoveDist(touches[0], this.wxStartEvent)
        const dur = new Date().getTime() - this.wxStartEvent.startTime
        this._debugLog('dist', dist, 'dur', dur, 'startEvent', this.wxStartEvent)

        if (dist > tapMaxDistance) {
          if (!this.wxStartEvent.panstartEmit) {
            this.wxStartEvent.panstartEmit = true
            this.hammer.emit('panstart', this.wxStartEvent)
          }
          this.hammer.emit('panmove', this._toHammerPanEvent(touches[0]))
        }

      }

    } else if (event.type === 'touchend') {
      // 双指缩放
      if (touches.length === 2) {}
      // 单指拖拽
      else if (touches.length === 1 && !this.pinching) {
        const dist = this._calcPanMoveDist(touches[0], this.wxStartEvent)
        const dur = new Date().getTime() - this.wxStartEvent.startTime
        // this._debugLog('dist', dist, 'dur', dur, 'startEvent', this.wxStartEvent)

        if (dist <= tapMaxDistance && dur <= tapMaxTime) {
          this.hammer.emit('tap', this.wxStartEvent);
        } else if (this.wxStartEvent.panstartEmit) {
          this.hammer.emit('panend', this._toHammerPanEvent(touches[0]));
        }
      }
      this._clearPressCheckTimer()
      this.pinching = false

    } else if (event.type === 'touchcancel') {
      // 双指缩放
      if (touches.length === 2) {}
      // 单指拖拽
      else if (touches.length === 1 && !this.pinching) {
        if (this.wxStartEvent.panstartEmit) {
          this.hammer.emit('panend', this._toHammerPanEvent(touches[0]));
        }
      }
      this._clearPressCheckTimer()
      this.pinching = false
    }
  }

  _calcPinchDist(touches) {
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return Math.sqrt(dx * dx + dy * dy)
  }

  _calcPinchCenter(touches) {
    return {
      x: (touches[1].clientX + touches[0].clientX) / 2,
      y: (touches[1].clientY + touches[0].clientY) / 2,
    }
  }

  _calcPanMoveDist(touch, startTouch) {
    const dx = touch.clientX - startTouch.clientX
    const dy = touch.clientY - startTouch.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  _toHammerPinchEvent(touches) {
    return {
      center: this._calcPinchCenter(touches),
      pinchStartDist: this._calcPinchDist(touches)
    }
  }

  _toHammerPanEvent(touch) {
    return {
      clientX: touch.clientX,
      clientY: touch.clientY,
      center: { // 兼容hammer
        x: touch.clientX,
        y: touch.clientY
      },
      startTime: new Date().getTime(),
      panstartEmit: false, // 自有
      srcEvent: { // 兼容hammer
        shiftKey: false
      }
    }
  }

  _clearPressCheckTimer() {
    if (this.pressCheckTimer) {
      this._debugLog('_clearPressCheckTimer')
      clearTimeout(this.pressCheckTimer)
      this.pressCheckTimer = null
    }
  }

  _debugLog(...args) {
    if (debugLogOpen) {
      console.log('hammerHandler:', ...args)
    }
  }
}

export default WxCanvasHammerHandler