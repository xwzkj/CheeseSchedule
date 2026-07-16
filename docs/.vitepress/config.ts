import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import removeMd from 'remove-markdown'
import MarkdownItKatex from "@vscode/markdown-it-katex";

import { defineConfig } from 'vitepress'

/** 读取 md 文件，提取前 200 字的纯文本描述 */
function makePageDescription(relativePath: string, rootDir: string): string {
  const filePath = resolve(rootDir, relativePath)

  let markdown: string
  try {
    markdown = readFileSync(filePath, 'utf8')
  } catch {
    return ''
  }

  const text = removeMd(markdown).replace(/\s+/g, ' ').trim()
  return text.slice(0, 200)
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "奶酪课程表 - 专为教室大屏设计的桌面课程表系统",
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/app-icon.png' }],
    ['script', { async: 'true', src: 'https://www.googletagmanager.com/gtag/js?id=G-FH4JGQSSCX' }],
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
    },
    config: (md) => {
      md.use(MarkdownItKatex.default, {
        throwOnError: false,
        strict: false,
      })
    }
  },
  sitemap:{
    hostname: 'https://schedule.wanzii.cn',
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
        text: '初次见面',
        items: [
          { text: '软件简介', link: '/doc/introduction' },
          { text: '手环版', link: '/doc/vela' },
          { text: '下载中心', link: '/doc/download' }
        ]
      },
      {
        text: '起步',
        items: [
          { text: '初次使用', link: '/doc/starter/first-try' },
          { text: '随机抽选：抽签', link: '/doc/starter/draw' }
        ]
      },
      {
        text: '其他',
        items: [
          { text: '使用AI生成CSES数据', link: '/doc/other/ai-cses' },
          { text: 'QQ群聊', link: '/doc/other/group' },
          { text: '更多信息', link: '/doc/other/more-info' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/xwzkj/CheeseSchedule' }
    ]
  },

  transformPageData(pageData, { siteConfig }) {
    if (pageData.frontmatter.description) return
    const desc = makePageDescription(pageData.relativePath, siteConfig.root)
    if (desc) pageData.description = desc
  }
})
