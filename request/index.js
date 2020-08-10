//同时发送异步代码的次数
let ajaxTimes = 0;
export const request = (params) => {


    ajaxTimes++;
    //显示正在加载的图标效果
    wx.showLoading({
        title: "加载中",
        mask: true
    });
    //定义公共的url
    const baseUrl = "http://localhost:50348/api";
    let token = wx.getStorageSync('token')
    let expire = wx.getStorageSync('expire')
    let header = {
        'content-type': 'application/json'
    }
    if(params.url.includes("/orders/")){
        if (token) {
            header['Authorization'] = token.data
          
        } 
        else{
            wx.navigateTo({
                url: '/pages/login/login'
            });
            return
        }
    }
 
    return new Promise((resolve, reject) => {
        wx.request({
            ...params,
            header: header,
            url: baseUrl + params.url,
            success: (result) => {
                console.log(result)
                if (result.statusCode == 200 && result.data.Code == 200) {
                    resolve(result.data.Data);
                } 
                else if (result.statusCode == 401 || result.statusCode == 500 || result.data.Code == 500) {
                    if(result.statusCode == 401){
                        console.log("401未授权")
                    }
                    if(result.statusCode == 500){
                        console.log("500错误")
                    }
                    if(result.data.Code == 500){
                        console.log("result.data.Code500")
                    }
                    //获取refreshToken
                    const refreshToken = wx.getStorageSync('refreshToken');
                    const refreshExpire = wx.getStorageSync('refreshExpire');
                    if (!refreshToken.data || Date.now() - refreshToken.time > refreshExpire) { //refreshToken过期
                        console.log("中间跳转登录")
                        wx.navigateTo({
                            url: '/pages/login/login'
                        });
                        return
                    }
                    //刷新token
                    wx.request({
                        url: baseUrl + '/auth/getTokenByRefreshToken',
                        data: {rToken: refreshToken.data},
                        header: {'content-type': 'application/json'},
                        method: 'GET',
                        success: (result) => {
                            console.log("401错误刷新token")
                            if (result.data.Code == 500) {
                                console.log("下面跳转登录")
                                wx.navigateTo({
                                    url: '/pages/login/login'
                                });
                                return
                            }
                            wx.setStorageSync("token", {
                                time: Date.now(),
                                data: result.data.Data.Token
                            });
                            wx.setStorageSync("refreshToken", {
                                time: Date.now(),
                                data: result.data.Data.RefreshToken
                            });

                            //携带新的token重新发起请求
                            var reqTask = wx.request({
                                ...params,
                                url: baseUrl + params.url,
                                header: {
                                    'content-type': 'application/json',
                                    'Authorization': result.data.Data.Token
                                },
                                success: (result) => {

                                    resolve(result.data.Data)
                                }
                            });


                        }
                    });
                }
            },
            fail: (err) => {
                reject(err);
            },
            complete: () => {
                ajaxTimes--;
                if (ajaxTimes === 0) {
                    //关闭正在等待的图标
                    wx.hideLoading();
                }


            }
        });
    })
}