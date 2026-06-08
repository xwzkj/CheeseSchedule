import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "奶酪课程表",
  description: "专为教室大屏设计的AI课程表系统",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
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


    lastUpdated: true,
    markdown: {
      image: {
        lazyLoading: true
      }
    },
    nav: [
      { text: '主页', link: '/' },
      { text: '使用说明', link: '/doc/introduction' }
    ],

    sidebar: [
      {
        text: '起步',
        items: [
          { text: '介绍', link: '/doc/introduction' },
          { text: '下载', link: '/doc/download' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/xwzkj/CheeseSchedule' }
    ]
  }
})
