<template>
  <div>
    <div id = "image">
      <van-image
        fill="true"
        :src="data.loginImages.length > 0? data.loginImages[0]: ''"
      />
      <div class="circular image-title" @click="shareFriend">
        <i class = "van-icon-share-o van-icon"></i>
      </div>
      <div class="rectangle image-title">
        <span>ID: {{data.id}}</span>
      </div>
    </div>
    <div id = "content">
      <jin-basic-info
      :carNumber="data.carNumber"
      :carModel="data.carModel"
      :amount = "data.amount"
      >
      </jin-basic-info>
      <!-- 标记组 -->
      <jin-marks :marks="data.marks">
      </jin-marks>
      <!-- 看板组 -->
      <jin-board
      :datas = "comTimes"
      :btn="comReceiveText"
      @button-click="receiveTap">

      </jin-board>
      <!-- 客户评价 -->
      <jin-customer
      :imgSrc="data.imgSrc"
      :customerName="data.customerName"
      :customerType="data.customerType"
      :scoreTime="data.scoreTime"
      :scoreValue="data.scoreValue"
      :evaluate="data.evaluate"
      >
      </jin-customer>
      <!-- 故障描述 -->
      <div class="fault-description" v-if="data.fault_info">
        <div class="title">
          故障描述
        </div>
        <div class="content">
          {{data.faultDescription}}
        </div>
      </div>
      <!-- 施工进度 -->
       <div class="img-title">
        施工进度
      </div>
      <jin-work-progress
      :datas="data.workProgress"
      :startDt="data.startDt"
      :endDt="data.endDt"
      >
      </jin-work-progress>
      <!-- 施工流程 -->
       <div class="img-title">
        施工流程
      </div>
      <div style="padding:0 10px; font-size: 3px;">
        <van-steps :active="data.rateProgress.active" active-icon="success" active-color="#38f" style="font-size: 1px;">
          <van-step v-for="(item, key) in data.rateProgress.data" :key="key">{{item}}</van-step>
        </van-steps>
      </div>
      <!-- 维修列表 -->
      <jin-repair-list
      :title="data.repairType"
      :amount="data.amount"
      :datas="data.repairDatas"
      >
      </jin-repair-list>
      <!-- 质检评价组 -->
      <div v-if="data.inspects && data.inspects.length" class="inspect-wrapper" >
        <div class="img-title">
          质检评价
        </div>
        <div class="score">
          <div class="rate">
            <van-rate v-model="data.inspects.at(-1).score" size="15" readonly />
          </div>
          <span>{{ data.inspects.at(-1).score }}</span>
        </div>
        <div class="inspect-info">
          {{ data.inspects.at(-1).info}}
        </div>
      </div>
      <!-- 图片展示组 -->
      <div class="img-title">
      登记图片
      </div>
      <jin-images-board
      :images = "data.loginImages"
      :arrowDirection = "false"
      >
      </jin-images-board>
      <!--自传送图片展示组 -->
      <div v-show="constructionImages.length">
        <div class="img-title">
         施工图片
        </div>
        <jin-images-board
        :images = "constructionImages"
        :arrowDirection = "false"
        >
        </jin-images-board>
      </div>
      <!-- 备注组 -->
      <div class="img-title">
        备注
      </div>
      <jin-remarks
      :content="data.remarks"
      :maxCharactersNumber=140
      @on-change="changeRemarks"
      >
      </jin-remarks>
      <!-- 按钮组 -->
      <div class="button-wrapper">
        <!--<div class="button-con">
          <van-button type="default" style="width: 80%; border: 1px solid #1989fa; color: #1989fa;" ></van-button>
        </div>-->
        <div class="button-con">
          <van-button type="info" icon="photo-o" style="background-color: #1989fa; color: white; width: 80%;" @click="onOff_imagePop=!onOff_imagePop" >添加图片</van-button>
        </div>
        <div class="button-con">
          <van-button type="info" icon="chat-o" style="background-color: #1989fa; color: white; width: 80%;" @click="toMessage" >发送信息</van-button>
        </div>
      </div>
    </div>
    <div class="white-space"> </div>
    <!-- 上传弹窗组 -->
    <jin-upload-pop
    :show.sync="onOff_imagePop"
    :files.sync="data.images"
    explain = "上传图片时请保持横向"
    @upload="uploadImage"
    @delete = "deleteImage"
    >

    </jin-upload-pop>

  </div>
