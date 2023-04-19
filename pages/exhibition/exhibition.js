//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: false,
    isAdd: false,
    adList: [], //轮播图
    categoryList: [], //分类菜单
    productList: [], //精选-人气推荐
    pageNum: 0, //当前页
    pageSize: 20, //显示几条
    totalPage: 0, //总页数
    indicatorDots: true,
    autoplay: true,
    scrollTop: 0,
    hasMore: true,//人气推荐是否加载完
    interval: 3000,
    duration: 400,
    circular: true,
    current: 1,
    bookingHotline: '', //预订热线
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  _loadData() {
    //广告
    let position = 4;
    app.dataGet({ url: 'rest/product/findAdImage?position=' + position + '&businessId=' + app.globalData.businessId, success: this.findAdImage });

    let postData = {
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    }
    app.dataPost({ url: 'rest/venue/venuePageContent', data: postData, success: this.venuePageContent });
  },

  findAdImage(res) {
    console.log('广告', res);
    this.setData({
      adList: res.data
    });
  },

  //首页数据
  venuePageContent(res) {
    console.log('会展首页::', res);
    if (res.status == 1) {
      this.setData({
        bookingHotline: res.data.bookingHotline,
        categoryList: res.data.firstCategoryList
      });

      if (res.data.firstCategoryList == '' && res.data.venueHotList == '') {
        this.setData({
          isAdd: false
        });
      } else {
        this.setData({
          isAdd: true
        });
      };

      this.loadPopular();
    };
  },

  booking() {
    wx.makePhoneCall({
      phoneNumber: this.data.bookingHotline 
    });
  },

  enterPage(e) {
    let id = e.currentTarget.dataset.id;
    let name = e.currentTarget.dataset.name;

    wx.navigateTo({
      url: '../meeting/meeting?id='+ id + '&name=' + name,
    })
  },

  //加载人气推荐
  loadPopular() {
    if (this.data.hasMore) {
      let postData = {
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize
      }
      app.dataPost({ url: 'rest/venue/venuePageContent', data: postData, success: this.getPopular });
    }
  },

  //获取人气推荐数据
  getPopular(res) {
    console.log('人气推荐::::', res);
    if (!res.data.venueHotList && res.status == 1) {
      // 首先判断是否有返回数据 没有返回数据则表示没有更多数据了 要将hasMore设为false
      this.setData({ hasMore: false });
      return;
    }

    // 将pageNum 加一 然后判断返回的data长度是否小于pageSize 小于pageSize说明无更多数据要将hasMore设为false
    let productList = this.data.productList;
    let pageNum = this.data.pageNum;
    let pageSize = this.data.pageSize;

    res.data.venueHotList.forEach(arr => {
      productList.push(arr);
    });

    if (pageNum + 1 == res.data.totalPage && (res.data.venueHotList.length < pageSize || res.data.venueHotList.length == pageSize)) {
      this.setData({ hasMore: false })
    } else if (res.data.venueHotList.length < pageSize) {
      this.setData({
        hasMore: false,
      });
    } else {
      pageNum++;
    };


    this.setData({
      pageNum: pageNum,
      productList: productList,
      isLoad: true
    });

  },

  //图片滚动事件-获取当前滚动页
  onSlideChangeEnd: function (e) {
    var that = this;
    that.setData({
      current: e.detail.current + 1
    })
  },

  //进入详情页
  enterDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../exhibitionDetail/exhibitionDetail?id=' + id,
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
    this._loadData();
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
    this.setData({ hasMore: true, pageNum: 0, productList: [] });
    this._loadData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
})