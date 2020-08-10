// pages/auth/auth.js
import {
  request
} from "../../request/index.js";
import {
  login
} from "../../utils/asyncWx.js";
import regeneratorRuntime from '../../lib/runtime/runtime';

Page({
  //获取用户信息
  async handleGetUserInfo(e) {
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


  }
})