</template>
<script>
import axios from 'axios'
import { Popup, Image as VanImage, Step, Steps, Dialog, Rate } from 'vant';
import { URL } from '@/web-config/apiUrl'
// import { isUrl } from '@/utils/CheckUtils';
import conf from '@/web-config/index';
import JinBasicInfo from '@/components/JinBasicInfo';
import JinMarks from '@/components/JinMarks';
import JinBoard from '@/components/JinBoard';
import JinCustomerScore from '@/components/JinCustomerScore';
import JinRepairList from '@/components/JinRepairList';
import JinImagesBoard from '@/components/JinImagesBoard';
import JinWorkProgress from '@/components/JinWorkProgress';
import JinRemarksText from '@/components/JinRemarksText';
import JinImageUploadPop from '@/components/JinImageUploadPop';
import wx from 'weixin-js-sdk';


// moudle 对象传送门https://www.cnblogs.com/tian-xie/p/7754186.html
export default {
  name: 'construction',
  mixins : [ require ( "@/mixins" ).default ],
  components: {
    Popup,
    'van-image': VanImage,
    'jin-basic-info': JinBasicInfo,
    'jin-marks': JinMarks,
    'jin-board': JinBoard,
    'jin-customer': JinCustomerScore,
    'jin-repair-list': JinRepairList,
    'jin-images-board': JinImagesBoard,
    'van-steps': Steps,
    'van-step': Step,
    'jin-work-progress': JinWorkProgress,
    'jin-remarks': JinRemarksText,
    'jin-upload-pop': JinImageUploadPop,
    "van-rate": Rate,
  },
  // 当在相同路由中跳转，只是参数不同可以定义这个方法以重新执行读取数据
  async beforeRouteUpdate(to, from) {
    // 对路由变化做出响应...
    // console.log("切换了路由参数");
    let id = to.params.id;
    this.data.id = id;
    this.getData( this.data.id );
  },
  data () {
    return {
      // 提交到后端的参数
      params: {},
      onOff_loading: !1,
      // 底部出来图片上传弹窗
      onOff_imagePop: !1,
      /* 流程进度 */
      active: 4,
      inputs: {
      },
      // 微信分享的配置参数，必须配置项，从接口获取
      appId:"",
      timestamp:"",
      noncstr:"",
      signatureInfo:"",
      // 自配项
      share: {
        imgurl: "https://staff.weixiubang.club/static/swipe-img/1.jpg",
        url: "https:weixiubang.club",
        title: "share title",
        desc: "share.desc"
      },
      data: {
        id: '00000547',
        amount: 350,
        carNumber: '川F-PK685',
        carModel: '长安奥拓 大王子 2003 手动',
        marks: [

        ],
        times: [

        ],
        imgSrc: " ",
        customerName:"方汉雄",
        customerType:'VIP',
        scoreTime:'2022-01-01',
        receive_at: '',
        complete_at: '',
        real_complete_at: '',
        created_at: '',
        createrName: '',
        scoreValue: 2,
        evaluate:'该客户很忙，没有留下任何话!',
        faultDescription: '故障描述就是车子坏了呗！有啥好说的！',
        repairType: '喷漆',
        repairDatas: [{content: '左前门喷漆',amount:200},{content: '左前门喷漆',amount:200},{content: '左前门喷漆',amount:200},{content: '左前门喷漆',amount:200}],
        loginImages: [

        ],
        images: [],
        rateProgress: { active:1 ,data:[] },
        workProgress: [],
        inspects: [],
        startDt: '',
        endDt: '',
        remarks: '这是一个备注'
      }
    }

  },
  computed: {
    comTimes () {
        /**
       * 从返回信息中生成时间相关的内容
       */
      const makeTimes = function ( da ) {
        let created = `${da.createrName}于${da.created_at}创建了施工单`;
        let str = `请在${da.complete_at}前交付`;
        let res = new Array(created,str);
        // 模板字符串需要使用 ` 反引号包裹起来用${}导入变量
        if ( da.receive_at ) res.push( `已在${da.receive_at}完成接单` );
        da.real_complete_at && res.push( `已在${da.real_complete_at}完成了施工` );
        return res;
      }
      return makeTimes(this.data)
    },

    comReceiveText () {
      if (!this.data.receive_at)
      {
        return '接单';
      }
      if (!this.data.real_complete_at)
      {
        return '完成';
      }
      return '已完成'
    },
    constructionImages ()
    {
      return this.data.images.map( item => item.url );
    }

  },
  methods: {
    /**
     * [receiveTap 点击接单按钮]
     * @return {[type]} [description]
     */
    receiveTap () {
      const self = this;
      if ( !self.data.receive_at ) {
        /** 如果没有接单执行接单操作 */
        self.receiveSave();
        return ;
      }
      if ( !self.data.real_complete_at ) {
        /** 如果没有点击完成执行标记完成操作操作 */
        self.realCompleteAtSave();
        return;
      }
      // Toast('已经标记了完成，请勿重复操作');
      Dialog({ message: '已经标记了完成，请勿重复操作' });

    },
    /**
     * 标记接单时间
     */
    receiveSave ()
    {
      let self = this;
      let id = self.$route.params.id;
      self.get(URL.api_constructionSetReceiveAtToNow + id).then( res => {
        if (res.data) {
          self.data.receive_at = res.data.receive_at;
        }
      }).catch(err=>{console.log(err)});
    },
    /**
     * 标记完成时间
     */
    realCompleteAtSave ()
    {
      let self = this;
      let id = self.$route.params.id;
      self.get(URL.api_constructionSetRealCompleteAtToNow + id).then( res => {
        if (res.data) {
          self.data.real_complete_at = res.data.real_complete_at;
        }
      }).catch(err => console.log(err));
    },
    /**
     * [deleteImage 删除图片]
     * @param  {[type]} file [description]
     * @return {[type]}      [description]
     */
    deleteImage ( file ) {
      const id = file.id;
      this.post(URL.api_imageDelete + id).then( res => {
        // console.log(res)
      }).catch(err=>{console.log(err)})
    },
    /**
     * [uploadImage 上传图片]
     * @param  {[type]} images [description]
     * @return {[type]}        [description]
     */
    uploadImage ( images ) {
      var self = this;
      for (let i=0; i < images.length; i++) {
        let image = images[i].image;
        let target = NaN
        for (let s=0; s<this.data.images.length; s++ ){
          target = this.data.images[s].name == image.name?s :NaN;
          if (target!==NaN && this.data.images[target]) {
            this.data.images[target].status="uploading";
            self.data.images[target].message = '上传中...';
            break;
          };
        }
        const param = new FormData();
        param.append("image", image);
        param.append("id", this.data.id);
        param.append("model", 'construction');
        axios.post(URL.api_imageUpload, param, {
          headers: { "Content-Type": "multipart/form-data",},}).then((res) => {
            if(res.data.success === true){
              self.data.images[target].status = "";
              self.data.images[target].url = res.data.url;
              self.data.images[target].id = res.data.id;
              self.$toast('上传成功');
            } else {
              self.data.images[target].status = "failed";
              self.$toast('上传失败');
            }
          }).catch(err=>{console.log(err)});

      }


    },

    /**
     * [changeRemarks 修改备注]
     * @param  {[type]} val [description]
     * @return {[type]}     [description]
     */
    changeRemarks ( val ) {
      const self = this;
      let id = this.data.id;
      this.post( URL.api_constructionSetRemarks + id ,{ remarks: val}).then( res => {
        self.data.remarks = res.data && res.data.remarks;
      }).catch(err=>{console.log(err)})
    },
    getData ( constructionId ) {
      const self = this;
      let params = {};
      // console.log( self.$route.query );
      // console.log( self.$route );
      self.get( URL.api_constructionShow + constructionId , params ).then ( ( res ) => {
        // console.log( data );
        self.data = self.formatData(res.data);
      }).catch(err=>{console.log(err)});



    },

    formatData ( inp ) {
      let result = {};
      let makeMarks = ( da ) => {
        let res = [ da.dispatch_mode ];
        if ( da.inspect_type == 1 ) res.push('完工交检');
        if ( da.complete_type == 1 ) res.push('限时交车');
        return res;
      }
      let makePicture = ( da ) => {
        let picture = da.repair && da.repair.register && da.repair.register.pictures;
        let pictureArr = picture?(picture.split('|')): [];
        picture = pictureArr.map( (item) => {
          var patt = /^(http|https|ftp|update)+/;
          if (patt.test(item)) {
            return item;
          } else {
            return conf.remoteImageFolder + item;
          }
        })
        picture = picture.filter( (item) => {
          if( item != conf.remoteImageFolder) {
            return item;
          }
        })
        let images = da.repair && da.repair.register && da.repair.register.images || [];
        images = images && images.map( (item) => {
          return item.url;
        })
        // console.log([...images,...picture]);
        return [...picture, ...images];

      }
      let makeEvaluate = (da) => {
        // 如果客户没有给与评价那么显示客户说里面的语言
        if ( !da.evaluates || da.evaluates.length == 0 ){
          return {
            name: da.repair.repair_client.name,
            avatarImg: da.repair.repair_client.avatarUrl,
            scoreValue: 0,
            clientType: da.repair.repair_client.type,
            evaluate: da.repair.register.owner_say?da.repair.register.owner_say:'该客户很忙，没有留下任何话!',
            scoreTime: da.repair.created_at
          }
        } else {
          // 显示最近的一个评价
          let evaluate = da.evaluates[da.evaluates.length -1];
          return {
            name: evaluate.repair_client.name,
            avatarImg: evaluate.repair_client.avatarUrl,
            scoreValue: evaluate.score,
            clientType: evaluate.repair_client.type,
            evaluate: evaluate.info?evaluate.info:'该客户参与了评价，却什么都懒得说!',
            scoreTime: evaluate.created_at,
          }
        }
      }
      /**
       * 抓取进度
       */
      let makeWorkProgress = function ( da )
      {
        let constructions = da.repair.constructions;
        let res = constructions.map( (item) => {
          return {
            name: item.user.name,
            imgSrc: item.user.avatarUrl,
            receive_at: item.receive_at,
            complete_at: item.complete_at,
            real_complete_at: item.real_complete_at,
            repair_type: item.repair_type,
            creat_at: item.created_at,
          }
        })
        return res;
      }
      /**
       * [makeRateOfProgress 获取施工流程]
       * @param  {[type]} da [description]
       * @return {[type]}    [description]
       */
      let makeRateOfProgress = function ( da )
      {
        let constructions = da.repair.constructions;
        let overWork = constructions.filter( (item) => {
          if(item.real_complete_at) return item;
        }).map( (item) => {
          return item.repair_type;
        });
        let working = constructions.filter( (item) => {
          if(!item.real_complete_at) return item;
        }).map( (item) => {
          return item.repair_type;
        });
        // console.log( overWork, working);
        return {
          active: overWork.length,
          data: ['登记',...overWork,...working, '质检'],
        }
      }
      /**
       * [makeImages 返回施工单绑定的图片]
       * @param  {[type]} da [description]
       * @return {[type]}    [description]
       */
      let makeImages = function ( da ) {
        let images = da.images || [];
        return images.map( function( item ) {
          return { url: item.url, id: item.id };
        })
      }

      // 获取到图片数组
      let loginImages = makePicture(inp);
      // 获取评价内容
      let evaluate = makeEvaluate(inp);
      // 施工进度信息
      let workProgress = makeWorkProgress(inp);
      // 流程进度信息
      let rateProgress = makeRateOfProgress(inp);
      //
      let images = makeImages(inp);
      result = {
        id: inp.id,
        amount: inp.amount,
        carNumber: inp.car_number,
        carModel: inp.car_mode,
        marks: makeMarks(inp),
        receive_at: inp.receive_at,
        complete_at: inp.complete_at,
        real_complete_at: inp.real_complete_at,
        created_at: inp.created_at,
        createrName: inp.creater? inp.creater.name: null,
        imgSrc: evaluate.avatarImg,
        customerName: evaluate.name,
        customerType: evaluate.clientType,
        scoreTime: evaluate.scoreTime,
        scoreValue: evaluate.scoreValue,
        evaluate: evaluate.evaluate,
        faultDescription: inp.fault_info,
        repairType: inp.repair_type,
        repairDatas: inp.repair_content,
        loginImages: loginImages,
        workProgress: workProgress,
        // 整个维修给到的时间长度
        rateProgress: rateProgress,
        startDt: inp.repair.created_at,
        endDt: inp.repair.delivery_at,
        remarks: inp.remarks,
        images: images,
        inspects: inp.inspects,
      }
      return result;
    },

    // 分享页面的逻辑
    shareFriend(){//当点击分享好友按钮时
      //怎么取图片的地址取决于你放图片的路径，你也可以用线上图片，也可以放在你们的服务器上。
       this.share.imgurl = this.data.loginImages.length > 0? this.data.loginImages[0]: '';
       this.share.url = location.href.split('#')[0];
       this.share.title = this.data.carNumber + "|" + this.data.carModel;
       this.share.desc = "维修项目:" + this.data.repairType + "|故障描述:" + this.data.faultDescription;
       this.goshare()
    },
    goshare(){
      let that = this;
      console.log('开始分享');
      // alert(this.share.url + "|" + this.share.imgurl);
      //开始注入配置项
      wx.config({
        debug: false,//是否打开debug调试模式。
        appId: this.appId, //必填，公众号唯一标识
        timestamp: parseInt(this.timestamp), //必填，生成签名的时间戳
        nonceStr: this.noncstr,  //必填，生成签名的随机串
        signature: encodeURIComponent(this.signatureInfo), //必填，生成的签名
        jsApiList:['onMenuShareTimeline','onMenuShareAppMessage', 'updateAppMessageShareData', 'updateTimelineShareData'] //必填，允许分享好友，分享朋友圈
      })
      wx.error((res)=>{//配置成功
        for(var msg in res){
          let obj = {
            showAlert:true,
            errTitle:"错误提示",
            errMsg:JSON.stringify(res[msg]),
            errCode:""
          }
        }
      })
      //以上是配置项注入成功
      wx.ready(()=>{//点击要去分享
        wx.updateAppMessageShareData({
          title :  this.share.title,
          link :  this.share.url,
          desc : this.share.desc,
          imgUrl : this.share.imgurl,
          success: function () {
            console.log("分享成功")
          },
          cancel:function(res){
            console.log("分享失败")
          }
        })
        wx.updateTimelineShareData({
          title :  this.share.title,
          link :  this.share.url,
          desc : this.share.desc,
          imgUrl : this.share.imgurl,
          success: function () {
            console.log("分享成功")
          },
          cancel:function(res){
            console.log("分享失败")
          }
        })
        wx.onMenuShareTimeline({//配置去分享朋友圈的选项
          title : this.share.title,//分享标题
          link : this.share.url, //分享链接
          imgUrl : this.share.imgurl, //分享图标
          //imgUrl: '', // 分享图标
          //type: '', // 分享类型,music、video或link，不填默认为link
          //dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
          success : function(res){//分享成功
            console.log("已分享朋友圈成功")
            //如分享成功后想做一些其他的业务处理，可以在这里做
          },
          cancel:function(){
            //that.alert="失败弹框话术等等(注意 这里拿不到this实例的)"
            console.log("已分享失败")
          }
        })
        wx.onMenuShareAppMessage({//配置去分享好友的选项
          title :  this.share.title,
          link :  this.share.url,
          desc : this.share.desc,
          imgUrl : this.share.imgurl ,
          success : function(res){
            console.log("分享好友成功")
          },
          cancel:function(res){
            console.log("分享失败")
          }
        });
      })
    },
    toMessage () {
      this.$router.push({path: "/message/create/" + this.data.id})
    }

  },

  mounted () {
    const self = this;
    let id = self.$route.params.id;
    this.getData( id );

  },
  created () {
    // 分享的相关逻辑 指的是要做分享的页面的url送过去，请求成功才能拿到
    let url = location.href.split('#')[0];
    this.get(URL.api_getWxShareTicket,{url}).then(res=>{
      console.log("api_getWxShareTicket", res );
      if(res.message = 'success'){
        //这些配置参数必填项，后面去调微信的pai是需要传的。
        this.appId = res.data.appId;
        this.timestamp = res.data.timestamp;
        this.noncstr = res.data.nonceStr;
        this.signatureInfo = res.data.signature;
        this.shareFriend();
      }
    }).catch(err=>{console.log(err)})

  }
}
</script>
<style scoped>
#image {
  position: relative;

}
#content {
  width: 100%;
  position: relative;
  top: -50px;
  background-color: var(--van-white);
  border-radius: 40px 40px 0 0;
}
.image-title {
  color: white;
  font-size: 20px;
  background-color:  rgba(120,120,120,0.6);
  line-height: 30px;
}
.circular {
  width: 30px;
  height: 30px;
  position: absolute;
  top: 10px;
  right: 20px;
  font-size: 20px;
  border-radius: 50%;
  text-align: center;
}
.rectangle {
  bottom: 50px;
  position: absolute;
  width: 80px;
  font-size: 12px;
  border-radius: 5px;
  margin: 10px;
  height: 30px;
  line-height: 30px;
  text-align: center;
}
/* 故障描述 */
.fault-description {
  padding: 20px;
  text-align: left;
  font-size: 14px;

}
.fault-description .title {
  font-size: 16px;
  font-weight: 550;
  padding-bottom: 10px;

}
.fault-description .content {
  color: #999999;

}
/* 图片展示标题 */
.img-title {
  font-size: 16px;
  font-weight: 550;
  padding-bottom: 10px;
  text-align: left;
  padding-left: 20px;
  color: #2c3e50;
}
.white-space {
  height: 300px;
}
.button-wrapper {
  display: flex;
  justify-content: space-around;
  box-sizing: border-box;
  padding: 20px;
  background-color: #ffffff;
  text-align: center;
}
.button-wrapper .button-con {
  width: 100%;
}
.inspect-wrapper {
  padding: 20px;
}
.inspect-wrapper .img-title {
  padding-left: 0;
}
.score {
  display: flex;
}
.score span{
  color: var(--van-text-color-2);
  padding-left: var(--van-padding-sm);

}
.inspect-info {
  color: var(--van-text-color-2);
  font-size: var(--van-font-size-md);
}



</style>