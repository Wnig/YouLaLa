//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    latitude: '',
    longitude: '',
    nowLat: '',
    nowLon: '',
    markers: [{
      iconPath: "../../images/icons/db@3x.png",
      id: 0,
      latitude: '',
      longitude: '',
      width: 20,
      height: 31
    }],
    venueList: [],
    distance: '0', //距离（KM）
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      venueList: JSON.parse(options.venue)
    });
    console.log('详情数据:::::', this.data.venueList);

    this.setData({
      ['markers[0].latitude'] : this.data.venueList.lat,
      ['markers[0].longitude']: this.data.venueList.lon,
      latitude: this.data.venueList.lat,
      longitude: this.data.venueList.lon,
      bookingHotline: this.data.venueList.bookingHotline
    });

    let _this = this;
    wx.getLocation({
      success: function (res) {
        _this.setData({
          nowLat: res.latitude, //用户当前位置
          nowLon: res.longitude, //用户当前位置
        });

        _this.setData({
          distance: _this.distance(_this.data.nowLat, _this.data.nowLon, _this.data.latitude, _this.data.longitude)
        });
      },
    });
  },

  booking() {
    wx.makePhoneCall({
      phoneNumber: this.data.bookingHotline
    });
  },

  //两点之间的距离
  distance: function (la1, lo1, la2, lo2) {
    var La1 = la1 * Math.PI / 180.0;
    var La2 = la2 * Math.PI / 180.0;
    var La3 = La1 - La2;
    var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137;//地球半径
    s = Math.round(s * 10000) / 10000;
    
    return s
  },

  avigraph() {
    let address = this.data.venueList.province + this.data.venueList.city + this.data.venueList.county + this.data.venueList.address;
    let _this = this;

    wx.openLocation({
      latitude: _this.data.latitude,
      longitude: _this.data.longitude,
      name: address,
      scale: 28
    });
  },

  getCenterLocation: function () {
    this.mapCtx.getCenterLocation();
  },

  moveToLocation: function () {
    this.mapCtx.moveToLocation();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.mapCtx = wx.createMapContext('map');
    this.getCenterLocation();
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
  
  }
})