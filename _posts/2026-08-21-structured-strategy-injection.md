---
title: "Structured Strategy Injection for Data Analysis Agents"
date: 2026-08-21
layout: paper-note-post
categories:
  - paper-notes
tags:
  - agents
  - data analysis
  - LLM
venue: "EMNLP 2026 Findings"
---

**Paper**: [Structured Strategy Injection for Data Analysis Agents](https://openreview.net/forum?id=X1EOiod6ar#discussion)  
**Authors**: Zifu Tao, Guozhao Mo, Weixiang Zhou, Yaojie Lu, Hongyu Lin, Ben He, Xianpei Han, Le Sun  
**Venue**: EMNLP 2026 Findings

## What's the problem?

Data analysis agents powered by LLMs tend to generate ad-hoc, unstructured code solutions — they lack explicit analytical strategies, making outputs brittle and hard to generalize across tasks.

## Key idea

Inject structured, step-by-step analytical strategies into the agent's reasoning process at inference time, guiding it to follow principled problem-solving patterns rather than free-form generation.

## Method

The framework extracts reusable strategy templates from high-quality demonstrations and injects them as structured context during generation. This steers the model toward systematic decomposition — problem understanding → strategy selection → code execution — without requiring fine-tuning.

## Results

Consistent improvements over vanilla agent baselines on data analysis benchmarks, with especially strong gains on complex multi-step tasks where unguided models tend to lose track of the overall objective.

## My takeaway

The core insight — that strategy is separable from execution and can be injected externally — feels broadly applicable. It's a clean way to get structured behavior from frozen LLMs. The interesting open question is how to automatically discover good strategies for new task domains without curated demonstrations.
