/**
 1 页面加载的时候
  1 从缓存中获取购物车数据 渲染到页面中
    这些数据 checked=true
  2 微信支付
    1 那些人 那些账号 可以实现微信支付
      1 企业账号
      2 企业账号的小程序后台中 必须 给开发者 添加上白名单
        1 一个 appid可以同时绑定多个开发者
        2 这些开发者就可以共用这个appid 和他的开发权限
  3 支付按钮
    1 先判断缓存中有没有token
    2 没有 跳转到授权页面 进行获取token
    3 有token  
    4 创建订单，获取订单编号 
    5 已经完成了微信支付
    6 手动删除缓存中已经被选中的商品
    7 删除后的购物车数据 填充回缓存
    8 在跳转页面
 */
import { getSetting, chooseAddress, openSetting,showModal,showToast,requestPayment } from "../../utils/asyncWx.js";
import regeneratorRuntime from '../../lib/runtime/runtime';
import { request } from "../../request/index.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: {},
    cart: [],
    totalPrice: 0,
    totalNum: 0
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //1 获取缓存中的收货地址信息
    const address = wx.getStorageSync("address");
    //获取缓存中的购物车数据
    let cart = wx.getStorageSync("cart") || [];
    //过滤后的购物车数组
    cart=cart.filter(v=>v.checked);
    cart.forEach(v=>{
      v.Skus.forEach(v2=>{
        if(v.skuList.toString()==v2.ProductSkuValues.toString()){
          console.log(v2.ID)
          v.SkuID=v2.ID
        }
      })
    })
    this.setData({
      address
    })
  //1 总价格 总数量
  let totalPrice = 0;
  let totalNum = 0;
  cart.forEach(v => {
    totalPrice += v.num * v.goodObj.Price;
      totalNum += v.num;
  })
  this.setData({
    cart,
    totalPrice,
    totalNum,
    address
  });

  },
  //点击 支付
  async handleOrderPay(){
    try {
       //1 判断缓存中有没有token
    const token=wx.getStorageSync("token");
    //2 判断
    if(!token){
      wx.navigateTo({
        url: '/pages/auth/auth',
      });
        return;
    }
    //3 创建订单
    //3.1 准备 请求头函数
    //3.2 准备 请求体参数
    const OrderPrice=this.data.totalPrice;
    const ShippingAddress=this.data.address.all;
    
    const OrderStatus=1
    const cart=this.data.cart.filter(v=>v.checked);
    
    let OrdersSides=[];
    cart.forEach(v=>{
      console.log(v.SkuID)
    })
    cart.forEach(v=>OrdersSides.push({
      ProductID:v.Product.ID,
      ProdectNum:v.num,
      ProductPrice:v.goodObj.Price,
      SkuID:v.SkuID,
      Skus:v.skuList.toString()
    }))
    const ordersVModel={OrderPrice,OrderStatus,ShippingAddress,OrdersSides};
    console.log(ordersVModel);
    //4 准备发送请求  创建订单  获取订单编号
    const resData=await request({url:"/orders/create",method:"POST",data:ordersVModel})
    console.log(resData)

      
      
    await showToast({title:""+resData})
   
    } catch (error) {
      // 假成功
      
    await showToast({title:"支付失败"})
     //8 手动删除缓存中 已经选中的数据
    //  let newCart=wx.getStorageSync("cart");
    //  newCart=newCart.filter(v=>!v.checked);
    //  wx.setStorageSync("cart", newCart);
    // wx.navigateTo({
    //   url: '/pages/order/order?type=1',
    // });
      console.log(error)
    }

  }
 
})