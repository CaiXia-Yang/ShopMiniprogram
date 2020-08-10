// pages/login/login.js
import {
  login
} from "../../utils/asyncWx.js";
import {
  request
} from "../../request/index.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

    //获取用户信息
    async handlerGetUserInfo(e) {
      //1 获取用户信息
      const {userInfo} = e.detail;
      console.log(userInfo)
      wx.setStorageSync("userinfo", userInfo);
      //2 获取小程序登录成功后的code
      const {code} = await login();
      console.log(code)
      //3 发送请求 获取用户的token
      const token = await request({
        url: "/auth/getToken",
        data: {userInfo,code},
        method: "post",
        header:'content-type:application/json'
      });
      console.log(token)
      //4 把token存入缓存中 同时跳转回上一个页面
      wx.setStorageSync("token", {time:Date.now(),data:token.Token});
      wx.setStorageSync("expire", token.Expire);
      wx.setStorageSync("refreshExpire", token.RefreshExpire);
      wx.setStorageSync("refreshToken",{time:Date.now(),data:token.RefreshToken});
      wx.navigateBack({
        delta: 1
      });
      // await request({
      //   url:"/auth/test",
      //   method:"get"
      // })
  
  
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})