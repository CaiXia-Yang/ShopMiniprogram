// pages/goods_detail/goods_detail.js
/* 
1 发送请求获取数据
2 点击轮播图 预览大图
  1 给轮播图绑定一个点击事件
  2 调用小程序的api previewImage
3 点击加入购物车
  1 先绑定点击事件
  2 获取缓存中的购物车数据 数组格式
  3 先判断当前商品是否已经存在购物车 
  4 如果存在  修改商品数据 执行购物车数量++  重新把购物车数组填充回缓存中
  5 不存在于购物车的数组中 直接给购物车数组添加一个新元素 带上购买数量 属性 num 重新把购物车数组填充回缓存中
  6 弹出提示
4 商品收藏
  1 页面onShow的时候 加载缓存中的商品收藏的数据
  2 判断当前商品是不是被收藏
    1 是 改变页面的图标
    2 不是。
  3 点击商品收藏按钮
    1 判断该商品是否存在于缓存数组中
    2 已经存在的把该商品删除
    3 没有存在 把商品添加到收藏数组中 存入到缓存中即可
*/
import { request } from "../../request/index.js";
import regeneratorRuntime from '../../lib/runtime/runtime';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showSku:false,
    // 商品是否被收藏
    isCollect:false,

    product:{},
    proSkus:[],
    skuDisInfo:"",
    num:1,
    active: 0,
    goodObj:{},
    // 是否加入购物车
    isAddCart:true,
    skuList:[],
    attrs:{}
  },
  // 改变标签页
  onChange(event) {
 
  },
  // 关闭sku弹框
  onClose() {
    this.setData({ showSku: false });
  
  },
//商品对象
GoodsInfo:{},

onShow: function () {
    let pages =  getCurrentPages();
    let currentPage=pages[pages.length-1];
    let options=currentPage.options;
    const {goods_id}=options;
    console.log(goods_id)
    this.getGoodsSku(goods_id);
  },
// 选中规格
handleSkuChange(event){
  const {attrname,attrvalue}=event.currentTarget.dataset
  console.log(this.data)
  let {product} = this.data
  let {proSkus}=this.data
  product.ProductSkuValues.forEach(v=>{
    if(v.name==attrname){
      v.selectedValue=attrvalue
    }
  })
  this.setData({
    product
  })
  let skuDisInfo=""
  let skuList=[]
  product.ProductSkuValues.forEach(v=>{
   console.log(v)
    if(v.selectedValue!=null){
      skuDisInfo+=v.selectedValue+" "
      skuList.push(v.selectedValue)
      //判断颜色
      if(v.IsImg==1){
        v.values.forEach(item=>{
          if(v.selectedValue==item.value){
            this.setData({
              "goodObj.Img":item.img.CloudUrl
            })
          }
        })
      }
    }
  })
  this.setData({
    skuList
  })
    //判断价格
    proSkus.forEach(v=>{
      v.ProductSkuValues=[]
      JSON.parse(v.ProductSku1).forEach(v_sku=>{
        v.ProductSkuValues.push(v_sku.value)
      })
      console.log(skuList.toString())
      console.log(v.ProductSkuValues.toString())
      if(skuList.toString()==v.ProductSkuValues.toString()){
        console.log(v.Price)
        this.setData({
          'goodObj.Price':v.Price,
          'goodObj.Stock':v.Stock
        })
      }
    })
    

  if(skuDisInfo!=""){
    this.setData({
      skuDisInfo:"已选择 "+skuDisInfo
    })
  }
},
//获取商品详情数据,sku
async getGoodsSku(goods_id){
  console.log(goods_id)
  const resData=await request({url:"/Product/GetSku",data:{"id":goods_id},method:"get"});
  this.GoodsInfo=resData;

     //1 获取缓存中的商品收藏的数组
     let collect=wx.getStorageSync("collect")||[];
     //2 判断当前商品是否被收藏
     let isCollect=collect.some(v=>v.goods_id===this.GoodsInfo.goods_id);

  resData.Product.ProductMainImg=JSON.parse(resData.Product.ProductMainImg)[0]
  resData.Product.ProductSlideImgs=JSON.parse(resData.Product.ProductSlideImgs)
  resData.Product.ProductDetail=JSON.parse(resData.Product.ProductDetail)
  resData.Product.ProductSkuValues=JSON.parse(resData.Product.ProductSkuValues)

 console.log(resData.Product.ProductMainImg)
  let skuDisInfo="请选择"
  resData.Product.ProductSkuValues.forEach(v=>{
    v.selectedValue=null
    skuDisInfo+=v.name+" "
  })
  resData.Attrs.forEach(v=>{
    console.log(v.ProductAttrs)
    v.ProductAttrs=JSON.parse(v.ProductAttrs)
  })
  console.log(resData.Attrs)
  this.setData({
    product:resData.Product,
    skus:resData.SkuValues,
    proSkus:resData.Skus,
    skuDisInfo:skuDisInfo,
    isCollect,
    attrs:resData.Attrs
  })
},

