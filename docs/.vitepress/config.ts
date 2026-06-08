import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "奶酪课程表 - 专为教室大屏设计的桌面课程表系统",
  description: "这是一款用于教室大屏幕的开源桌面课程表软件，与AI融合，内置多种实用功能，基于tauri和vue构建",
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/app-icon.png' }],
    ['script', { async: true, src: 'https://www.googletagmanager.com/gtag/js?id=G-FH4JGQSSCX' }],
    ['script', {}, `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-FH4JGQSSCX');
    `]
  ],
  markdown: {
    image: {
      lazyLoading: true
    }
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    siteTitle: "奶酪课程表",
    logo: '/app-icon.png',
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            displayDetails: '显示详情',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      },
    },
    docFooter: {
      prev: "上一页", //Next page
      next: "下一页", //Previous page
    },
    outline: {
      level: [2, 6],
      label: '页面导航'
    },

    lastUpdated: {
      text: '最后更新于',
    },

    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    skipToContentLabel: '跳转到内容',

    nav: [
      { text: '主页', link: '/' },
      { text: '使用说明', link: '/doc/introduction' }
    ],

    sidebar: [
      {
        text: '起步',
        items: [
          { text: '软件简介', link: '/doc/introduction' },
          { text: '下载该软件', link: '/doc/download' }
        ]
      },
      {
        text: '其他',
        items: [
          { text: '更多信息', link: '/doc/more-info' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/xwzkj/CheeseSchedule' }
    ]
  }
})
