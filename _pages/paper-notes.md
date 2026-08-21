---
permalink: /paper-notes/
title: "Paper Notes"
excerpt: ""
author_profile: true
---

A running log of papers I've read, with key takeaways and personal thoughts. Focused on NLP, LLM agents, and post-training.

---

{% assign notes = site.posts | where_exp: "post", "post.categories contains 'paper-notes'" %}
{% if notes.size == 0 %}
*No notes yet — check back soon.*
{% else %}
{% for post in notes %}
### [{{ post.title }}]({{ post.url }})
<small>{{ post.date | date: "%B %d, %Y" }}</small>

{{ post.excerpt }}

---
{% endfor %}
{% endif %}
