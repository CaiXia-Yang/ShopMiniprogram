Component({
  properties: {
    showPopup: {
      type: Boolean,
      value: false
    },
    popupColor:Boolean,
    price:  {
      type:String,
      value:''
    },
    selling_intro:  {
      type:String,
      value:''
    },
    img_path: {
      type:String,
      value:''
    },
    goodsName: String,
    curSku: Object,
    skuList: Array,
    specList: {
      type: Array,
      value: []
    },
    skuVname:String,
    skuVal:String,
    specArray:{
      type:Array,
      value:[]
    },
    curSpec: String,
    buyNum: {
      type: Number,
      value: 1,
    },

  },
  data: {
    showPopup: false,
    num: 1,
    id:"",
  },
  methods: {
    //监听radio变化事件
    onChangeSpec: function (event) {
    
      const {specArray,skuList,specList} = this.data;
      specArray[event.currentTarget.dataset.index]=event.detail;
      const {buyNum, goodsName, } = this.data;
      //更新specArray，specArray装的是选中的radio的值（name），是一个数组
      this.setData({
        specArray:specArray,
      });
      const skuVal =  specArray.join(";");
      // 提示用户未选择什么规格
      const unSlectedSku = specList.filter(item => {
        return item.specId != event.currentTarget.dataset.specid
      })[0];
      if(unSlectedSku != undefined){
        const skuTip = "选择 " + unSlectedSku.specName;
        this.setData({ curSpec:skuTip })
      }
      const curSku = skuList.filter(item => (item.skuVal === skuVal))[0];
      // 找到当前规格的商品信息后，更新商品价钱、图片等信息
      if( curSku != undefined){
        this.setData({
          img_path: curSku.imagePath,
          price: curSku.price,
          curSpec:'已选：' + curSku.skuVname,
          curSku: {
            ...curSku,
            goodsName: goodsName,
            buyNum: buyNum,
            },
        });
      }   
    },
  }
})
