---
title: "Why Agentic Theorem Prover Works: A Statistical Provability Theory of Mathematical Reasoning Models"
date: 2026-11-10
layout: paper-note-post
categories:
  - paper-notes
tags:
  - agents
  - mathematical-reasoning
  - formal-methods
  - learning-theory
venue: "ICML 2026"
---

**论文** [Why Agentic Theorem Prover Works: A Statistical Provability Theory of Mathematical Reasoning Models](https://arxiv.org/abs/2602.10538)<br>
**作者** Sho Sonoda, Shunta Akiyama, Yuya Uezato<br>
**版本** arXiv v3，2026 年 5 月 22 日，PDF 标注 ICML 2026

## 为什么数学证明可以通过 agent 系统变得更容易？

形式化证明的搜索空间很大。实际系统却可以把 LLM、定理检索、搜索和 Lean 等验证器组合起来，在有限预算里解决不少问题。文章希望用统计学习的语言，解释这种系统的成功率受到哪些因素影响。

首先需要把问题定义清楚。给定一个定理分布和验证器调用预算，系统找到完整有效证明的概率是多少？作者把这个量称为 statistical provability。

## 把证明过程写成序贯决策

状态需要包括全部未解决目标、上下文和验证器状态。一个 tactic 可能把一个目标拆成多个子目标，这些目标最终都需要解决，因此只记录当前一个目标会丢失关键信息。

模型提出 tactic 或证明步骤，验证器执行后产生下一个状态，全部目标关闭时进入成功集合 $G$。记首次成功时间为 $T_G$、初始定理分布为 $q_0$，则预算 $B$ 下的成功率为

$$
\operatorname{SP}_{B}^{\pi}(q_0)
=\mathbb{E}_{X_0\sim q_0}
\bigl[\mathbb{P}_{\pi}(T_G\le B\mid X_0)\bigr].
$$

证明是否有效由验证器决定，策略则影响系统会探索哪些路径，以及能否在预算耗尽前找到证明。

## 先学动作价值，再选择证明步骤

文章主要分析一个相对清晰的流程。离线估计不同剩余预算下的动作价值 $Q_t$，也就是在当前状态采取某个动作之后，剩余预算内成功的可能性。执行时使用估计值 $\widehat Q_t$，贪心选择分数最高的动作。

理论把局部估计误差与最终成功率差距连接起来。在给定假设下，核心形式为

$$
\operatorname{SP}_{B}^{*}(q_0)
-\operatorname{SP}_{B}^{\widehat\pi}(q_0)
\le
2\sum_{s=1}^{B}
\mathbb{P}_{\widehat\pi}(T_G\ge s)\,
\varepsilon_{B-s+1}.
$$

直观地说，系统还没证明成功的阶段，动作价值估计误差才会继续影响结果。如果每层误差都不超过 $\bar\varepsilon$，这个式子可以简化成

$$
\operatorname{SP}_{B}^{*}-\operatorname{SP}_{B}^{\widehat\pi}
\le 2\bar\varepsilon\,
\mathbb{E}_{\widehat\pi}[\min(T_G,B)].
$$

右边是误差与平均截断证明长度的乘积。这里的长度对应学到的 prover 实际产生的轨迹，不能直接换成一个理想的最短证明长度。

## 检索、表示和验证器分别影响哪里？

论文把误差进一步拆成函数类的近似误差、数据覆盖与表示几何带来的误差，以及 rollout 标签噪声。这样就能对应到系统里的具体模块。

- 检索到合适引理、进行有效分解，可以缩短仍需搜索的路径。
- 更好的表示和训练数据覆盖，可以帮助估计当前状态下不同动作的成功率。
- 验证器提供有效性反馈，帮助构造训练标签，也让执行过程能够及时发现无效分支。
- 如果正确动作与其他动作之间有更明显的价值间隔，少量估计误差就更不容易改变最终选择。

但这些结论依赖较强的条件，包括相关区域的覆盖和光滑性、动作候选中保留至少一个最优动作，以及对理想动作价值 rollout 标签的假设。真实系统使用教师或 bootstrap 构造标签时，还需要考虑额外偏差。检索若直接漏掉所有正确候选，后面的价值估计就失去了理论所需的前提。

## 我的想法

感觉这篇最有启发的地方，是把 agent 各模块的作用接到了一个共同目标上。缩短证明路径、提高价值估计质量、扩大相关数据覆盖，都能影响有限预算下的成功率。这样看系统改进时，就可以更具体地问，某个模块究竟改变了界里的哪一项。

对验证器的作用也可以区分得更清楚。验证器能够确认已经找到的证明有效，搜索策略仍然需要负责找到这条路径。两者结合之后，才形成一个可评价成功概率的过程。

不过，这篇主要提供理论框架。定理分析的是受假设约束的价值回归与贪心执行，实际系统里的 beam search、回溯、候选裁剪和分布外状态都需要进一步处理。我会把它作为设计和诊断系统的参考，并继续看这些理论量能否在真实 Lean 轨迹里被测量出来，例如平均未解决步数、候选保留率和价值估计误差。
