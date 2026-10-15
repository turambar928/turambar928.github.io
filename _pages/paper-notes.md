---
permalink: /paper-notes/
title: "Paper Notes"
description: "A personal research archive. Papers, connections, and open questions in AI4Sports, agents, and reinforcement learning."
layout: paper-notes
---
{% assign notes = site.posts | where_exp: "post", "post.categories contains 'paper-notes'" | sort: 'date' | reverse %}
{% assign latest = notes | first %}
{% assign sports = notes | where_exp: "post", "post.tags contains 'ai4sports'" %}
{% assign agents = notes | where_exp: "post", "post.tags contains 'agents'" %}
{% assign rl = notes | where_exp: "post", "post.tags contains 'reinforcement-learning'" %}
{% assign months = notes | group_by_exp: "post", "post.date | date: '%Y-%m'" %}
<main id="main" class="pn-shell">
  <section class="pn-hero" aria-labelledby="archive-title">
    <div class="pn-hero-copy">
      <p class="pn-eyebrow"><span class="pn-status-dot"></span> A PERSONAL RESEARCH ARCHIVE / VOL. 01</p>
      <h1 id="archive-title">PAPER<br><span>NOTES</span><sup>✳</sup></h1>
      <p class="pn-intro">Read deeply.<br>Connect the dots. <em>Think beyond.</em></p>
      <div class="pn-hero-bottom"><p>论文里的方法，实验后的问题。<br>关于 AI、智能体与体育的阅读现场。</p><a class="pn-round-link" href="#archive" aria-label="Browse paper archive">↘</a></div>
    </div>
    <div class="pn-observatory" aria-hidden="true">
      <div class="pn-orbit-label">FIG. 01 — IDEAS IN ORBIT</div><canvas id="pn-orbit"></canvas>
      <div class="pn-orbit-cross pn-orbit-cross--a">+</div><div class="pn-orbit-cross pn-orbit-cross--b">+</div>
      <span class="pn-orbit-tag pn-orbit-tag--a">PERCEPTION</span><span class="pn-orbit-tag pn-orbit-tag--b">REASONING</span><span class="pn-orbit-tag pn-orbit-tag--c">ACTION</span>
      <div class="pn-orbit-caption"><span>EVERY PAPER IS A NEW CONNECTION.</span><span>↗</span></div>
    </div>
  </section>
  <div class="pn-index-strip"><span><b>{{ notes.size }}</b> READING NOTES</span><span>AI4SPORTS / AGENTS / RL</span><span>{% if latest %}LAST ENTRY — {{ latest.date | date: "%Y.%m.%d" }}{% else %}THE ARCHIVE BEGINS HERE{% endif %}</span></div>
  {% if latest %}
  {% assign latest_summary = site.data.paper_notes[latest.slug] %}
  <section class="pn-feature" aria-labelledby="latest-title">
    <div class="pn-feature-label"><span class="pn-eyebrow">01 / LATEST FIELD NOTE</span><span class="pn-feature-star" aria-hidden="true">✳</span><span class="pn-small">A closer look at<br>what comes next.</span></div>
    <a class="pn-feature-link" href="{{ latest.url | relative_url }}"><div class="pn-card-meta"><span>{{ latest.venue | escape }}</span><time datetime="{{ latest.date | date: '%Y-%m-%d' }}">{{ latest.date | date: "%d %b %Y" }}</time></div><h2 id="latest-title">{{ latest.title | escape }}</h2>{% if latest_summary %}<p>{{ latest_summary.summary }}</p>{% endif %}<span class="pn-text-link">OPEN READING NOTE <span aria-hidden="true">↗</span></span></a>
  </section>
  {% endif %}
  <section class="pn-archive" id="archive" aria-labelledby="archive-heading" data-view="timeline">
    <div class="pn-section-heading"><div><p class="pn-eyebrow">02 / READING CHRONICLE</p><h2 id="archive-heading">Reading timeline<span>.</span></h2></div><p>按阅读日期记录，最新在前。<br>用研究方向串起不同论文。</p></div>
    <div class="pn-controls" hidden>
      <div class="pn-filters" role="group" aria-label="按研究方向筛选"><button type="button" data-filter="all" aria-pressed="true">全部论文 <span>{{ notes.size }}</span></button><button type="button" data-filter="ai4sports" aria-pressed="false">AI4Sports · 体育 AI <span>{{ sports.size }}</span></button><button type="button" data-filter="agents" aria-pressed="false">Agents · 智能体 <span>{{ agents.size }}</span></button><button type="button" data-filter="reinforcement-learning" aria-pressed="false">RL · 强化学习 <span>{{ rl.size }}</span></button></div>
      <label class="pn-search"><span class="pn-sr-only">Search titles, tags and summaries</span><span aria-hidden="true">⌕</span><input id="pn-search" type="search" placeholder="Find a paper…" autocomplete="off"><kbd aria-hidden="true">/</kbd></label>
    </div>
    <div class="pn-archive-tools">
      <nav class="pn-month-nav" aria-label="按阅读月份跳转">{% for month in months %}<a href="#month-{{ month.name }}" data-month-link="{{ month.name }}">{{ month.name | replace: '-', '.' }} <span>{{ month.items.size }}</span></a>{% endfor %}</nav>
      <div class="pn-view-switch" role="group" aria-label="选择论文列表视图" hidden><button type="button" data-view="timeline" aria-pressed="true">时间线</button><button type="button" data-view="cards" aria-pressed="false">卡片</button></div>
    </div>
    <p id="pn-results" class="pn-results" role="status" aria-live="polite">共 {{ notes.size }} 篇 · 按阅读日期倒序 · 一篇可属于多个方向</p>
    <div class="pn-months">
      {% assign entry_index = 0 %}
      {% for month in months %}
      {% assign first_in_month = month.items | first %}
      <section class="pn-month-group" id="month-{{ month.name }}" data-month="{{ month.name }}" aria-labelledby="heading-{{ month.name }}">
      <div class="pn-month-heading"><h3 id="heading-{{ month.name }}">{{ first_in_month.date | date: '%Y 年 %m 月' }}</h3><span class="pn-month-count">{{ month.items.size }} 篇</span></div>
      <div class="pn-grid pn-month-grid">
      {% for post in month.items %}
      {% assign entry_index = entry_index | plus: 1 %}
      {% assign note_summary = site.data.paper_notes[post.slug] %}
      {% assign artwork = 'agents' %}{% if post.tags contains 'ai4sports' %}{% assign artwork = 'sports' %}{% endif %}{% if post.tags contains 'reinforcement-learning' %}{% assign artwork = 'rl' %}{% endif %}
      {% assign artwork = note_summary.artwork | default: artwork %}
      <a class="pn-card" href="{{ post.url | relative_url }}" data-topics="{{ post.tags | join: ' ' | escape }}" data-search="{{ post.title | escape }} {{ post.tags | join: ' ' | escape }} {{ note_summary.summary | escape }}">
        <div class="pn-card-art pn-card-art--{{ artwork }}" aria-hidden="true">{% include paper-notes/artwork.html kind=artwork %}<span class="pn-art-label">{{ note_summary.label | default: artwork | upcase }}</span><span class="pn-art-number">{% if entry_index < 10 %}0{% endif %}{{ entry_index }}</span><span class="pn-card-arrow">↗</span></div>
        <div class="pn-card-copy"><div class="pn-card-meta"><span>{{ post.venue | escape }}</span><time datetime="{{ post.date | date: '%Y-%m-%d' }}">{{ post.date | date: "%Y.%m.%d" }}</time></div><h3>{{ post.title | escape }}</h3>{% if note_summary %}<p>{{ note_summary.summary }}</p>{% endif %}<div class="pn-tags">{% for tag in post.tags limit:3 %}<span>{{ tag }}</span>{% endfor %}</div></div>
      </a>
      {% endfor %}
      </div>
      </section>
      {% endfor %}
    </div>
    {% if notes.size == 0 %}<p class="pn-empty">The first note is on its way.</p>{% endif %}
    <div class="pn-empty" id="pn-empty" hidden><p>No notes in this orbit.</p><p>试试其他关键词，或者回到全部笔记。</p><button type="button" id="pn-reset">RESET EXPLORATION ↗</button></div>
  </section>
  <footer class="pn-footer"><a href="{{ '/' | relative_url }}">ZIFU TAO <span>陶子芾</span> ↗</a><p>NOT A PAPER DUMP. A WORK IN THOUGHT.</p><a href="#top">BACK TO TOP ↑</a></footer>
</main>
