<template>
  <div>
    <div class="main-info">
      <div v-for="(val,key) in messageable" class="content">
        <div class="title">
          {{key}}
        </div>
        <div class="val">
          {{val}}
        </div>

      </div>
    </div>
    <jin-chat-panel
    :datas="datas"
    ref = "panel"
    @tapReply = "tapReply"
    @tapRead = "tapRead"
    >
    </jin-chat-panel>
    <!-- 上传弹窗组 -->
    <jin-message-creat-pop
    :show.sync="onOff_messagePop"
    :files.sync="inputImages"
    :receiver = "params.receiver"
    explain = "上传图片时请保持横向"
    @submit="creatMessage"
    @delete = "deleteImage"
    >
    </jin-message-creat-pop>
  </div>
</template>
<script>
import axios from 'axios'
import { Popup, Image as VanImage, Skeleton, Toast } from 'vant';
import Vue from 'vue';
import { URL } from '@/web-config/apiUrl'
// import { isUrl } from '@/utils/CheckUtils';
import conf from '@/web-config/index';
import JinChatPanel from '@/components/JinChatPanel.vue';
import JinMessageCreatPop from '@/components/JinMessageCreatPop';
import JinBasicInfo from '@/components/JinBasicInfo';

// moudle 对象传送门https://www.cnblogs.com/tian-xie/p/7754186.html
export default {
  name: 'message',
  mixins : [ require ( "@/mixins" ).default ],
  components: {
    Popup,
    'van-image': VanImage,
    'jin-chat-panel': JinChatPanel,
    'jin-message-creat-pop': JinMessageCreatPop,
    'van-skeleton': Skeleton,
    'jin-basic-info': JinBasicInfo,

  },
  // 当在相同路由中跳转，只是参数不同可以定义这个方法以重新执行读取数据
  async beforeRouteUpdate(to, from) {
    // 对路由变化做出响应...
    // console.log("切换了路由参数");
    let id = to.params.id;
    this.id = id;
    this.getDatas( this.data.id );
  },

  data () {
    return {
      id: 0,
      datas: [],
      messageable: {},
      onOff_messagePop: !1,
      inputImages: [],
      params: {},


    }

  },
  computed: {

  },
  mounted () {
    this.id = this.$route.params.id;
    this.getDatas(this.id);
  },
  created () {

  },
  methods: {
    formatData: function (item) {
      let createrName = 'creater' in item? (typeof item.creater == 'object' && item.creater!=null)? item.creater.name: null: null;
      return {
        id: item.id,
        name: createrName,
        onLeft: createrName == this.userInfo.userName? !1: !0,
        content: item.content,
        images: item.images.map((i)=>i.url),
        read_at: item.read_at,
        reply_at: item.reply_at,
        must_reply: item.must_reply,
        date: item.created_at,
        messageable: item.messageable,
        messageable_type: item.messageable_type
      }
    },
    formatMessageable: function (messageable,model) {
      let result = {};
      switch ( model ) {
        case 'App\\Models\\Construction':
          result = {
            ID: messageable.id,
            名称: '施工单',
            类型: 'construction',
            车牌照号: messageable.car_number,
            车型: messageable.car_mode,
          }
          break;
        default:
          break;
      }
      return result;
    },
    getDatas: function ( id ) {
      let self = this;
      self.get( URL.api_getMessagesByMorph + id ).then( (data)=>{
        var datas = typeof data == 'string'? JSON.parse( data ): data;
        var res = datas.data
        self.datas = res.map( this.formatData );
        if ( self.datas.length > 0 && 'messageable' in self.datas[0]) {
          let messageable = self.datas[0].messageable;
          let model = self.datas[0].messageable_type;
          self.messageable = self.formatMessageable(messageable,model)
        }
        this.$refs.panel.toTop();
      }).catch(err => console.log(err))
    },
    /**
     * [deleteImage 删除图片]
     * @param  {[type]} file [description]
     * @return {[type]}      [description]
     */
    deleteImage ( file ) {
      const id = file.id;
      /*this.post(URL.api_imageDelete + id).then( res => {
        console.log(res)
      })*/
    },
    /* 点击某一条消息的回复 */
    tapReply ( id, key )
    {
      this.onOff_messagePop = !0;
      this.params.id = id;
      this.params.receiver = this.datas[key].name;
    },
    tapRead ( id, key )
    {
      var self = this;
      this.get(URL.api_messageRead + id).then( res=> {
        if( res.status == 'success' ) {
          Toast(this.language.success);
          Vue.set(self.datas[key],'read_at',res.data.read_at)
          self.datas[key].read_at = res.data.read_at;
        }
      }).catch(err => console.log(err))
    },
    creatMessage ( form ) {
      let images = form.images || [];
      let params = {content: form.message, must_reply: form.mustReply, parent_id: this.params.id}
      this.get(URL.api_messageReply,params).then( data=> {
        let dat = typeof data == 'string'? JSON.parse( data ): data;
        if( dat.data.hasOwnProperty('id')) {
          // 添加到显示
          dat.data.images = [];
          this.datas.push(dat.data);
          if (images.length > 0) {
            this.uploadImage(images,'message',dat.data.id);
          }
          this.$refs.panel.toTop();
          this.onOff_messagePop = !1;
        }
      }).catch(err => console.log(err))
    },
    /**
     * [uploadImage 上传图片]
     *
     */
    uploadImage ( images, model, model_id ) {
      var self = this;
      for (let i=0; i < images.length; i++) {
        let image = images[i].image;
        let target = NaN
        // 对应的图片显示上传提示
        for (let s=0; s<this.inputImages.length; s++ ){
          target = this.inputImages[s].name == image.name?s :NaN;
          if (target!==NaN && this.inputImages[target]) {
            this.inputImages[target].status="uploading";
            self.inputImages[target].message = '上传中...';
            break;
          };
        }
        const param = new FormData();
        param.append("image", image);
        param.append("id", model_id);// 多态的imagesablie_id
        param.append("model", model);// 多态模型imagesable_type
        axios.post(URL.api_imageUpload, param, {
            headers: { "Content-Type": "multipart/form-data",},}).then((res) => {
            if(res.data.success === true){
              self.inputImages[target].status = "";
              self.inputImages[target].url = res.data.url;
              self.inputImages[target].id = res.data.id;
              let lastMessage = self.datas[self.datas.length - 1];
              if(lastMessage.hasOwnProperty('images') && Array.isArray(lastMessage.images)){
                lastMessage.images.push(res.data.url);
              }
              self.$toast('上传成功');
            } else {
              self.inputImages[target].status = "failed";
              self.$toast('上传失败');
            }
         }).catch(err => console.log(err));

      }

    }
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
.main-info {
  padding: var(--van-padding-md);

}
.main-info .content {
  padding: 2px 0;
  font-size: var(--van-font-size-md);
  position: relative;

}
.main-info .content {
  display: flex;
}
.main-info .title {
  width: 30%;
  /* text-align justify 被设置元素必须有一个元素兄弟元素, 貌似只对中文有效 */
  text-align-last: justify;
  text-align: justify;
  padding: 0 var(--van-padding-sm);
  color: var(--van-text-color);
  font-size: var(--van-font-size-md);
  box-sizing:border-box;
}
.main-info .val {
  width:70%;
  padding: 0 var(--van-padding-sm);
  color: var(--van-text-color-2);
  font-size: var(--van-font-size-sm);
  box-sizing:border-box;
}


</style>