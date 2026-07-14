# <img src="./src-tauri/icons/64x64.png" width="30" height="30" alt="图标"> 奶酪课程表

> 该项目目前正在参加“齐齐哈尔市中俄青少年人工智能创新大赛”，以这条信息证明该项目确实完全由参赛者所开发，且版权属于该参赛者所有。如有疑问，可前往issue中联系开发者（参赛者）确认身份。

![banner](./readme-assets/banner.png)

![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/xwzkj/CheeseSchedule/total?label=下载量&logo=github)
![GitHub Repo stars](https://img.shields.io/github/stars/xwzkj/CheeseSchedule?style=flat&label=%E6%98%9F%E6%A0%87%E6%95%B0)
![GitHub License](https://img.shields.io/github/license/xwzkj/CheeseSchedule?label=许可证)
[![Website](https://img.shields.io/badge/%E7%82%B9%E5%87%BB%E6%89%93%E5%BC%80-%E7%BD%91%E7%AB%99-yellow?logo=googlechrome&logoColor=white)](https://schedule.wanzii.cn/)

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/xwzkj/CheeseSchedule)

奶酪课程表是一款简洁的教室大屏电子课表软件，基于tauri + vite + vue开发，相较同类软件，该软件简单易懂，资源占用轻量。

| 软件                 | 包体积 | 内存占用 |
| -------------------- | ------ | -------- |
| 奶酪课程表           | <10MB  | ≈150MB   |

![screenshot1](./readme-assets/screenshot1.png)

得益于tauri2的跨平台特性，程序也实验性支持linux和macos系统，可自行编译体验。

![screenshot_ubuntu](./readme-assets/screenshot_ubuntu.png)

## 功能

> [!TIP]
> README文件的信息可能不是最新，请前往[项目网站](https://schedule.wanzii.cn/)查看。

### 课表

- [x] 时间模式编辑
- [x] 课程表编辑
- [x] 图片导入（AI驱动）
- [x] 多周轮换
- [x] 课程表每日自动轮换显示
- [x] 当日临时换课
- [x] 时间偏移
- [x] 上下课语音提醒（AI TTS）
- [x] 窗口上下课自动置顶置底

### 小组件

- [x] 时钟
- [x] 倒计日
- [x] 日期进度
- [x] 出席人数（需要搭配[请假服务器](https://github.com/xwzkj/leaveServer)使用，请自行搭建后端服务）
- [x] 每日单词（AI驱动）

### 随机抽选（抽签）

- [x] 快捷键触发
- [x] 悬浮按钮
- [x] 动态概率（根据抽签历史动态调整）
- [x] 防止重复（轮次功能）
- [x] 课前自动开启新轮次
- [x] 排除请假者
- [x] 课间防作弊（课间抽选不计入历史记录）
- [x] 防娱乐（若抽签过快则延长冷却时间）

### 杂项

- [x] [通用课程表交换格式(CSES)](https://github.com/SmartTeachCN/CSES)导入导出
- [x] 配置文件导入导出（手动复制）
- [x] AI笔记（截屏总结）
- [x] 编辑器密码锁定
- [x] U盘密钥解锁
- [x] 按页面锁定
- [x] 新版本检测

### 自定义项

- [x] 缩放调节（主窗口）
- [x] 高度调节（主窗口）
- [x] 主题色

## 使用说明

- 程序运行时，会在系统托盘区显示一个图标，点击即可打开编辑器窗口，右键点击（触屏长按）可打开菜单，可于此进行软件更新等操作
- 首次使用：
  1. 在`模式编辑`中配置时间模式（时间表）
  2. 在`课程表编辑`中选择每一天的`模式`
  3. 配置每一节课的`课程` / 在`设置`配置AI API密钥后使用`从课程表图片导入`功能
  4. 配置完成后点击`保存`即可
- 变更将在您点击`保存`后生效并存储到配置文件
- 配置文件全部存储在`应用安装目录`下的`config.json`文件中，可在`设置`中直接定位到该文件以进行导入导出
- 程序默认为开机自启，若要关闭，请更改配置文件的`startup`字段为`false`，设置将在重启程序后生效

## 备注

### 关于Windows7系统

奶酪课程表无法在Windows7系统正常运行。

存在问题：

1. 窗口透明无法生效
2. 窗口尺寸计算存在问题

兼容进度：

1. [x] 使用Rust 1.77.2构建了支持win7的可执行文件
2. [x] 使用postcss处理了UnoCSS presetWind4预设的颜色
3. [ ] 使用win7支持的最新WebView2（109版本），无法支持透明背景

相关讯息：

1. tauri wry对windows7做了特殊处理：[相关拉取请求](https://github.com/tauri-apps/wry/pull/460)
2. win7拓展内核[VxKex-NEXT](https://github.com/YuZhouRen86/VxKex-NEXT/releases/tag/1.1.3.1584)暂无法支持新版Edge或WebView2，且支持tauri应用在win7的窗口透明限制涉及系统内核，风险过大：[相关issue](https://github.com/YuZhouRen86/VxKex-NEXT/issues/359)

### 添加小组件（对于开发者）

需改动三处：

- 添加小组件本体：位于`src/component/widgets`目录下，是一个vue单文件组件
- 在小组件编辑页添加配置项：在`src/pages/editor-widget.vue`中的列表中添加新的配置对象
- 在主窗口添加解析：在`src/pages/mainWindow.vue`导入小组件本体，并在`getWidgetComponent`函数添加新的分支

### 关于贡献

该项目暂时作为个人项目，暂不接受PR。

欢迎提交issue

### 星标历史

[![Star History Chart](https://api.star-history.com/chart?repos=xwzkj/cheeseschedule&type=date&legend=bottom-right&sealed_token=ChTGjARVXdHNEPmn4fKs-4QaytBptLTKkFpsOyDY9iNMSygRX8Ag7UdUYcnVxGRBYcWEfPna5oG68RFMFuDlLY_EAGkytBQXWEGooY7k60uECYnc_s76ZJV3FVKMKpvXUsJQR-Cm9KQafkZchnJiM5ImFSpdnGweFPjiBHyqvWCxUzQdYPV3Vif2LUpU)](https://www.star-history.com/?repos=xwzkj%2Fcheeseschedule&type=date&legend=bottom-right)