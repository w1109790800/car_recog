//index.js
//获取应用实例
const AV = require('../../utils/av-live-query-weapp-min');
const car_recog = require('../../model/car_recog');
const app = getApp()
let interstitialAd = null
Page({
  data: {
    times: 1000 ,
    height: 350,
    listData: [
      { year: "", name: "等待识别", score: 0.9960000000 },
      { year: "", name: "等待识别", score: 0.002000000000 },
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
    
    this.setData({
      
      userinfo: null
    });
  },
  recog(e) {

      this.takePhoto();
  },

  requestLogin() {
    let that = this;

  },


  uploadphoto: function () {
    this.setData({
      height: 100
    })


  },
  onLoad: function () {
    // 在页面onLoad回调事件中创建插屏广告实例
if (wx.createInterstitialAd) {
  interstitialAd = wx.createInterstitialAd({
    adUnitId: 'adunit-471d59634cab5939'
  })
  interstitialAd.onLoad(() => {})
  interstitialAd.onError((err) => {})
  interstitialAd.onClose(() => {})
}

    if (app.globalData.userInfo) {
      this.setData({
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
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
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


    that.setData(
      {
        height: 100,
      })
      wx.chooseImage({
        complete: (res) => {
        wx.showLoading({
            title: '正在上传',
          })
        console.log(res)
        that.setData({
          src: res.tempFilePaths[0],
          isCamera: true
        })

        new AV.File('file-name', {
          blob: {
            uri: res.tempFilePaths[0],
          },
        }).save().then(function (file) {
          wx.hideLoading()
          wx.showLoading({
            title: '正在识别',
          })
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

                  }


                })
              }
              else {


                _this.setData({ listData: res.data.result });
                wx.hideLoading()
                if (interstitialAd) {
                  interstitialAd.show().catch((err) => {
                    console.error(err)
                  })
                }
              }
            }
          })

        }
          ).catch(console.error);

      },
      fail: function (res) {
        console.log("dhfjsdkf")
        console.log(res)
        wx.showToast({
          title: '拍照错误',
          icon: 'none',
          duration: 2000
        }).catch(console.error);
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
