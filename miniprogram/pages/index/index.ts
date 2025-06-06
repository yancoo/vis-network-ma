
import { DataSet } from "../../lib/vis-data/esnext/esm/vis-data";
import { Network } from "../../lib/network/Network";

// 获取应用实例
const app = getApp<IAppOption>()

Page({
  data: {
    network: {},

    testManipulation: false,
    testRenderEvent: false,
  },
  onLoad() {
    // create an array with nodes
    var nodeArray = [
      { id: 1, label: "Node 1", x: 10, y: 10, color: { background: "#FFF000" } },
      { id: 2, label: "Node 2", x: 50, y: 50, shape: "box", size: 200, value: 200 },
      { id: 3, label: "Node 3", x: 30, y: -80 },
      { id: 4, label: "Node 4", x: 100, y: 100, shape: "dot", size: 10 },
      { id: 5, label: "Node 5", x: 200, y: 200 },
      { id: 6, label: "Node 6", x: 100, y: 200, shape: "star", },
    ]
    var edgeArray = [
      { from: 1, to: 3, dashes: true, arrows: { to: { enabled: true, type: 'arrow' } } },
      { from: 1, to: 2, arrows: { to: { enabled: true, type: 'diamond' } }, label: 'xxx' },
      { from: 2, to: 4, arrows: "from", color: { color: "#ff0000" } }, // { to: { enabled: true, type: 'crow' } } },
      { from: 2, to: 5, arrows: { to: { enabled: true, type: 'triangle' } }, width: 4, title: "4 emails per week" },
      { from: 3, to: 3, arrows: "to" },
    ]
    var nodes = new DataSet(nodeArray, {})

    var edges = new DataSet(edgeArray, {});

    /** ignored */
    const windowInfo = wx.getWindowInfo()
    const width = windowInfo.windowWidth
    const height = windowInfo.windowHeight
    const dpr = windowInfo.pixelRatio
    console.log('windowInfo', windowInfo)

    wx.createSelectorQuery().select('#relationGraph').fields({
      node: true,
      size: true
    }).exec((res) => {
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')

      canvas.clientWidth = width // hack
      canvas.clientHeight = height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      var data = {
        nodes: nodes,
        edges: edges,
      };
      var options = {
        manipulation: {
          enabled: this.data.testManipulation,
        },
      };
      var network = new Network(ctx, data, options);
      this.network = network

      if (this.data.testRenderEvent) {
        network.on("initRedraw", function () {
          // do something like move some custom elements?
        });
        network.on("beforeDrawing", function (ctx) {
          var nodeId = 1;
          var nodePosition = network.getPositions([nodeId]);
          ctx.strokeStyle = "#A6D5F7";
          ctx.fillStyle = "#294475";

          ctx.beginPath();
          ctx.arc(
            nodePosition[nodeId].x,
            nodePosition[nodeId].y,
            50,
            0,
            2 * Math.PI,
            false
          );
          ctx.closePath();

          ctx.fill();
          ctx.stroke();
        });
        network.on("afterDrawing", function (ctx) {
          var nodeId = 1;
          var nodePosition = network.getPositions([nodeId]);
          ctx.strokeStyle = "#294475";
          ctx.lineWidth = 4;
          ctx.fillStyle = "#A6D5F7";

          ctx.beginPath();
          ctx.arc(
            nodePosition[nodeId].x,
            nodePosition[nodeId].y,
            20,
            0,
            2 * Math.PI,
            false
          );
          ctx.closePath();

          ctx.fill();
          ctx.stroke();
        });
      }
    })

  },

  onTouchStart(event) {
    this.network.onWxCanvasEvent(event)
  },

  onTouchMove(event) {
    this.network.onWxCanvasEvent(event)
  },

  onTouchEnd(event) {
    this.network.onWxCanvasEvent(event)
  },

  onTouchCancel(event) {
    this.network.onWxCanvasEvent(event)
  },
})
