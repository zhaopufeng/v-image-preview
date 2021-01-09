import Vue from 'vue';
import ImageDialog from './src/preview.vue';
let instance;

function isInDocument(element) {
  return document.body.contains(element);
}

function initInstance(options) {
  if (instance) {
    instance.$destory();
  }

  const dialogDiv = document.createElement('div');
  // 先appendChild，再用new创建实例
  document.body.appendChild(dialogDiv);

  instance = new (Vue.extend(ImageDialog))({
    el: dialogDiv,
    propsData: {
      src: options.src,
      target: options.target,
    },
  });

  instance.$on('close', () => {
    close();
  });
}

function Dialog(options) {
  return new Promise((resolve, reject) => {
    if (!instance || !isInDocument(instance.$el)) {
      initInstance(options);
    }

    Object.assign(instance, Dialog.currentOptions, options, {
      resolve,
      reject,
    });
  });
}

Dialog.defaultOptions = {

};
function close() {
  instance.$destroy();
  document.body.removeChild(instance.$el);
  instance = null;
}

Dialog.close = () => {
  close();
};

Dialog.setDefaultOptions = (options) => {
  Object.assign(Dialog.currentOptions, options);
};

Dialog.resetDefaultOptions = () => {
  Dialog.currentOptions = { ...Dialog.defaultOptions };
};

Dialog.resetDefaultOptions();


const test = {
  componentUpdated(el) {
    const image = new Image();
    let { src } = el;

    if (el.dataset && el.dataset.src) {
      src = el.dataset.src;
    }

    if (src) {
      setTimeout(() => {
        // 加载原始大小图片
        image.src = src.split('?')[0];
      }, 100);
    }
  },
  bind(el) {
    el.addEventListener('click', () => {
      Dialog({
        src: el.src,
        target: el,
      });
    });
  },
};

Dialog.install = () => {
  Vue.directive('preview', test);
};

Dialog.Component = ImageDialog;

export default Dialog;
