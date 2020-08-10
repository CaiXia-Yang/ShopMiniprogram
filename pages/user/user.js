// pages/user/user.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userinfo:{},
    //被收藏的商品的数量
    collectNums:0
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const userinfo=wx.getStorageSync("userinfo");
    const collect=wx.getStorageSync("collect")||[];
      
    this.setData({userinfo,collectNums:collect.length});
  },
})