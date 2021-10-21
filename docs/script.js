{
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  //=======================================================================================
  // SMOOTH SCROLL
  //=======================================================================================
  class SmoothScroll {
    constructor() {
      this.body = document.body;
      this.root = document.documentElement;
      this.images = [...document.querySelectorAll(".img")];
      this.screen = {
        w: window.innerWidth,
        h: window.innerHeight,
      };

      this.targetY = 0;
      this.currentY = 0;
      this.ease = 0.1;

      this.section = document.querySelector("[data-scroll]");
      this.sectionPercent = document.querySelector("#percent");
      this.sectionContent = this.section.querySelector("[data-scroll-content]");
      this.sectionRect = this.sectionContent.getBoundingClientRect();

      this.sectionHeight = 0;

      this.raf = undefined;
      this.rafActive = false;
      this.ticking = false;

      this.hasPointerEvents = true;
      this.timer;
      this.ENABLE_HOVER_DELAY = 500;
      if (window.requestAnimationFrame) {
        this.init();
      }
    }

    handlePointerEvents() {
      const bodyClassList = document.body.classList;
      // clear previous timeout function
      clearTimeout(this.timer);

      if (!bodyClassList.contains("disable-hover")) {
        // add the disable-hover class to the body element
        bodyClassList.add("disable-hover");
      }

      this.timer = setTimeout(function () {
        // remove the disable-hover class after a timeout of 500 millis
        bodyClassList.remove("disable-hover");
      }, this.ENABLE_HOVER_DELAY);
    }

    resize() {
      this.screen = {
        w: window.innerWidth,
        h: window.innerHeight,
      };

      this.normHeight();
      this.loop();
    }

    normHeight() {
      // this.sectionRect = this.section.getBoundingClientRect();
      this.sectionRect = this.sectionContent.getBoundingClientRect();
      let sub = this.sectionRect.height - this.screen.h;
      let final = sub * 0.5 + this.screen.h;
      this.body.style.height = Math.floor(final) + "px";
    }

    styles() {
      this.resize();
      this.root.classList.add("smooth-scroll");
    }

    scrolling(elm, transform = undefined) {
      let s = elm.style;
      let t = transform || `translate3d(0, -${this.currentY}px,0)`;

      s["transform"] = t;
    }

    events() {
      document.addEventListener("touchmove", (e) => e.stopPropagation(), {
        passive: true,
      });

      window.addEventListener("resize", this.resize.bind(this), {
        passive: true,
      });

      document.addEventListener("scroll", this.scroll.bind(this), {
        passive: true,
      });
    }

    scroll() {
      this.targetY = window.scrollY || window.pageYOffset;

      if (!this.ticking) {
        window.requestAnimationFrame(() => {
          this.loop();
          this.handlePointerEvents();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }

    update() {
      let diff, delta;

      diff = this.targetY - this.currentY;
      delta = Math.abs(diff) < 0.1 ? 0 : diff * this.ease;

      let swy = diff * 0.01; // skew y
      let rx = delta * 1.5; // rotate x

      if (delta) {
        this.currentY += delta;
        this.currentY = Math.round(this.currentY * 100) / 100;
        this.raf = window.requestAnimationFrame(this.update.bind(this));
        this.hasPointerEvents = false;
      } else {
        this.hasPointerEvents = true;
        this.currentY = this.targetY;
        swy = 0;
        rx = 0;
        this.rafActive = false;
        cancelAnimationFrame(this.raf);
      }

      this.scrolling(this.section, `translate3d(0, -${this.currentY}px,0)`);
      // this.scrolling(this.sectionPercent, `translate3d(0, -${this.currentY}px,0)`);
      // this.sectionPercent.textContent = (Math.ceil(this.currentY * .1))+"%";
      this.images.forEach((img) => {
        img.style.transform = `perspective(100vw) rotateX(${rx}deg)`;
      });
    }

    loop() {
      if (!this.rafActive) {
        this.rafActive = true;
        this.raf = window.requestAnimationFrame(this.update.bind(this));
      }
    }

    init() {
      this.styles();
      this.events();
      this.loop();
    }
  }

  var time = 0;
  var loader = document.querySelector("#loader h3");
  var triggerScroll = document.getElementById("go-to-info");
  var targetView = document.getElementById("info");
  var m = {
    lerp: function (x, y, v) {
      return x * (1 - v) + y * v;
    },
    clamp: function (a, min = 0, max = 1) {
      return Math.min(max, Math.max(min, a));
    },
  };

  var easings = {
    linear(t) {
      return t;
    },
    easeOutBounce(x) {
      const n1 = 7.5625;
      const d1 = 2.75;

      if (x < 1 / d1) {
        return n1 * x * x;
      } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
      } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
      } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
      }
    },
    easeInBounce(x) {
      return 1 - easings["easeOutBounce"](1 - x);
    },
  };

  const nope = () => {};

  const tween = (o = {}) => {
    const v = {
      d: o.duration || 1000,
      delay: o.delay || 0,
      easing: o.easing || "linear",
      complete: o.complete || nope,
      update: o.update || nope,
    };

    const f = () => {
      let rafid = undefined;
      let running = false;
      let start = performance.now() + v.delay;

      const update = () => {
        let time = (performance.now() - start) / v.d;
        time = m.clamp(time, 0, 1);
        const progress = easings[v.easing](time);

        if (rafid) v.update(progress);

        if (time < 1) {
          rafid = requestAnimationFrame(update);
        } else {
          cancelAnimationFrame(rafid);
          v.complete();
          running = false;
          start = 0;
          return;
        }
      };

      const loop = () => {
        if (!running) {
          running = true;
          rafid = requestAnimationFrame(update);
        }
      };

      loop();
    };

    f();
  };
  const bodyClassList = document.body.classList;

  triggerScroll.addEventListener("click", () => {
    if (isMobile) {
      targetView.scrollIntoView();
      return;
    }
    const offsetTop = targetView.offsetTop / 2;
    tween({
      easing: "easeInBounce",
      duration: 800,
      update: function (t) {
        bodyClassList.add("disabled-hover");
        window.scrollTo(0, m.lerp(0, offsetTop, t));
      },
      complete: function () {
        bodyClassList.remove("disabled-hover");
      },
    });
  });

  window.addEventListener("load", () => {
    bodyClassList.add("disabled-hover");
    setTimeout(function () {
      window.scrollTo(0, 0);
      fLoader();
      exitLoader();
    }, 1000);
  });

  function fLoader() {
    time = time + 1;
    loader.textContent = time + "%";

    if (time === 100) {
      return;
    }
    window.requestAnimationFrame(fLoader);
  }

  function exitLoader() {
    setTimeout(function () {
      document.body.classList.remove("preload");
      if (!isMobile) new SmoothScroll();
    }, 1200 - time);
  }
}
