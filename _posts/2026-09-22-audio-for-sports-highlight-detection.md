---
title: "Audio for Sports Highlight Detection: A Comparative Empirical Study"
date: 2026-09-22
layout: paper-note-post
categories:
  - paper-notes
tags:
  - ai4sports
  - audio
  - highlight-detection
  - temporal-modeling
venue: "MMSports 2026"
---

**论文**：[Audio for Sports Highlight Detection: A Comparative Empirical Study](https://arxiv.org/abs/2609.17923)<br>
**作者**：Hao Xu, Meenakshi Sarkar, Vishnu Raj, David Gunawan<br>
**Venue**：MMSports 2026

## 这篇论文在解决什么问题？

在一场长时间的比赛中，怎么找出最精彩的几分钟？逐帧观看太浪费时间，而体育转播的音轨其实包含了很多高光信号，例如解说员语速和音调的变化、观众欢呼、哨声、击球声以及事件发生后的持续兴奋。

这篇文章想回答一个很直接的问题：**如果只听声音，而且把整场比赛的音频当作连续序列而不是互相独立的小片段，能不能定位高光？**

## 音频怎么表示？

假设一场比赛有两个小时，先把音轨切成连续且不重叠的小段：

```text
0–2 秒       2–4 秒       4–6 秒       6–8 秒       ...
clip 1       clip 2       clip 3       clip 4       ...
```

每个片段都有“是否为高光”的监督标签。模型再用预训练的 Audio Spectrogram Transformer（AST）从每段音频中提取一个特征向量，于是整场比赛可以表示为：

$$
X_a=\{x_1^a,x_2^a,x_3^a,\ldots,x_T^a\}.
$$

接下来的任务就是为每个向量预测一个高光分数。

## 两种建模方式

**MLP baseline：每个片段单独判断。** 在判断第 $t$ 个片段时，模型看不到其他片段，每个音频片段彼此独立：

$$
\hat{s}_t=\sigma\bigl(\mathrm{MLP}(x_t^a)\bigr).
$$

**GRU：把整场音频当作序列。** GRU 依次读取特征：

$$
x_1^a\rightarrow x_2^a\rightarrow x_3^a\rightarrow\cdots\rightarrow x_T^a.
$$

读取第 $t$ 个片段时，模型维护一个隐藏状态：

$$
h_t=\mathrm{GRU}(x_t^a,h_{t-1}),
$$

其中 $h_t$ 可以理解为模型对“截至当前时刻，前面发生了什么”的压缩记忆。最后根据每个时间点的隐藏状态预测高光分数：

$$
\hat{s}_t=\sigma\bigl(\mathrm{MLP}(h_t)\bigr).
$$

这样模型就有机会学习一种持续的声音模式：

```text
解说平静
  ↓
解说语速加快、音调升高
  ↓
观众突然欢呼
  ↓
哨声或击球声
  ↓
解说和观众持续兴奋
```

## 实验结果

在 SV-Highlights 上，从音频 MLP 换成音频 GRU 后：

- mAP：$33.55\rightarrow41.79$，提高 **8.24**；
- Hit@1：$76.96\rightarrow86.90$，提高 **9.94**；
- Hit@K：$36.43\rightarrow42.37$，提高 **5.94**；
- IoU：$22.68\rightarrow27.49$，提高 **4.81**。

这说明改进不只来自音频特征本身，也来自模型对前后时间上下文的利用。音频 GRU 的 mAP 甚至比视觉 GRU 高 3.80。简单拼接音频和视觉特征后，融合 GRU 进一步达到 **46.92 mAP、91.09 Hit@1 和 30.67 IoU**，说明两种模态具有互补性。

作者还把音频分成 vocal 和 background 两部分。单独使用解说与人声比单独使用背景声更有效，但完整混合音轨最好；与此同时，高光片段的响度和中频能量整体更高，但分布仍然大量重叠，所以不能只靠一个响度阈值判断高光。

## 我的想法

GRU 的序列建模能力并不代表它真正理解了进球、犯规或关键回合的语义。这里本质上仍然是预训练 AST 特征加 GRU，没有引入事件识别、比分变化、球员行为或比赛规则等其他模块。

这种方法的局限也比较明显：阈值不合适时可能预测出过多高光；欢呼和高亢解说也可能来自回放而不是真实事件；不同运动项目的声音模式差异很大，可能需要重新适配；而且高光的开始与结束边界仍然不够明确。

不过，把音频从辅助模态提升为主要信号这一点很有价值。实际系统中可以先用音频做低成本候选召回，再结合视觉事件识别、比分 OCR 和回放检测做验证，这可能比对整场视频持续运行重型视觉模型更高效。
