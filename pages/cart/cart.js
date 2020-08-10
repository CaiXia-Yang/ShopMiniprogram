// pages/cart/cart.js
/* 
1 获取用户的收货地址
  1 绑定点击事件
  //2 调用小程序内置api 获取用户的收货地址

  2 获取用户对小程序所授予获取地址的权限状态 scope
    1 假设用户点击获取收货地址的提示框 确定
    scope 值 true 直接调用获取收货地址
    2 假设用户从来没有调用过收货地址的api
    scope undefined 直接调用获取收货地址
    3 假设用户点击获取收货地址的提示框 取消
     scope 值 false
     1 诱导用户 自己打开授权设置页面(wx.openSetting) 当用户重新给与获取地址权限时
     2 获取收货地址
    4 把获取到的收货地址存入到本地存储中
2 页面加载完毕
  0 onLoad onShow
  1 获取本地存储中的地址数据
  2 把数据设置给data中的一个变量
3 onShow
  0 回到了商品详情页面 第一次添加商品的时候 手动添加了属性
    1 num 
    2 checked=true
  1 获取缓存中的购物车数组
  2 把购物车数据填充到data中
4 全选的实现 数据的展示
  1 onshow 获取缓存中的购物车数组
  2 根据购物车中的商品数据 所有的商品都被选中时 checked=true 全选就被选中
5 总价格和总数量
  1 都需要商品被选中 在计算
  2 获取购物车数组
  3 遍历
  4 判断商品是否被选中
  5 总价格+=商品的单价*商品的数量
  6 总数量+=商品的数量
  7 把计算后的价格和数量 设置回data中即可
6 商品的选中
  1 绑定change事件
  2 获取到被修改的商品对象
  3 商品对象的选中状态 取反
  4 重新填充回data中和缓存中
  5 重新计算全选 总价格 总数量
7 全选和反选
  1 全选复选框绑定事件 change
  2 获取data中的全选变量 allChecked
  3 直接取反 allChecked
  4 遍历购物车数组 让里面商品选中状态跟随 allChecked 改变而改变
  5 把购物车数组和allChecked 重新设置返回 data 把购物车重新设置回缓存中
8 商品数量的编辑功能
  1 "+","-" 按钮 绑定同一个点击事件 区分的关键 自定义属性
    1 "+" "+1"
    2 "-","-1"
  2 传递被点击的商品id goods_id
  3 获取data中的购物车数组 来获取需要被修改的商品对象
  4 当购物车的数量=1 同时用户点击 "-"
    弹框提示(showModal) 询问用户 是否要删除
      1 确定 直接执行删除
      2 取消 什么都不做
  4 直接修改商品对象的数量 num
  5 把cart数组 重新设置回缓存中 和data中this.setCart
9 点击结算
  1 判断有没有收获地址信息
  2 判断用户有没有选购商品
  3 经过以上验证跳转到支付页面
*/

import { getSetting, chooseAddress, openSetting,showModal,showToast } from "../../utils/asyncWx.js";
import regeneratorRuntime from '../../lib/runtime/runtime';
import { request } from "../../request/index.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: {},
    cart: [],
    allChecked: false,
    totalPrice: 0,
    totalNum: 0,
    SkuID:0
  },
  //点击收货地址
  async handleChooseAddress() {
    try {
     
      //获取权限状态
      const res1 = await getSetting();
      const scopeAddress = res1.authSetting["scope.address"];
      //2 判断权限状态
      if (scopeAddress === false) {
        //3 诱导用户 自己打开授权设置页面(wx.openSetting)
        await openSetting();
      }
      //4 调用收货地址的api
      let address = await chooseAddress();
      address.all = address.provinceName + address.cityName + address.countyName + address.detailInfo;
      //5 存入缓存中
      wx.setStorageSync("address", address);

    } catch (error) {
      console.log(error)
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //1 获取缓存中的收货地址信息
    const address = wx.getStorageSync("address");
    //获取缓存中的购物车数据
    const cart = wx.getStorageSync("cart") || [];
    console.log(cart)
    
    this.setData({
      address
    })
    
    this.setCart(cart);

  },
  //商品的选中
  handleItemChange(e) {
    //1 获取被修改的商品的id
    const {id,skulist} = e.currentTarget.dataset;
    console.log(id)
    console.log(skulist)
    //2 获取购物车数组
    let { cart } = this.data;
    //3 找到被修改的商品对象
    let index = cart.findIndex(v=>v.Product.ID===id&&v.skuList.toString()===skulist.toString());
    console.log(index)
    //4 选中状态取反
    cart[index].checked = !cart[index].checked;

    this.setCart(cart);

  },
  //商品的全选功能
  handleItemAllCheck() {
    //1 获取data中的数据
    let { cart, allChecked } = this.data;
    //2 修改值
    allChecked = !allChecked;
    //3 循环修改cart数组中的商品被选中状态
    cart.forEach(v => v.checked = allChecked);
    // 4 把修改后的值 填充回data中或者缓存中
    this.setCart(cart);
  },
  //商品数量的编辑功能
  async handleItemNumEdit(e) {
  
    //1 获取传递过来的参数
    const { operation, id, skulist } = e.currentTarget.dataset;
    console.log(e.currentTarget.dataset)
    //2 获取购物车数组
    let { cart } = this.data;
    //3 找到需要修改的商品的索引

    const index = cart.findIndex(v=>v.Product.ID===id&&v.skuList.toString()===skulist.toString());
    //4 判断是否要执行删除
    if(cart[index].num===1&&operation===-1){
  

      const result =await showModal({content:"您是否要删除商品"});
      if (result.confirm) {
        cart.splice(index,1);
        this.setCart(cart);
      }
    }else{
//4 进行修改数量
cart[index].num += operation;
//5 设置回缓存和data中
this.setCart(cart);
    }
    
  },
  //点击结算
  async handlePay(){
    //1 判断收获地址
    const {address,totalNum}=this.data;
    if(!address.userName){
      await showToast({title:"您还没有选择收获地址"});
      return;
    }
    //判断用户有没有选购商品
    if(totalNum===0){
      await showToast({title:"您还没有选择商品"});
      return;
    }
   
    try {
     
    
     //3跳转到支付页面
    wx.navigateTo({
      url: '/pages/pay/pay',
    });
    } catch (error) {
      // 假成功
      
    await showToast({title:"订单创建失败"})
     
    console.log(error)
    }
  },
  //设置购物车状态的同时 重新计算 底部工具栏的数据 全选 总价格 购买数量
  setCart(cart) {

    let allChecked = true;
    //1 总价格 总数量
    let totalPrice = 0;
    let totalNum = 0;
    let SkuID;

    cart.forEach(v => {
      if (v.checked) {
        totalPrice += v.num * v.goodObj.Price;
        totalNum += v.num;

      } else {
        allChecked = false;
      }
      
    })
    //判断一下数组是否为空
    allChecked = cart.length != 0 ? allChecked : false;
    this.setData({
      cart,
      totalPrice,
      totalNum,
      allChecked,
      SkuID
    });
    wx.setStorageSync("cart", cart);
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