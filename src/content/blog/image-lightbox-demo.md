---
title: 正文图片查看演示
slug: image-lightbox-demo
status: published
date: "2026-10-09"
category: General
tags: ["demo", "reading"]
summary: 公开合成图片，用于测试正文大图、键盘操作和移动阅读。
related_content: []
publish:
  target: blog
---

## 点击图片查看大图

这是仓库中的公开合成演示，图片不含私人内容。点击下方图片，或用 Tab 选中后按 Enter / Space。打开后可滚轮或双指缩放、拖拽移动；使用 + / − 按钮调整，点击「适配」重置。键盘支持 + / −、方向键和 0；按 Escape、点击关闭按钮或背景返回正文。

![终端山景合成横图](/demo/lightbox-landscape.png "终端山景 · 1600 × 900")

## 竖图与移动端

![终端清单合成竖图](/demo/lightbox-portrait.png)

## 原有图片链接

这张图片仍然是链接，点击会打开 Hello World 文章：

[![保留跳转的图片](/demo/lightbox-landscape.png "链接图片保留原行为")](/posts/hello-world)

## 内嵌图片

下图经过远程/data 图片的普通 HTML 懒加载管线，用于验证不依赖外部图床的相同行为。

![内嵌蓝色测试图](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAABkCAYAAAABtjuPAAAACXBIWXMAAAPoAAAD6AG1e1JrAAACFUlEQVR4nO2UQQ3AQACDzgzKJn8ibjLWBB4YKKSH573RBvy0wSm+4uPHDQqwAG8BFsG1btADDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQEwBDkhATAEOSEBMAQ5IQMwHgMjd6SD4WMEAAAAASUVORK5CYII= "内嵌图片标题")

## 无 alt 图片

![](/demo/lightbox-landscape.png)