//点击轮播图放大预览
handlePrevewImage(e){
  console.log(this.data.product.ProductSlideImgs)
  // 1 先构造要预览的图片数组 
  var ProductSlideImgs = this.data.product.ProductSlideImgs
  const urls = []
  ProductSlideImgs.forEach(v => {
    urls.push(v.CloudUrl)
  })
  //2 接收传递过来的图片url
  const current=e.currentTarget.dataset.url;
  wx.previewImage({
    current, // 当前显示图片的http链接
    urls// 需要预览的图片http链接列表
  })
},
// 规格信息
handleSkuList(){
  this.setData({
    showSku:true,
    isAddCart:false
  })
},
// 点击变化数量
async handleItemNumEdit(e){
  const {operation}=e.currentTarget.dataset;
  let num=this.data.num;
  if(num==1){
    if(operation>0){
      num+=operation;
    }
  }else{
    num+=operation;
  }
  this.setData({
    num,
  })
},


//点击加入购物车
handleCartAdd(){
  this.setData({
    showSku:true,
    isAddCart:true
  })
},
// 确认加入购物车
handleAffirm(){
  //1 获取缓存中的购物车 数组
  let cart=wx.getStorageSync("cart")||[];
  //2 判断商品对象是否存在于购物车数组中
  console.log(this.GoodsInfo)
  let index=cart.findIndex(v=>v.Product.ID===this.GoodsInfo.Product.ID&&v.skuList.toString()==this.data.skuList.toString());
  if(index===-1){
    //3 不存在 第一次添加
    this.GoodsInfo.num=this.data.num;
    this.GoodsInfo.checked=true;
    this.GoodsInfo.skuDisInfo=this.data.skuDisInfo;
    this.GoodsInfo.skuList=this.data.skuList;
    this.GoodsInfo.goodObj=this.data.goodObj;
    cart.push(this.GoodsInfo);
  }else{
    //4 已经存在购物车数据执行 num++
    cart[index].num+=this.data.num;
  }
  //5 购物车重新添加到缓存中
  wx.setStorageSync("cart", cart);
  // 6 弹框提示
  wx.showToast({
    title: '加入成功',
    icon: 'success',
    //true 防止用户疯狂点击按钮
    mask: true
  });
},
//点击商品收藏图标的事件
handleCollect(){
  let isCollect;
  //1 获取缓存中的商品收藏数组
  let collect=wx.getStorageSync("collect")||[];
  //2 判断该商品是否被收藏
  let index=collect.findIndex(v=>v.goods_id===this.GoodsInfo.goods_id);
  //3 当index！=-1表示 已经被收藏过
  if(index!=-1){
    //能找到 已经收藏过了 在数组中删除该商品
    collect.splice(index,1);
    isCollect=false;
    wx.showToast({
      title: '取消成功',
      icon: 'success',
      mask: true,
    });
  }else{
    //没有收藏过
    collect.push(this.GoodsInfo);
    isCollect=true;
    wx.showToast({
      title: '收藏成功',
      icon: 'success',
      mask: true,
    });
  }
  //4 把数组存入到缓存中
  wx.setStorageSync("collect",collect);
  //5 修改data中的属性 isCollect
    this.setData({
      isCollect
    })
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

