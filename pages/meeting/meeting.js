//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: false,
    mf: '0', // 顶部菜单导航选中下标 默认为0
    menu: [],
    hasMore: true,//人气推荐是否加载完
    isLoad: false,
    adList: [], //轮播图
    categoryList: [], //分类菜单
    productList: [], //精选-人气推荐
    pageNum: 0, //当前页
    pageSize: 8, //显示几条
    totalPage: 0, //总页数
    thisNav: 0,
    firstCategoryId: '', //一级分类id
    secondCategoryId: '', //二级分类id
    titlename: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      venueCategoryId: options.id,
      firstCategoryId: options.id,
      titlename: options.name
    }); 

    this.setTitleText(this.data.titlename);

    let postData = {
      venueCategoryId: this.data.venueCategoryId,
    }
    app.dataPost({ url: 'rest/venue/secondCategoryList', data: postData, success: this.venueCategoryList });
  },

  /**
 * 动态设置顶部title
 */
  setTitleText(word) {
    wx.setNavigationBarTitle({
      title: word
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  venueCategoryList(res) {
    console.log('菜单:::', res);
    this.setData({
      menu: res.data
    });
  },

  _loadData() {
    let postData = {
      firstCategoryId: this.data.firstCategoryId,
      secondCategoryId: this.data.secondCategoryId,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    }

    app.dataPost({ url: 'rest/venue/venueCategoryList', data: postData, success: this.venueCategoryLists });
  },

  //列表数据
  venueCategoryLists(res) {
    console.log('列表数据：：：', res);
    if (res.status == 1) {
      if (!res.data.venueCategoryList && res.status == 1) {
        // 首先判断是否有返回数据 没有返回数据则表示没有更多数据了 要将hasMore设为false
        this.setData({ hasMore: false });
        return;
      }

      // 将pageNum 加一 然后判断返回的data长度是否小于pageSize 小于pageSize说明无更多数据要将hasMore设为false
      let productList = this.data.productList;
      let pageNum = this.data.pageNum;
      let pageSize = this.data.pageSize;

      if (this.data.loadType == 1) {
        res.data.venueCategoryList.forEach(item => {
          productList.push(item);
        });
      } else {
        productList = res.data.venueCategoryList;
      };

      this.setData({
        productList: productList,
        isLoad: true,
      });

      if (pageNum + 1 < res.data.totalPage) {
        pageNum++;
        this.setData({ pageNum: pageNum, hasMore: true });
      } else {
        this.setData({ hasMore: false });
      };
    };
  },

  //进入详情页
  enterDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../exhibitionDetail/exhibitionDetail?id=' + id,
    });
  },

  /**
   * 订单顶部菜单导航点击事件
   */
  screen: function (e) {
    let current = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;
    console.log(id);
    this.setData({ 
      thisNav: current,
      secondCategoryId: id,
      pageNum: 0,
    });
    this._loadData();
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
    if (this.data.hasMore) {
      this.setData({
        loadType: 1
      });
      this._loadData();      
    }

  },
})