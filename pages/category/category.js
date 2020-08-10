// pages/category/category.js
import { request } from "../../request/index.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
     //左侧的菜单数据
     leftMenuList: [],
     //右侧的商品数据
     rightContent: [],
     //被点击的左侧的菜单
     currentIndex: 0,
     //右侧内容的滚动条距离顶部的距离
     scrollTop:0
 
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     //1 获取本地存储中的数据（小程序中也是存在本地存储技术）
     const Cates=wx.getStorageSync("cates");
     //2 判断
     if(!Cates){
       //不存在 发送请求获取数据
       this.getCategory();
     
     }else{
       //有旧的数据 定义过期时间10s 改成5分钟
       if(Date.now()-Cates.time>1000*10){
         //重新发送请求
         this.getCategory();
       }else{
         //可以使用旧的数据
        this.Cates=Cates.data;
        //构造左侧的分类数据
        let leftMenuList = this.Cates.map(v => v.Name)
        //构造右侧的商品数据
        let rightContent = this.Cates[0].children;
  
        this.setData({
          leftMenuList,
          rightContent
        })
       }
     
     }
  },
  //接口的返回数据
  categories: [],
  async getCategory(){

   const res=await request({url:"/ProductCategory"});
   // this.Cates = res.data.message;
  
   this.Cates = res;
   console.log(res)

   //把接口的数据存入到本地存储中
   wx.setStorageSync("cates",{time:Date.now(),data:this.Cates});
     console.log(this.Cates)
   //构造左侧的大菜单数据
   //map() 方法创建一个新数组，其结果是该数组中的每个元素都调用一个提供的函数后返回的结果。
   let leftMenuList = this.Cates.map(v => v.Name)
   //构造右侧的商品数据
   let rightContent = this.Cates[0].children;
   rightContent.forEach(v=>{
     v.children.forEach(v2=>{
       v2.Img=JSON.parse(v2.Img)
     })
   })
   console.log(rightContent)
   this.setData({
     leftMenuList,
     rightContent
   })
},

  //左侧菜单栏的点击事件
  handleItemTap(e) {
    /* 
    1 获取被点击的标题身上的索引
    2 给data中的currentIndex赋值就可以了
    3 根据不同的索引来渲染右侧的商品内容
    */
    const { index } = e.currentTarget.dataset;
    let rightContent = this.Cates[index].children;
    rightContent.forEach(v=>{
      v.children.forEach(v2=>{
        if(typeof(v2.Img)=='string'){
          v2.Img=JSON.parse(v2.Img)
        }
      })
    })
    //构造右侧的商品数据
    
    this.setData({
      currentIndex: index,
      rightContent,
       //重新设置右侧内容的 scroll-view标签的距离顶部的距离
      scrollTop:0
    })
   

  },
  handleGoodsList(e){
    console.log(e.currentTarget.dataset)

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