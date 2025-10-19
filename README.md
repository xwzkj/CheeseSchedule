# 🧀奶酪课程表

该项目基于tauri + vite + vue开发

> 体积小巧，界面简洁

仅针对windows10/11进行了测试，windows7等系统[无法正常使用](#why-not-win7)。

![screenshot1](./readme-assets/screenshot1.png)

## 功能

不算强大，但一般够用

包括但不限于：

- [x] 时间模式编辑
- [x] 课程表编辑
- [x] 多周轮换课表
- [x] 课程表显示（自动每日轮换）
- [x] 当日临时换课
- [x] 小组件（如：时钟、倒计日、日期进度）

自定义项：

- [x] 缩放调节（主窗口）
- [x] 高度调节（主窗口）

## 使用说明

- 程序运行时，会在系统托盘区显示一个图标，点击即可打开编辑器窗口
- 首次使用：
  1. 在`模式编辑`中配置时间模式（时间表）
  2. 在`课程表编辑`中选择每一天的`模式`
  3. 配置每一节课的`课程`
  4. 配置完成后点击`保存`即可
- 变更将在您点击`保存`后生效并存储到配置文件
- 配置文件全部存储在`应用安装目录`下的`config.json`文件中，可在`设置`中直接定位到该文件以进行导入导出
- 程序默认为开机自启，若要关闭，请更改配置文件的`startup`字段为`false`，设置将在重启程序后生效

## 备注

### 为何win7等旧系统用不了 <span id="why-not-win7"></span>

1. 旧系统不支持新版本rust
2. 旧系统不支持新版webview2
3. 在win7使用拓展内核([VxKex](https://github.com/YuZhouRen86/VxKex-NEXT/releases/tag/1.1.3.1584))和webview2 109后可以正常启动，但主窗口透明效果失效，且该版本webview2无法正常渲染UnoCSS presetWind4预设的颜色

### 添加小组件（对于开发者）

需改动三处：

- 添加小组件本体：位于`src/component/widgets`目录下，是一个vue单文件组件
- 在小组件编辑页添加配置项：在`src/pages/widgetEditor.vue`中的列表中添加新的配置对象
- 在主窗口添加解析：在`src/pages/mainWindow.vue`导入小组件本体，并在`getWidgetComponent`函数添加新的分支

### 构建

tauri在构建时使用的版本号：

产品版本->Cargo.toml

文件版本->tauri.conf.json

## 感谢

[@Etern](https://github.com/Etern-34520)：提供外观建议
