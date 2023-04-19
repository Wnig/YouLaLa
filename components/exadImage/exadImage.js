// components/adImage.js
import config from '../../utils/config.js'

Component({
  properties: {
    item: {// 广告数据对象
      type: Object,
      value: {},
    },
    mode: {
      type: String,
      value: '',
    },
  },
  data: {
    imgDomain: config.restUrl,
  },
  methods: {
    enterAd(e) {
      console.log('toAd func');
      if (e.target.dataset.current.isJump == '0') return;
      if (e.target.dataset.current.type == '1') {
        const url = e.target.dataset.current.content;
        wx.navigateTo({
          url: `../ad/ad?url=${url}`,
        });
      } else if (e.target.dataset.current.type == '4') {
        const obj = e.target.dataset.current.content;
        const com = obj;
        wx.navigateTo({
          url: `../exhibitionDetail/exhibitionDetail?id=${com}`,
        });
      } else {
        const obj = e.target.dataset.current.content;
        const com = JSON.stringify(obj);
        wx.navigateTo({
          url: `../details/details?id=${com}`,
        });
      }
    },
  },
});
