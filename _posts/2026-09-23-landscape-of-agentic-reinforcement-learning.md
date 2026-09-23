---
title: "The Landscape of Agentic Reinforcement Learning for LLMs: A Survey"
date: 2026-09-23
layout: paper-note-post
categories:
  - paper-notes
tags:
  - agents
  - reinforcement-learning
  - agentic-rl
  - survey
venue: "TMLR 2026"
---

**论文**：[The Landscape of Agentic Reinforcement Learning for LLMs: A Survey](https://arxiv.org/abs/2509.02547)<br>
**作者**：Guibin Zhang, Hejia Geng, Xiaohang Yu, Zhenfei Yin, Zaibin Zhang et al.<br>
**Venue**：Transactions on Machine Learning Research（TMLR）, 2026

## 这篇论文在解决什么问题？

现在很多工作都在讲 Agent 和 RL，但“用 RL 训练 LLM”并不一定等于 Agentic RL。普通 RLHF 或 reasoning RL 通常还是给模型一个 prompt，让它生成一次回答，然后根据最终答案给奖励。模型本质上仍然是一个单轮文本生成器。

Agentic RL 关注的是另一种问题：模型处在一个持续变化的环境中，需要多轮观察、规划、调用工具、维护记忆、执行动作并根据反馈调整策略。文章试图给这个快速发展的方向一个统一定义，并从两个角度整理 500 多篇工作：

1. **能力维度**：规划、工具使用、记忆、自我改进、推理和感知；
2. **任务维度**：搜索、代码、数学、GUI、视觉、具身智能和多智能体等。

## 从 LLM RL 到 Agentic RL

文章最核心的区分是把普通的 preference-based reinforcement fine-tuning（PBRFT）看作一个退化的单步 MDP：

$$
\langle S_{trad},A_{trad},P_{trad},R_{trad},T=1,\gamma=1\rangle.
$$

模型看到一个固定 prompt，生成一次文本，收到一个标量奖励，然后 episode 结束。它的优化目标可以写成：

$$
J_{trad}(\theta)=\mathbb{E}_{a\sim\pi_\theta}[r(a)].
$$

而 Agentic RL 更适合建模为 POMDP。模型看不到完整世界状态，只能获得当前观察 $o_t=O(s_t)$，采取动作后环境继续变化：

$$
s_{t+1}\sim P(s_{t+1}\mid s_t,a_t).
$$

优化目标也不再是单个回答的得分，而是整条交互轨迹上的长期回报：

$$
J_{agent}(\theta)=\mathbb{E}_{\tau\sim\pi_\theta}
\left[\sum_{t=0}^{T-1}\gamma^tR(s_t,a_t)\right].
$$

两者最重要的区别并不是用了 PPO、DPO 还是 GRPO，而是任务本身有没有下面这些性质：

- 时间跨度大于一步，需要连续决策；
- 环境会因为动作而改变；
- 模型只能看到部分状态；
- 动作除了文字，还包括搜索、执行代码、点击界面等真实操作；
- 奖励需要在一串相互依赖的动作之间分配。

因此 Agent 的动作空间可以写成：

$$
A_{agent}=A_{text}\cup A_{action},
$$

其中 $A_{text}$ 是自然语言输出，$A_{action}$ 则会真正查询工具或改变外部环境。

## RL 算法在这里扮演什么角色？

文章梳理了 REINFORCE、PPO、DPO 和 GRPO 及其大量变体。

**PPO** 通过 clipping 限制策略更新幅度，训练相对稳定，但通常需要与策略模型规模接近的 critic，计算和显存成本很高。

**DPO** 把偏好优化改写成监督式目标，不需要显式 reward model 和在线 rollout，但它依赖固定偏好数据的质量与覆盖范围。对于会不断改变状态的交互环境，它不完全等价于在线 Agentic RL。

**GRPO** 用同一问题下多条轨迹的相对奖励估计 advantage，去掉 critic，降低了训练开销。不过组内估计可能方差大、不准确，也容易出现 advantage 或 entropy collapse，因此才出现 DAPO、Dr.GRPO、GSPO、StarPO 等很多改进。

我的理解是：算法决定“怎么更新策略”，但环境、动作空间和奖励决定“模型究竟在学什么”。在静态数学题上运行 GRPO，和在浏览器中训练一个需要搜索、验证、回退的 Agent，虽然优化器可能相同，但学习问题并不是一回事。

## 六类核心能力

### 1. Planning

文章把 RL 对规划的作用分成两类。一类是让 RL 学习 value function 或 heuristic，指导 MCTS 等外部搜索；另一类是直接把 LLM 当作 policy，通过环境反馈更新它自身的规划策略。

未来更理想的方向是把两者结合：模型不仅学习“生成什么计划”，还学习什么时候需要慢速搜索、应该探索多少分支，以及什么时候停止思考并执行。

### 2. Tool Use

早期 ReAct 和 SFT 方法主要模仿现成的工具调用轨迹；Agentic RL 则根据最终任务效果学习什么时候调用、调用哪个工具、失败后是否重试以及如何组合多个工具。

工具使用真正困难的地方是 long-horizon credit assignment。如果一条轨迹里有十几次搜索和代码执行，最后任务失败，很难知道是哪一步造成的。只用最终奖励可能误罚有价值的探索，也可能让模型学会利用环境漏洞刷分。

### 3. Memory

传统记忆系统通常预先规定怎么写入和检索，RL 则可以把记忆管理本身变成动作。例如 Memory-R1 让模型在 `ADD / UPDATE / DELETE / NOOP` 中做决策，根据下游问答效果学习什么值得保存。

文章还区分了三类记忆：

- RAG 风格的外部存储；
- 显式自然语言或隐式 latent token 记忆；
- 时间图、知识图谱和层级图等结构化记忆。

我觉得结构化记忆是很有潜力的一块。目前很多图结构仍靠手写规则维护，如果用 RL 学习何时建立连接、合并事件和遗忘旧信息，可能比单纯优化向量检索更接近真正的长期 Agent memory。

### 4. Self-Improvement

文章把自我改进分成三个阶段：只在推理时进行 verbal reflection；通过 RL 把自我纠错内化进模型参数；以及让 Agent 自己生成任务、验证答案并构建 curriculum，形成持续的 self-training loop。

不过，“模型会反思”并不意味着它的反思一定正确。如果 critic 和 actor 共享相同盲点，反复自我检查可能只是把错误说得更完整。因此执行器、形式化验证器和外部环境反馈仍然很重要。

### 5. Reasoning

RL 不只是延长 CoT，还可以学习什么时候使用快速直觉推理，什么时候投入更多 test-time compute 做慢速推理。这里的目标应该是在正确率、延迟和成本之间学习一个策略，而不是所有问题都生成越来越长的 reasoning trace。

### 6. Perception

视觉或多模态 Agent 不能只优化最后的文字答案。感知错误会沿着规划和工具链不断放大，因此需要把定位、视觉 grounding、动作识别等中间过程也纳入可验证奖励。

## 任务、环境和框架

任务侧覆盖搜索与 deep research、代码生成和软件工程、数学证明、GUI 操作、视觉理解、具身智能以及多智能体协作。

这些任务的共同点不是都使用 LLM，而是存在一个可以持续交互和反馈的环境。例如代码 Agent 可以运行单元测试和修改仓库，GUI Agent 可以观察界面状态，搜索 Agent 可以根据检索结果继续改变 query。

文章也整理了大量环境与训练框架。环境包括 WebArena、OSWorld、SWE-bench、ALFWorld、ScienceWorld 等；Agentic RL 框架包括 SkyRL、AREAL、Agent Lightning、AWorld、ROLL、VerlTool 和 AgentRL。相比普通 RLHF 框架，Agentic RL 框架还需要处理多轮 rollout、环境并发、工具状态、异步采样和跨步骤奖励。

## 关键挑战

**长期信用分配。** 最终成功或失败很难准确归因到某一次规划、记忆写入或工具调用，稀疏奖励容易导致训练不稳定。

**奖励不等于真实目标。** Agent 会主动寻找高奖励路径，也可能学会 reward hacking、绕过安全限制或利用评测环境的漏洞。结果正确并不能保证过程可靠。

**RL 可能放大幻觉。** 只奖励最终答案会鼓励模型用虚假的中间推理碰巧得到正确结果，还可能降低模型在无法回答时选择拒答的能力。过程奖励、事实核验和外部 guardrail 仍然必要。

**环境成为瓶颈。** 静态 benchmark 很难训练通用 Agent。更有意思的方向是让环境也参与学习：自动生成奖励，根据 Agent 的弱点调整任务难度，形成 Agent 与 curriculum 共同演化的训练循环。

**训练与部署成本高。** 长轨迹 rollout、工具调用和多轮推理比 SFT 昂贵得多，而且跨领域数据并不总是互相促进，也可能发生负迁移。

**真实部署仍然需要系统保护。** 文章强调安全 guardrail、human-in-the-loop、分层 orchestrator 和标准化的多 Agent 通信协议。RL 优化不能替代输入检查、权限控制、sandbox 和结果验证。

## 我的想法

我觉得这篇 survey 最大的价值是给出了一个比较清楚的判断标准：**Agentic RL 的重点不是在 Agent 项目里用了某个 RL 算法，而是把 Agent 放进真正的序列决策循环，让规划、工具、记忆和反思都能根据长期结果改变。**

这也解释了为什么只在静态 benchmark 上做 reasoning RL 还不够 agentic。模型可能学会生成更长、更像推理的文本，但没有处理环境状态、动作后果和失败恢复。真正困难的是让模型在部分可观测环境中做连续选择，并把最终结果的责任分配回中间步骤。

文章讨论的另一个问题也很有意思：RL 到底是在创造新能力，还是只把预训练模型已经会的正确轨迹概率提高？目前可能不能简单二选一。很多结果只提高 pass@1，说明更像重新分配已有轨迹的概率；但在奖励可验证、任务可以分步检查、基础模型又不是太弱或已经饱和时，RL 也可能让模型形成验证、回退和子目标分解等新的策略。

所以我感觉 Agentic RL 能否有效，至少依赖三个条件：

1. 环境能提供高质量、最好可执行或可验证的反馈；
2. 任务中存在足够多接近正确的轨迹，让探索不是完全随机；
3. 奖励能分辨“碰巧成功”和“过程真正合理”。

最后，这篇文章虽然覆盖面很广，但也因为收录了 500 多篇工作，很多方法只能快速介绍，横向实验条件并不统一。它更适合当作领域地图和查找相关工作的入口，而不能直接根据表格判断哪种算法最好。实际做项目时，还是应该先定义环境状态、动作空间、反馈延迟和可验证目标，再选择 PPO、GRPO 或其他训练方法，而不是反过来从热门算法出发寻找任务。
