---
permalink: /paper-notes/
title: ""
layout: paper-notes
---

<style>
.page__content {
  background: #0d1117;
  border-radius: 14px;
  padding: 2.5rem 2rem;
  min-height: 65vh;
  position: relative;
  overflow: hidden;
}

#pn-canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 0;
  pointer-events: none;
}

.pn-header {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 1.5rem 0 2.5rem;
}

.pn-header h1 {
  font-size: 2em;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #a78bfa 50%, #60a5fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.6rem;
  letter-spacing: -0.02em;
}

.pn-header p {
  color: #6b7280;
  font-size: 0.9em;
  margin: 0;
}

.pn-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.pn-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 1.4rem;
  text-decoration: none !important;
  display: block;
  color: inherit;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease;
  position: relative;
  overflow: hidden;
}

.pn-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(102,126,234,0.5), transparent);
  opacity: 0;
  transition: opacity 0.22s ease;
}

.pn-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(102,126,234,0.2), 0 0 0 1px rgba(102,126,234,0.2);
  border-color: rgba(102,126,234,0.3);
  background: rgba(102,126,234,0.06);
}

.pn-card:hover::before { opacity: 1; }

.pn-card-date {
  font-size: 0.72em;
  color: #4b5563;
  margin-bottom: 0.6rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.pn-card-title {
  font-size: 0.95em;
  font-weight: 600;
  color: #d1d5db;
  margin-bottom: 0.5rem;
  line-height: 1.45;
}

.pn-card:hover .pn-card-title { color: #e9ecef; }

.pn-card-venue {
  font-size: 0.78em;
  color: #818cf8;
  margin-bottom: 0.8rem;
  font-style: italic;
}

.pn-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.pn-tag {
  font-size: 0.7em;
  background: rgba(102,126,234,0.12);
  color: #818cf8;
  border-radius: 4px;
  padding: 2px 7px;
  border: 1px solid rgba(102,126,234,0.18);
}

.pn-empty {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #4b5563;
  padding: 4rem 0;
  font-size: 0.9em;
}
</style>

<canvas id="pn-canvas"></canvas>

<div class="pn-header">
  <h1>Paper Notes</h1>
  <p>Key ideas &amp; takeaways from papers I've read &mdash; NLP, agents, post-training.</p>
</div>

{% assign notes = site.posts | where_exp: "post", "post.categories contains 'paper-notes'" %}

{% if notes.size == 0 %}
<div class="pn-empty">No notes yet — check back soon.</div>
{% else %}
<div class="pn-grid">
{% for post in notes %}
  <a class="pn-card" href="{{ post.url }}" target="_self">
    <div class="pn-card-date">{{ post.date | date: "%b %d, %Y" }}</div>
    <div class="pn-card-title">{{ post.title }}</div>
    {% if post.venue %}<div class="pn-card-venue">{{ post.venue }}</div>{% endif %}
    <div class="pn-card-tags">
      {% for tag in post.tags %}<span class="pn-tag">{{ tag }}</span>{% endfor %}
    </div>
  </a>
{% endfor %}
</div>
{% endif %}

<script>
(function () {
  var canvas = document.getElementById('pn-canvas');
  var ctx = canvas.getContext('2d');
  var mouse = { x: -9999, y: -9999 };
  var particles = [];
  var N = 55;
  var container = canvas.parentElement;

  function resize() {
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
  }

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function () {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = (Math.random() - 0.5) * 0.35;
    this.r = Math.random() * 1.2 + 0.4;
  };
  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  };

  function init() {
    particles = [];
    for (var i = 0; i < N; i++) particles.push(new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function (p) { p.update(); });

    for (var i = 0; i < particles.length; i++) {
      // particle-to-particle lines
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(102,126,234,' + (0.12 * (1 - d / 110)) + ')';
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
      // mouse lines
      var mdx = particles[i].x - mouse.x;
      var mdy = particles[i].y - mouse.y;
      var md = Math.sqrt(mdx * mdx + mdy * mdy);
      if (md < 160) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(167,139,250,' + (0.45 * (1 - md / 160)) + ')';
        ctx.lineWidth = 0.9;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    // dots
    particles.forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(102,126,234,0.55)';
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  container.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  container.addEventListener('mouseleave', function () {
    mouse.x = -9999; mouse.y = -9999;
  });
  window.addEventListener('resize', function () { resize(); init(); });

  resize(); init(); draw();
})();
</script>
