---
title: "Do LLM Agents Have Regret? A Case Study in Online Learning and Games"
date: 2026-11-10
layout: paper-note-post
categories:
  - paper-notes
tags:
  - agents
  - online-learning
  - game-theory
  - regret-minimization
venue: "ICLR 2025"
---

**论文** [Do LLM Agents Have Regret? A Case Study in Online Learning and Games](https://arxiv.org/abs/2403.16843)<br>
**作者** Chanwoo Park, Xiangyu Liu, Asuman Ozdaglar, Kaiqing Zhang<br>
**Venue** ICLR 2025，笔记参考 arXiv v5 修订版

## 一个 agent 会不会越做越好，怎么衡量？

让 LLM 连续做决策，每轮把之前的选择和损失告诉它，它可能会根据历史调整策略。但仅仅观察几轮做对了多少，还很难说明它是否形成了可靠的在线学习能力。

文章引入 online learning 里的 regret。设第 $t$ 轮损失向量为 $\ell_t$，agent 选择动作分布 $\pi_t$，则 external regret 可以写成

$$
R_T=\sum_{t=1}^{T}\langle\ell_t,\pi_t\rangle
-\min_{\pi\in\Delta(\mathcal{A})}
\sum_{t=1}^{T}\langle\ell_t,\pi\rangle.
$$

比较对象是在看完全部历史后选出的最佳固定策略。No-regret 要求 $R_T/T\to0$，也就是平均每轮相对这个比较对象的额外损失趋于零。这里的比较对象在整个过程中保持固定。

## 实验怎么做？

作者把历史决策和损失写进 prompt，让模型输出下一轮的动作概率。实验包括在线专家问题、bandit 设置和重复博弈。Full-information 会提供所有动作的损失，bandit 只反馈所选动作的损失，两者可用的信息量不同。

在均匀、Gaussian、线性变化和正弦变化等损失序列上，GPT-4 等模型在不少设置中表现出次线性 regret 的趋势。作者通过趋势检验和回归来判断这个现象，并扩展到更长历史和多种模型。

但实验长度有限，有限时间里的拟合只能提供经验依据。No-regret 的理论要求还涉及更长时间和允许的全部损失序列，需要另外分析。

## 遇到针对性构造的环境，还能适应吗？

一个有意思的结果是，经典 Follow-the-Leader 的交替损失反例，并没有直接难倒 GPT-4。模型能够识别交替规律，预测下一步变化，在某些情况下甚至得到负 regret，因为它利用了固定策略无法利用的时间规律。

作者随后加入噪声，破坏这种容易识别的规律，又构造了自适应对手。对手在看到 agent 的概率分布后，专门给概率最大的动作分配较高损失。在这些设置中，GPT-4 和 GPT-4-Turbo 无法可靠呈现次线性 regret。

这使文章的问题更具体了。模型可能擅长发现某些模式，但面对不断根据自己行为变化的反馈时，策略更新仍然可能失效。

## 能不能直接训练低 regret 的行为？

作者先用一个假设性的预训练数据生成模型，解释 LLM 为什么可能表现得类似 Follow-the-Perturbed-Leader。这个分析依赖数据和监督条件，实际 GPT-4 的训练过程没有被证明符合这些假设。

随后文章提出 regret-loss，直接以损失序列上的决策 regret 为训练目标。最坏情况目标难以直接优化，于是用采样轨迹和可微的 surrogate loss 近似，让高 regret 的轨迹得到更多关注。

这种训练不需要每一步的最优动作标签，但仍需要损失序列及相应反馈。作者在较小的 Transformer 上验证了效果，并对单层线性 self-attention 等受限模型进行理论分析，在给定条件下把最优参数与 FTRL 类在线学习算法联系起来。

重复博弈里还可以得到一个连接。如果各玩家都具有低 external regret，经验联合行动分布会接近 coarse correlated equilibrium。一般博弈中，进一步得到 Nash equilibrium 还需要额外条件。

## 我的想法

感觉 regret 给 agent 的持续学习提供了一个比较明确的评价角度。一个系统即使会总结经验、更新 memory，也需要证明这些更新确实降低了后续决策的累计代价。

文章里原始历史和摘要历史的比较也值得注意。摘要可能减少上下文长度，却同时丢掉决策顺序和变化规律。在一些带时间结构的损失序列上，原始历史可以帮助识别模式，汇总后的统计信息反而不够。设计 agent memory 时，需要根据任务判断哪些顺序信息必须保留。

不过，这里的环境有清晰的动作集合和数值损失，距离真实工具调用、长任务和延迟反馈还有一段距离。我更想看的是，当任务中的损失只能部分观察、工具可能失败、环境还会变化时，能否定义一个合理的比较策略，再用它检验记忆和反思模块究竟有没有帮助。
