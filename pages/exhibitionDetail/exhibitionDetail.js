//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: false,
    isMask: false,
    banner: {
      autoplay: true,
      interval: 3000,
      duration: 400,
      circular: true,
    },
    current: 1,
    venueList: [],
    productId: '',
    shareType: 0, //0:普通分享;1:分享赚钱
    imgCount: 3,
    downloadProgress: null,//图片加载进度
    shareUserFormId: '', //formId - 分享出去的
    userFormId: '', //带到下一页的formId
    scene: '', //二维码传参
    bookingHotline: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id;
    console.log('options:::', options);
    if (options.id) {
      console.log('链接进入');
      this.setData({
        productId: id
      });
      this._load();
    } else {
      let scene = options.scene;

      this.setData({
        scene: options.scene
      });

      console.log('二维码进入');

      //解析店铺id
      app.dataGet({
        url: 'mobile/fansUserShop/loadInfoByRedisId?redisId=' + scene, success: this.loadInfoByRedisId
      });
    }; 
  },

  venueDetail(res) {
    console.log('详情：：：：', res);
    this.setData({
      venueList: res.data,
      bookingHotline: res.data.bookingHotline,
      isLoad: true
    });
  },

  loadInfoByRedisId(res) {
    console.log('二维码解析:::', res);
    this.setData({
      productId: res.data.productId,
      fansUserShopId: res.data.userShopId,
      userFormId: res.data.shareUserFormId,
    });
    this._load();
  },

  _load() {
    app.dataPost({ url: 'rest/venue/venueDetail?venueId=' + this.data.productId, success: this.venueDetail });
  },

  isLogin() {
    let _this = this;

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        app.dataGet({ url: 'rest/newMallFansUser?code=' + res.code + '&businessId=' + app.globalData.businessId, success: _this.getUserLogin });
      }
    });
  },

  getUserLogin(res2) {
    console.log(res2);

    if (res2.userInfo != '' && res2.userInfo != null && res2.userInfo != undefined && res2.userInfo.sex != '') {
      this.maskShow();
    } else {
      let page = 'detailshare';

      wx.navigateTo({
        url: '../login/login?page=' + page,
      });
    };
  },

  //普通分享-弹窗
  openMask() {
    this.isLogin();
  },

  //分享弹窗
  maskShow() {
    this.setData({
      isMask: !this.data.isMask,
    });
  },

  booking() {
    wx.makePhoneCall({
      phoneNumber: this.data.bookingHotline
    });
  },

  /**
   * 用户点击评价列表的图片 显示预览
   */
  previewEvaImg(e) {
    console.log(e);
    let curr = e.currentTarget.dataset.curr
    let arr = e.currentTarget.dataset.imgs
    wx.previewImage({
      current: curr, // 当前显示图片的http链接
      urls: arr // 需要预览的图片http链接列表
    })
  },

  //图片滚动事件-获取当前滚动页
  onSlideChangeEnd: function (e) {
    var that = this;
    that.setData({
      current: e.detail.current + 1
    })
  },

  enterPage() {
    wx.navigateTo({
      url: '../location/location?venue=' + JSON.stringify(this.data.venueList),
    })
  },

  postForm(e) {
    console.log('商品详情fromid:::', e.detail.formId);

    this.setData({
      shareUserFormId: e.detail.formId
    });
  },

  //分享链接
  onShareAppMessage(res) {
    if (res.from === 'button') {
      this.maskShow();
    };

    let nickName = app.globalData.appName || '游拉拉';

    if (app.globalData.userInfo) {
      nickName = app.globalData.userInfo.nickName
    };
    console.log(this.data.venueList.slideImages[0]);
    return {
      from: 'button',
      title: nickName + '向您推荐 ' + this.data.venueList.name,
      path: '/pages/exhibitionDetail/exhibitionDetail?id=' + this.data.productId,
      imageUrl: this.data.venueList.slideImages[0]
    }
  },

  //分享图片
  share() {
    this.load();
    wx.showLoading({
      title: '图片生成中',
    });
    this.maskShow();
  },

  load() {
    //普通分享
    let productId = this.data.productId;
    let userId = app.globalData.userId;
    let page = 'pages/exhibitionDetail/exhibitionDetail';
    let shareUserFormId = this.data.shareUserFormId;

    let obj = {
      objectId: productId, //商品id
      userId: userId,
      shareUserFormId: shareUserFormId, //formId
      page: page,
      model: 'MallVenue',
      field: 'share_Venue_QrCode',
    };

    console.log(':::', obj);

    app.dataGet({
      url: 'rest/venue/qrCode?objectId=' + obj.objectId + '&userId=' + obj.userId + '&page=' + obj.page + '&model=' + obj.model + '&field=' + obj.field + '&shareUserFormId=' + obj.shareUserFormId, success: this.getQE
    });
  },

  getQE(res) {
    console.log('二维码：');
    console.log(res);
    let obj = {
      nickName: res.data.nickName,
      avatar: res.data.avatarImageUrl,
      goodImg: this.data.venueList.slideImages[0],
      qrcode: res.data.imgUrl,
      productName: this.data.venueList.name,
      oprice: this.data.venueList.realPrice,
      aprice: '',
      text1: '“向您推荐好物”',
      text2: '长按识别小程序码查看详情',
      // shareNum: this.data.mall.shareNum,
      // less: this.data.mall.less,
    }

    this.setData({
      drawInfo: obj
    });

    console.log('商品详情分享图片信息：');
    console.log(this.data.drawInfo);

    //设置下载进度
    this.data.downloadProgress = this.data.imgCount;
    this.loadImg(this.data.drawInfo.avatar, 'avatar');
    this.loadImg(this.data.drawInfo.goodImg, 'goodImg');
    this.loadImg(this.data.drawInfo.qrcode, 'qrcode');
    console.log(this.data.downloadProgress);
  },

  //画图
  draw() {
    let { nickName, avatar, goodImg, qrcode, productName, oprice, aprice, text1, text2, shareNum, less } = this.data.drawInfo;

    // 画白底
    const ctx = wx.createCanvasContext('myCanvas')

    ctx.setFillStyle('#ECF5FF')
    ctx.fillRect(0, 0, 375, 580)

    ctx.drawImage(goodImg, 15, 15, 345, 340)
    ctx.setFillStyle('#000')
    ctx.setFontSize(14)
    ctx.fillText('￥', 20, 390)
    ctx.setFontSize(20)

    // const metrics = ctx.measureText(oprice)
    // const len = metrics.width + 40;

    ctx.fillText(oprice, 32, 390)
    ctx.setFontSize(14)
    // ctx.setFillStyle('#FFA816')
    // ctx.fillText('分享' + shareNum + '砍价，立省' + less + '元', len, 390)

    ctx.setFontSize(14)
    ctx.setFillStyle('#000')
    ctx.fillText(productName.slice(0, 24), 20, 416)
    ctx.fillText(productName.slice(24), 20, 436)

    ctx.setLineJoin('round')
    ctx.setShadow(0, 1, 6, 'rgba(0,0,0,0.15)')
    ctx.setFillStyle('#fff')
    ctx.fillRect(15, 455, 345, 112)
    ctx.setShadow(0, 0, 0, '#fff')
    ctx.setLineJoin('bevel')

    ctx.drawImage(qrcode, 257, 467, 88, 88)

    ctx.setFillStyle('#000')
    ctx.setFontSize(16)
    ctx.setFillStyle('#000')
    ctx.fillText(nickName, 30, 486)
    ctx.setFontSize(16)
    ctx.fillText(text1, 30, 517)
    ctx.setFillStyle('#FFA816')
    ctx.setFontSize(12)
    ctx.fillText(text2, 30, 544)

    // ctx.save()
    // ctx.beginPath()
    ctx.arc(257 + 44, 467 + 44, 20, 0, 2 * Math.PI)
    ctx.setStrokeStyle('#fff')
    ctx.stroke()
    ctx.clip()
    ctx.drawImage(avatar, 257 + 24, 467 + 24, 40, 40)
    // ctx.restore()
    ctx.draw(false, () => {
      setTimeout(() => {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: 375,
          height: 580,
          destWidth: 375 * 3,
          destHeight: 580 * 3,
          canvasId: 'myCanvas',
          success(res) {
            console.log(res);
            let shareList = [];
            shareList[0] = res.tempFilePath;
            wx.hideLoading()
            wx.previewImage({
              current: shareList[0],
              urls: shareList
            })
          }
        })
      }, 100)
    })
  },

  //加载图片进度
  loadImg(url, name) {
    wx.downloadFile({
      url,
      success: res => {
        this.data.downloadProgress--;
        this.data.drawInfo[name] = res.tempFilePath;
        !this.data.downloadProgress && this.draw();
      }
    })
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
})