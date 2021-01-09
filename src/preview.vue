<template>
  <div
    ref="imgViewWrap"
    class="image-view-wrap"
    @click="onClose"
  >
    <div class="image-view-inner">
      <img
        v-if="loadedImg"
        ref="image"
        :src="realSrc"
        :style="{...imageStyle}"
      >
    </div>
  </div>
</template>
<script>
const WAIT_TIME = 1000; // 等待图片加载时间
const IMAGE_MAX_WIDTH = 400; // 图片最大宽度
const IMAGE_TRANSITION_DURATION = 300; // 图片动画时间

export default {
  props: {
    src: {
      type: String,
      required: true,
    },
    target: {
      type: HTMLImageElement,
      required: true,
    },
  },
  data() {
    return {
      // 图片信息
      originRatio: '',
      originTransform: '',
      baseWidth: '',

      // 衍生信息
      loadedImg: false,
      realSrc: '',
      imageStyle: {
        transformOrigin: '0 0',
      },
    };
  },
  computed: {

  },
  beforeMount() {
    this.getOriginTransform();
  },
  async mounted() {
    await this.loadImage();
    this.getAnimation();
  },
  methods: {
    getOriginTransform() {
      const imageClientRect = this.target.getClientRects()[0];
      const { naturalWidth, naturalHeight } = this.target;

      // 原始比例
      const originRatio = naturalWidth / naturalHeight;

      // 基准宽度
      const baseWidth = Math.min(690, naturalWidth, IMAGE_MAX_WIDTH);

      const originScaleX = imageClientRect.width / baseWidth;
      const baseHeight = baseWidth / originRatio;
      const originScaleY = imageClientRect.height / baseHeight;

      const originTransform = `translate3d(${imageClientRect.left}px, ${imageClientRect.top}px, 0px) scale3d(${originScaleX}, ${originScaleY}, 1)`;

      this.imageStyle = {
        ...this.imageStyle,
        width: `${baseWidth}px`,
        transform: originTransform,
      };
      this.originRatio = originRatio;
      this.baseWidth = baseWidth;
      this.originTransform = originTransform;
      this.realSrc = this.src.split('?')[0];
    },
    getAnimation() {
      this.imgViewRef = this.$refs.imgViewWrap;
      this.$nextTick(() => {
        this.imgViewRef.classList.add('is-active');
        this.getTransform();
      });
    },
    loadImage() {
      return new Promise((resolve) => {
        const image = new Image();
        image.src = this.realSrc;

        image.onload = () => {
          resolve();
          this.loadedImg = true;
        };

        setTimeout(() => {
          if (!this.loadedImg) {
            this.realSrc = this.src;
            this.loadedImg = true;
          }
          resolve();
        }, WAIT_TIME);
      });
    },
    getTransform() {
      const { baseWidth, originRatio } = this;
      const { naturalWidth } = this.$refs.image;

      const documentoffsetWidth = document.documentElement.offsetWidth;
      const documentoffsetHeight = document.documentElement.offsetHeight;

      // 图片最后宽度
      const afterWidth = Math.min(documentoffsetWidth - 20, naturalWidth, IMAGE_MAX_WIDTH);

      // 图片最后高度
      const afterHeight = afterWidth / originRatio;

      // 图片最后的translateX
      const afterTranslateX = (documentoffsetWidth - afterWidth) / 2;

      // 图片最后的translateY
      let afterTranslateY = (documentoffsetHeight - afterHeight) / 2;

      afterTranslateY = Math.max(10, afterTranslateY);

      // 图片最后的比例
      const afterScale =  afterWidth / baseWidth;

      document.body.style = 'overflow: hidden';
      const transform = `translate3d(${afterTranslateX}px, ${afterTranslateY}px, 0px) scale3d(${afterScale}, ${afterScale}, 1)`;

      setTimeout(() => {
        this.imageStyle = {
          ...this.imageStyle,
          transform,
        };
      }, 0);
    },
    onClose() {
      this.imgViewRef.classList.remove('is-active');
      this.imageStyle = {
        ...this.imageStyle,
        transform: this.originTransform,
      };
      setTimeout(() => {
        document.body.style = '';
        this.$emit('close');
      }, IMAGE_TRANSITION_DURATION);
    },
  },
};
</script>
<style scoped lang='scss'>
$backgroundColor-transition-duration: 0.2s;
$imageSize-transition-duration: 0.3s;

.image-view-wrap {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 101;
  overflow: hidden;
  padding-bottom: 10px;
  -webkit-transition: background-color $backgroundColor-transition-duration
    ease-in-out;
  transition: background-color $backgroundColor-transition-duration ease-in-out;
  &.is-active {
    background-color: rgba(18, 18, 18, 0.65);
  }
  .image-view-inner {
    height: 100%;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    overflow-y: auto;
    overflow-x: hidden;
    img {
      cursor: -webkit-zoom-out;
      cursor: zoom-out;
      -webkit-transition: -webkit-transform $imageSize-transition-duration
        ease-in-out;
      transition: -webkit-transform $imageSize-transition-duration ease-in-out;
      transition: transform $imageSize-transition-duration ease-in-out;
      transition: transform $imageSize-transition-duration ease-in-out,
        -webkit-transform $imageSize-transition-duration ease-in-out;
    }
  }
}
</style>
