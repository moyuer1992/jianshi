var config = {
  fontMap: [
    {
      label: '隶书',
      value: 'STBaoliSC-Regular'
    },
    {
      label: '楷体',
      value: 'STKaiti'
    },
    {
      label: '魏碑',
      value: 'Weibei-SC-Bold'
    },
    {
      label: '隶变',
      value: 'STLibianSC-Regular'
    },
    {
      label: '娃娃体',
      value: 'DFWaWaSC-W5'
    },
    {
      label: '行楷',
      value: 'STXingkaiSC-Bold'
    }
  ],

  fontSizeMap: [
    {
      label: '小',
      value: 30
    },
    {
      label: '中',
      value: 40
    },
    {
      label: '大',
      value: 50
    }
  ],

  fontColorMap: [
    {
      label: '黑',
      value: '#000000'
    },
    {
      label: '白',
      value: '#FFFFFF'
    },
    {
      label: '褐',
      value: '#514848'
    }
  ],

  textStyleMap: [
    {
      Klass: 'GlTextSprite',
      style: 1,
      label: '渲墨',
      value: 0
    },
    {
      Klass: 'GlTextSprite',
      style: 2,
      label: '立体',
      value: 1
    }
  ],

  textAlignMap: [
    {
      label: '居中',
      value: 'center'
    },
    {
      label: '左对齐',
      value: 'left'
    }
  ],

  backgroundMap: [
    {
      Klass: 'PureBgSprite',
      label: '纯色',
      value: 0,
      colors: ['rgb(235, 235, 235)', '#FEFEFE', '#3a3a3a']
    },
    {
      Klass: 'TreeBgSprite',
      label: '月下林间',
      value: 1,
      colors: ['rgb(235, 235, 235)', '#b1a69b', '#3a3a3a']
    }
  ],

  animationMap: [
    {
      label: '无',
      value: 0
    },
    {
      label: '粒子缓入',
      value: 1
    }
  ],

  state: {
    fontIndex: 0,
    fontSizeIndex: 0,
    fontColorIndex: 0,
    textStyleIndex: 0,
    textAlignIndex: 0,
    backgroundIndex: 0,
    animationIndex: 1,
    bgColorIndex: 0
  }
}
