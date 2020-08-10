// pages/goods_list/goods_list.js
/* 
1 用户上滑页面 滚动条触底 开始加载下一页数据
  1 找到滚动条触底事件 开发文档找
  2 判断是否还有下一页数据
    1 获取到总页数 只有总条数
    总页数=Math.ceil(总条数 / 页容量 pagesize)
    
    2 获取到当前页码  pagenum
    3 判断一下当前页码是否大于等于总页数 表示没有下一页数据

  3 假如没有下一页数据弹出提示
  4 假如还有下一页数据 来加载下一页数据
    1 当前页码 ++
    2 重新发送请求
    3 数据请求回来 要对data中的数组进行拼接 而不是全部替换
2 下拉刷新页面
  1 触发下拉刷新事件  需要在页面json文件中开启一个配置项
  2 重置数据数组
  3 重置页码 设置为1
  4 重新发送请求
  5 数据请求回来 需要手动的关闭 等待效果
*/
import {
  request
} from "../../request/index.js";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [{
        id: 0,
        value: "综合",
        isActive: true
      },
      {
        id: 1,
        value: "销量",
        isActive: false
      },
      {
        id: 2,
        value: "价格",
        isActive: false
      },
    ],
    keywords: '',
    productList: []
  },

  //接口要的参数
  QueryParams: {
    keyWord: "",
    pageIndex: 1,
    pageSize: 10,
  },
  handleChange(e) {
    console.log(e.detail.value)
    this.QueryParams.keyWord = e.detail.value || "";
    this.setData({
      productList: []
    })
    this.getGoodList();
  },
    // 输入框的值改变触发的事件
    handleInput(e){
      //1 获取输入框的值
      const {value}=e.detail;
      //2 检测合法性
      if(!value.trim()){
        this.setData({
          productList:[]
        })
        //值不合法
        return;
      }
      this.QueryParams.keyWord = value || "";
       clearTimeout(this.TimeId);
       this.TimeId=setTimeout(()=>{
         this.setData({
          productList:[]
         })
        this.getGoodList();
       },1000);
    },
  handleCancel(e) {
    this.setData({
      keywords:"",
      productList:[]
    })
  },
  //标题的点击事件 从子组件传递过来
  handleTabsItemChange(e) {
    //1 获取被点击的标题索引
    const {
      index
    } = e.detail;
    //2 修改原数组
    let {
      tabs
    } = this.data;
    tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false);
    //3 赋值到data
    this.setData({
      tabs
    })
  },

  //总页数
  totalPages: 1,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.keywords)
    this.QueryParams.keyWord = options.keywords || "";
    this.getGoodList();
    this.setData({
      keywords: options.keywords
    })
  },
  //获取商品列表的数据
  async getGoodList() {
    const res=await request({url:"/Product",method:'post',data:this.QueryParams});
    
    //获取总条数
    const total=res.total;
    console.log(res.total)
    //计算总页数
    this.totalPages=Math.ceil(total/this.QueryParams.pageSize);
    // console.log("总页数："+this.totalPages);
    const productList=res.data
    console.log(productList);
    productList.forEach(v=>{
      console.log(v)
      v.ProductMainImg=JSON.parse(v.ProductMainImg)[0]
      console.log(v.ProductMainImg)
    })
    console.log(productList)
    console.log(this.data.productList)
    this.setData({
      //拼接了的数组
      productList:[...this.data.productList,...productList]
    })
    console.log(this.data.productList)
    //关闭下拉刷新的窗口  如果没有调用下拉刷新的窗口 直接关闭也不会报错
    wx.stopPullDownRefresh();

  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    //1 判断还有没有下一页数据
    if (this.QueryParams.pageIndex >= this.totalPages) {
      wx.showToast({
        title: '没有下一页数据了'
      });

    } else {
      this.QueryParams.pageIndex++;
      this.getGoodList();
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    //1 重置数组
    this.setData({
      productList: []
    })
    //2 重置页码
    this.QueryParams.pageIndex = 1;
    //3 发送请求
    this.getGoodList();
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})