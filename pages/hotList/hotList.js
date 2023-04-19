//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasMore: true,
    productList: [], //精选-人气推荐
    pageNum: 0, //当前页
    pageSize: 10, //显示几条
    totalPage: 0, //总页数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  //加载人气推荐
  loadPopular() {
    if (this.data.hasMore) {
      let postData = {
        businessId: app.globalData.businessId,
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize
      }
      app.dataPost({ url: 'rest/product/homePageContent', data: postData, success: this.getPopular });
    }
  },

  //获取人气推荐数据
  getPopular(res) {
    console.log('人气推荐::::', res);
    if (!res.data.popularRecommend.productList && res.status == 1) {
      // 首先判断是否有返回数据 没有返回数据则表示没有更多数据了 要将hasMore设为false
      this.setData({ hasMore: false });
      return;
    }

    // 将pageNum 加一 然后判断返回的data长度是否小于pageSize 小于pageSize说明无更多数据要将hasMore设为false
    let productList = this.data.productList;
    let pageNum = this.data.pageNum;
    let pageSize = this.data.pageSize;

    res.data.popularRecommend.productList.forEach(arr => {
      productList.push(arr);
    });
    // console.log(res.data.popularRecommend.totalPage);
    if (pageNum + 1 == res.data.popularRecommend.totalPage && (res.data.popularRecommend.productList.length < pageSize || res.data.popularRecommend.productList.length == pageSize)) {
      this.setData({ hasMore: false })
    } else if (res.data.popularRecommend.productList.length < pageSize) {
      this.setData({
        hasMore: false,
      });
    } else {
      pageNum++;
    };


    this.setData({
      pageNum: pageNum,
      classifyMenuLabel: res.data.popularRecommend.label,
      productList: productList,
      isLoad: true
    });

  },

  //进入商品详情页面
  enterDetail(e) {
    let commodity = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../details/details?id=' + JSON.stringify(commodity)
    });
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
    this.loadPopular();
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
    this.loadPopular();
  },

})