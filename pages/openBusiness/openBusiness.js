import { Config } from '../../utils/config'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    classify: [],
    imgAry: {
      business_Logo_Image_Id: '',
      business_License_Image_Id: ''
    },
    classifyText: '',
    info: {
      name: '',
      businessCategoryId: '',
      contactsName: '',
      phone: '',
      contactsEmail: '',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ banner: app.globalData.serviceField.openBusinessCoverImage});

    app.dataGet({ url: 'mobile/fansUser/openBusiness', success: this.openBusiness });
  },

  openBusiness(res) {
    console.log(res);
    this.setData({ classify: res });
  },

  /**
   * 图片选择(logo、执照、许可证)
   */
  selectImg (e) {
    let item = e.currentTarget.dataset.item
    let imgAry = this.data.imgAry
    wx.chooseImage({
      count: 1,
      success: res => {
        imgAry[item] = res.tempFilePaths[0]
        this.setData({ imgAry: imgAry })
      }
    })
  },

  /**
   * 全部输入框的失焦事件
   */
  infoBlur (e) {
    let key = e.currentTarget.dataset.key
    let value = e.detail.value
    let info = this.data.info
    info[key] = value
    this.setData({ info: info })
  },

  /**
   * 执照、许可证图片预览
   */
  preview (e) {
    let item = e.currentTarget.dataset.item
    let imgAry = this.data.imgAry
    wx.previewImage({
      urls: [imgAry[item]]
    })
  },

  /**
   * 执照、许可证图片删除
   */
  deleteImg (e) {
    let item = e.currentTarget.dataset.item
    let imgAry = this.data.imgAry
    imgAry[item] = ''
    this.setData({ imgAry: imgAry })
  },

  /**
   * 分类选项的changge事件
   */
  selectClassify (e) {
    this.setData({ classifyText: this.data.classify[e.detail.value].name, 'info.businessCategoryId': this.data.classify[e.detail.value].id})
  },

  /**
   * 拨打客服电话
   */
  callPhone () {
    wx.makePhoneCall({
      phoneNumber: app.globalData.serviceField.openBusinessCustomerTelephone
    })
  },

  /**
   * 开通
   */
  open () {
    let status = this.checkInfo()
    if (status == 'complate') {
      // this.uploadImg()
      this.uploadInfo()
    } else {
      wx.showToast({
        title: status,
        icon: 'none',
        duration: 2000
      })
    }
  },

  /**
   * 检查信息是否完善
   */
  checkInfo () {
    let imgAry = this.data.imgAry
    let info = this.data.info;
    let regPhone = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    if (info.name == '') {
      return '请输入商户名称'
    } else if (info.contactsName == '') {
      return '请输入联系人姓名'
    } else if (info.phone == '') {
      return '请输入联系人手机号'
    } else if (!regPhone.test(info.phone)) {
      return '请输入正确手机号'
    };
    return 'complate'
  },

  /**
   * 上传图片
   */
  uploadImg (cb) {
    let imgAry = this.data.imgAry
    let info = this.data.info
    let len= 0
    let num = 0
    for (let i in imgAry) {
      len ++
    }
    for(let k in imgAry) {
      wx.uploadFile({
        url: Config.restUrl + 'rest/upload/uploadImage',
        filePath: imgAry[k],
        name: 'file',
        formData: {
          model: 'MallBusiness',
          field: k
        },
        success: res => {
          let imgId = JSON.parse(res.data).imageId
          info[k] = imgId
          this.setData({ info: info })
          num ++
          if (num == len) {
            this.uploadInfo()
          }
        }
      })
    }
  },

  /**
   * 上传信息
   */
  uploadInfo () {
    let info = this.data.info
    let postData = {}
    for (let k in info) {
      // if (info[k] == '') {
      //   wx.showToast({
      //     title: '提交失败',
      //     icon: 'none'
      //   })
      // }
      if (k == 'business_Logo_Image_Id') {
        postData['logoImageId'] = info[k]
      } else if (k == 'business_License_Image_Id') {
        postData['businessLicenseImageId'] = info[k]
      } else if (k == 'business_Permit_Image_Id') {
        postData['permitImageId'] = info[k]
      } else {
        postData[k] = info[k]
      }
    };

    app.dataPost({ url: 'mobile/fansUser/openBusiness', data: postData, success: this.openBusinessBtn });
  },

  openBusinessBtn(res) {
    console.log(res);
    if (res.msg && res.data != '') {
      wx.showToast({
        title: res.data.msg,
        icon: 'none'
      })
    } else {
      let time = new Date().valueOf()
      wx.setStorage({
        key: "openBusinesstime",
        data: time
      })
      wx.redirectTo({
        url: '../openBusinessRes/openBusinessRes'
      })
    }
  },

  enterPage (e) {
    let url = e.currentTarget.dataset.link
    wx.navigateTo({
      url: url
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '打造您的专属互联网平台！马上开通商户账号！！！',
      path: '/pages/openBusiness/openBusiness'
    }
  }
})