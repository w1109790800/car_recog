//index.js
//获取应用实例
const AV = require('../../utils/av-live-query-weapp-min');
const car_recog = require('../../model/car_recog');
const app = getApp()

Page({
  data: {
    times: 0 ,
    height: 350,
    listData: [
      { year: "", name: "等待识别", score: 0.9980000000 },
      { year: "", name: "等待识别", score: 0.002000000000 }],
    isCamera: false,
    src: '',
    userinfo: null,
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数

  onShareAppMessage: function (res) {
    var _that = this;
    wx.showShareMenu({
      withShareTicket: true,
    })
    console.log(res)
    return {
      success: function (res) {
        
        console.log(res)
        console.log("S")
        var times = wx.getStorageSync('times', times);
        console.log(typeof(times))
        times += 3
        wx.setStorageSync('times', times);
        _that.setData({
          times: times
        })

      },
      title: '拍照识车 百度AI引擎助力，秒拍即刻有结果~',
      desc: '百度AI引擎助力，秒拍即刻有结果~',
      path: '/pages/index/index',

      fail: function (res) {
        console.log("Fail")
        // 转发失败
      }
    }



  },


  onShow: function () {
    var that = this;
    
    console.log("S")
    var times = wx.getStorageSync('times', times)
    console.log(times)
    if (times == "")
    times = 0
    that.setData({
      times: times
    })
    this.setData({
      isCamera: false,
      userinfo: null
    });
  },
  recog(e) {
    var times = wx.getStorageSync('times')
    console.log(times)
    if (times > 0) {
      this.takePhoto();
    }
    else {
      wx.showModal({
        title: "提示",
        content: '对不起，识别次数不足，您可以转发来增加次数',
        success: function (res) {
          if (res.confirm) {

          }

        }
      })
    }
  },
  takePhoto() {

    for (var i = 350; i > 100; i -= 3)
      that.setData(
        {
          height: i,
        })
    let that = this;
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        that.setData({
          src: res.tempImagePath,
          isCamera: true
        })
        that.requestrecog();
      },
      fail: function (res) {
        wx.showToast({
          title: '拍照错误',
          icon: 'none',
          duration: 2000
        });
      }
    })
  },

  requestLogin() {
    let that = this;

  },


  uploadphoto: function () {


    var times = wx.getStorageSync('times')
    times -= 1
    wx.setStorageSync('times', times)
    this.setData({
      times: times,
      height: 100
    })


  },
  onLoad: function () {
    var times = wx.getStorageSync('times')
    this.setData({
      times: times
    })
    if (app.globalData.userInfo) {
      var times = wx.getStorageSync('times')
      this.setData({
        times: times,
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

  },
  getUserInfo: function (e) {
    console.log(e)
    var times = 5
    wx.setStorageSync('times', times)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    var times = wx.getStorageSync('times')
    this.setData({
      times: times
    })
  },
  relogin() {
    this.setData({
      isCamera: false,
      height: 350
    })
  },
  addtimes() {



  },
  takePhoto() {
    var _this = this;
    let that = this;

    wx.showLoading({
      title: '正在识别',
    })
    for (var i = 350; i > 100; i -= 3)
      that.setData(
        {
          height: i,
        })
    that.setData(
      {
        height: 100,
      })
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        console.log(res.tempImagePath)
        that.setData({
          src: res.tempImagePath,
          isCamera: true
        })
        var times = wx.getStorageSync('times', times)
        times -= 1
        wx.setStorageSync('times', times)
        this.setData({
          times: times
        })
        new AV.File('file-name', {
          blob: {
            uri: res.tempImagePath,
          },
        }).save().then(function (file) {
          file => console.log(file.url())
          var bojid = wx.getStorageSync("objid");
          console.log(bojid);
          var img = AV.Object.createWithoutData('count', bojid);
          // 修改属性
          img.set('url', file.url());
          img.save();
          console.log(file.url())
          that.setData(
            {
              imgurl: file.url(),
            })
          console.log("RE");
          wx.request({
            url: 'https://w1109790800.leanapp.cn/recog_car',
            method: 'POST',
            data: { "url": file.url() },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
            success: function (res) {
              console.log(res.data.result)
              
              if (res.data.result == undefined) {
                wx.hideLoading()
                wx.showModal({
                  title: '提示',
                  content: '识别结果为空      （可能是没有汽车照片或照片过于模糊）\n 本次识别不扣除次数',
                  success: function (res) {
                    if (res.confirm) {
                      console.log('用户点击确定 \n 本次识别不扣除次数')
                    }
                    var times = wx.getStorageSync('times');
                    times += 1;
                    wx.setStorageSync('times', times);

                    that.setData({
                      times: times
                    })
                  }


                })
              }
              else {


                _this.setData({ listData: res.data.result });
                wx.hideLoading()
              }
            }
          })

        }
          ).catch(console.error);

      },
      fail: function (res) {
        wx.showToast({
          title: '拍照错误',
          icon: 'none',
          duration: 2000
        });
      }
    })
  },
  error(e) {
    wx.showToast({
      title: '请允许小程序使用摄像头',
      icon: 'none',
      duration: 2000
    });
  }
})
