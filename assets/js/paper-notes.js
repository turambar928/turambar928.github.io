/* Progressive enhancement: the full archive and every note work without JS. */
(() => {
  "use strict";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const cards = [...document.querySelectorAll(".pn-card")];
  const search = document.querySelector("#pn-search");
  if (search) {
    const buttons = [...document.querySelectorAll("[data-filter]")];
    let topic = "all";
    const filter = () => {
      const query = search.value.trim().toLocaleLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const match =
          (topic === "all" || card.dataset.topics.split(" ").includes(topic)) &&
          card.dataset.search.toLocaleLowerCase().includes(query);
        card.hidden = !match;
        if (match) visible++;
      });
      document.querySelector("#pn-empty").hidden = visible !== 0;
      document.querySelector("#pn-results").textContent =
        `${visible} of ${cards.length} reading notes shown`;
      buttons.forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.filter === topic),
        ),
      );
    };
    buttons.forEach((button) =>
      button.addEventListener("click", () => {
        topic = button.dataset.filter;
        filter();
      }),
    );
    search.addEventListener("input", filter);
    document.querySelector("#pn-reset").addEventListener("click", () => {
      topic = "all";
      search.value = "";
      filter();
      search.focus();
    });
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.target.closest("input, textarea, select, [contenteditable]")
      ) {
        event.preventDefault();
        search.focus();
      }
      if (event.key === "Escape" && document.activeElement === search) {
        search.value = "";
        filter();
        search.blur();
      }
    });
    document.querySelector(".pn-controls").hidden = false;
    filter();
  }
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    cards.forEach((card) =>
      card.addEventListener("pointermove", (event) => {
        if (reducedMotion.matches) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }),
    );
  }
  const prose = document.querySelector(".pn-prose");
  if (prose) {
    const headings = [...prose.querySelectorAll("h2, h3")];
    const toc = document.querySelector("#pn-toc-links");
    const links = headings.map((heading, index) => {
      if (!heading.id) heading.id = `section-${index + 1}`;
      const link = document.createElement("a");
      link.href = `#${encodeURIComponent(heading.id)}`;
      link.textContent = heading.textContent;
      link.dataset.depth = heading.tagName.slice(1);
      toc.appendChild(link);
      return link;
    });
    if (headings.length) document.querySelector(".pn-toc").hidden = false;
    let scheduled = false;
    const updateReading = () => {
      scheduled = false;
      const start = prose.getBoundingClientRect().top + window.scrollY;
      const end = start + prose.offsetHeight - window.innerHeight;
      const progress = Math.max(
        0,
        Math.min(1, (window.scrollY - start) / Math.max(1, end - start)),
      );
      document.querySelector("#pn-progress").style.transform =
        `scaleX(${progress})`;
      let active = 0;
      headings.forEach((heading, index) => {
        if (heading.getBoundingClientRect().top < 160) active = index;
      });
      links.forEach((link, index) => {
        if (index === active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };
    const scheduleReading = () => {
      if (!scheduled) {
        scheduled = true;
        window.requestAnimationFrame(updateReading);
      }
    };
    window.addEventListener("scroll", scheduleReading, { passive: true });
    window.addEventListener("resize", scheduleReading);
    if ("ResizeObserver" in window)
      new ResizeObserver(scheduleReading).observe(prose);
    updateReading();
  }
  const canvas = document.querySelector("#pn-orbit");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const host = canvas.parentElement;
  let width = 1,
    height = 1,
    rotation = 0.4,
    frame = 0,
    lastTime = 0,
    inView = true;
  const pointer = { x: 0, y: 0 };
  const nodes = Array.from({ length: 85 }, (_, i) => {
    const y = 1 - (i / 84) * 2;
    const radius = Math.sqrt(1 - y * y);
    const angle = i * Math.PI * (3 - Math.sqrt(5));
    return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius };
  });
  const project = (point) => {
    const a = rotation + pointer.x * 0.15;
    const x = point.x * Math.cos(a) - point.z * Math.sin(a);
    const z = point.x * Math.sin(a) + point.z * Math.cos(a);
    const tilt = -0.25 + pointer.y * 0.12;
    const y = point.y * Math.cos(tilt) - z * Math.sin(tilt);
    const depth = point.y * Math.sin(tilt) + z * Math.cos(tilt);
    const scale = Math.min(width * 0.36, height * 0.33);
    return { x: width / 2 + x * scale, y: height / 2 + y * scale, depth };
  };
  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    const projected = nodes.map(project);
    projected.forEach((p, i) => {
      nodes.forEach((node, j) => {
        if (j <= i) return;
        const origin = nodes[i];
        if (
          Math.hypot(origin.x - node.x, origin.y - node.y, origin.z - node.z) >
          0.46
        )
          return;
        const q = projected[j];
        const opacity = 0.08 + ((p.depth + q.depth + 2) / 4) * 0.3;
        ctx.strokeStyle = `rgba(193,233,117,${opacity})`;
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      });
      ctx.fillStyle =
        i % 8 === 0
          ? "#d5ff5f"
          : `rgba(193,233,117,${0.25 + (p.depth + 1) * 0.3})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, i % 8 === 0 ? 2.8 : 1.4, 0, Math.PI * 2);
      ctx.fill();
    });
    // A blue satellite orbit adds depth without loading a 3D engine.
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-0.45);
    ctx.strokeStyle = "#8daee044";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, width * 0.45, height * 0.13, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#a3bde9";
    ctx.beginPath();
    ctx.arc(
      Math.cos(rotation * 1.6) * width * 0.45,
      Math.sin(rotation * 1.6) * height * 0.13,
      3.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();
  };
  const tick = (time) => {
    frame = 0;
    if (document.hidden || !inView || reducedMotion.matches) return;
    if (time - lastTime > 32) {
      rotation += Math.min(time - lastTime, 64) * 0.00013;
      lastTime = time;
      draw();
    }
    frame = window.requestAnimationFrame(tick);
  };
  const sync = () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    lastTime = performance.now();
    draw();
    if (!document.hidden && inView && !reducedMotion.matches)
      frame = window.requestAnimationFrame(tick);
  };
  const resize = () => {
    width = host.clientWidth;
    height = host.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  };
  host.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches || event.pointerType === "touch") return;
    const rect = host.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / width - 0.5;
    pointer.y = (event.clientY - rect.top) / height - 0.5;
  });
  host.addEventListener("pointerleave", () => {
    pointer.x = 0;
    pointer.y = 0;
  });
  document.addEventListener("visibilitychange", sync);
  reducedMotion.addEventListener("change", sync);
  if ("IntersectionObserver" in window)
    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      sync();
    }).observe(host);
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(host);
  else window.addEventListener("resize", resize);
  resize();
  sync();
})();
