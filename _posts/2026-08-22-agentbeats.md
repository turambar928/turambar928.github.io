---
title: "AgentBeats: Agentifying Agent Assessment for Openness, Standardization, and Reproducibility"
date: 2026-08-22
layout: paper-note-post
categories:
  - paper-notes
tags:
  - agents
  - evaluation
  - benchmark
venue: "Preprint 2025"
pdf: "/assets/papers/AgentBeats-with-annotations.pdf"
---

**论文**：AgentBeats: Agentifying Agent Assessment for Openness, Standardization, and Reproducibility  
**Venue**：Preprint 2025

## 这篇论文在解决什么问题？

现在做 agent 评测真的是一团乱麻。每个团队发论文都用自己的那套测试方法，环境不同、指标不同、甚至连任务定义都不一样，结果就是你根本没法把两篇论文的数字放在一起比较。A 说我的 agent 在任务 X 上准确率 80%，B 说我的是 75%，但他们用的根本不是同一个评测框架，这个比较毫无意义。

这个问题在 NLP 里其实一直存在，但 agent 这边尤其严重，因为 agent 任务本身就更复杂、环境依赖更强，随便改个细节结果就差很多。

## 他们的想法是什么？

他们的核心想法其实挺有意思的：**用 agent 来评测 agent**。

以前评测是人工设计任务、人工收集结果、人工打分，这套流程又慢又贵还难复现。AgentBeats 的思路是把整个评测流程也做成一个自动化的 agent 系统，让 agent 自己去跑测试用例、收集结果、生成报告。这样就能做到开放、标准化、可复现。

我觉得这个"用 agent 评 agent"的想法本身就很有哲学意味，有点像"让机器检验机器"——当然这里面也有潜在的问题，后面会说。

## 具体怎么做的？

框架分几层：

- **任务层**：统一定义了一批标准任务，覆盖工具使用、多步规划、环境交互等能力
- **执行层**：评测 agent 自动调用被测 agent，记录每一步的输入输出
- **评分层**：用预定义的指标或者 LLM-as-judge 的方式打分
- **报告层**：自动汇总，输出标准化的结果格式

整个流程可以一键跑，不需要人工介入，而且因为环境是固定的，别人也能跑出一样的结果。

## 实验结果说明了什么？

他们用这个框架去复现了一批已发表论文的结果，发现很多论文声称的数字在标准化环境下根本跑不出来。这个结论其实挺触目惊心的——说明现在 agent 领域存在相当严重的"复现危机"，很多 benchmark 上的 SOTA 数字可能都是在特定、未公开的配置下跑出来的。

## 我的想法

这篇论文有点说法，很多时候我们比较的根本不是"谁的方法更好"，而是"谁的评测环境对自己更友好"。

"用 agent 评 agent"这个范式我觉得是对的方向，但也有一个绕不开的问题：**评测 agent 本身的质量谁来保证？** 如果评测 agent 判断错了，或者它有系统性的偏差，那结果可能更不可信。这有点像"谁来监督监督者"的经典问题。

从更技术的角度来看，这篇论文其实触碰到了一个 agent 领域很核心的矛盾：**任务复杂度和评测可靠性之间的 trade-off**。越复杂的 agentic 任务（比如多步规划、跨工具调用、长程依赖），越难设计出客观、无歧义的评分标准。AgentBeats 用 LLM-as-judge 来打分，这个方向是主流，但 LLM judge 本身存在 position bias、verbosity bias 这些已知问题，在 agent 任务上这些偏差可能被进一步放大。我觉得后续值得关注的一个方向是**结果验证和过程验证的结合**——不只看最终答案对不对，还要看中间每一步的工具调用是否合理，这样的评测信号会更细粒度，也更难被刷分。

另外这篇论文让我想到我们自己做数据分析 agent 时的一个痛点：同样的 prompt，在 GPT-4o 和 Claude 上跑出来的 tool call 序列差别很大，但最终结果可能都"对"，只是路径不同。现有 benchmark 大多只关心 end-to-end accuracy，完全忽略了这种 behavioral diversity，而后者对理解模型能力边界其实更有价值。AgentBeats 的框架如果能把 execution trace 也纳入评测维度，会更有说服力。

另外我觉得这篇论文对我自己写论文也有启发——以后做实验要更注重把评测配置写清楚，让别人能复现，不然就算结果再好也站不住脚。这也是为什么我们组一直强调代码要开源。

总体来说这篇读下来收获挺大的，不是因为方法有多复杂，而是它指出了一个大家都在回避的问题。
