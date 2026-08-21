---
permalink: /paper-notes/
title: "Paper Notes"
excerpt: ""
author_profile: true
---

A running log of papers I've read — key ideas, methods, and personal takeaways. Focused on NLP, LLM agents, and post-training.

{% assign notes = site.posts | where_exp: "post", "post.categories contains 'paper-notes'" %}
{% if notes.size == 0 %}
*No notes yet — check back soon.*
{% else %}
<table style="border-collapse: collapse; width: 100%; font-size: 0.95em;">
  <thead>
    <tr style="border-bottom: 2px solid #ccc;">
      <th style="text-align: left; padding: 6px 12px 6px 0; white-space: nowrap;">Date</th>
      <th style="text-align: left; padding: 6px 12px;">Paper</th>
      <th style="text-align: left; padding: 6px 12px;">Venue</th>
      <th style="text-align: left; padding: 6px 0;">Tags</th>
    </tr>
  </thead>
  <tbody>
  {% for post in notes %}
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 8px 12px 8px 0; white-space: nowrap; color: #888;">{{ post.date | date: "%b %d, %Y" }}</td>
      <td style="padding: 8px 12px;"><a href="{{ post.url }}">{{ post.title }}</a></td>
      <td style="padding: 8px 12px; color: #666; white-space: nowrap;">{{ post.venue }}</td>
      <td style="padding: 8px 0;">{% for tag in post.tags %}<span style="background:#f0f0f0; border-radius:3px; padding:1px 6px; margin-right:4px; font-size:0.85em;">{{ tag }}</span>{% endfor %}</td>
    </tr>
  {% endfor %}
  </tbody>
</table>
{% endif %}
