{
  // 404
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  //=======================================================================================
  // SMOOTH SCROLL
  //=======================================================================================
  class SmoothScroll {
    constructor() {
      this.body = document.body;
      this.root = document.documentElement;
      this.images = [...document.querySelectorAll(".img")];

      this.targetY = 0;
      this.currentY = 0;
      this.ease = 0.1;

      this.section = document.querySelector("[data-scroll]");
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
      const bodyClassList = this.body.classList;
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
      this.sectionHeight = this.section.getBoundingClientRect().height;
      this.loop();
    }

    styles() {
      this.resize();
      this.root.classList.add("smooth-scroll");
      // this.images.forEach(img=>{
      // 	img.style.transform = "perspective(100vw)";
      // })
    }

    scrolling(elm, transform = undefined) {
      let s = elm.style;
      let t = transform || `translate3d(0, -${this.currentY}px,0)`;

      s["transform"] = t;
    }

    events() {
      document.addEventListener("touchmove", e => e.stopPropagation(), {
        passive: true });

      window.addEventListener("resize", this.resize.bind(this), {
        passive: true });

      document.addEventListener("scroll", this.scroll.bind(this), {
        passive: true });

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
      let rx = delta * 2; // rotate x

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
      this.images.forEach(img => {
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
    }}


  window.addEventListener("load", () => {
    document.body.classList.remove("preload");

    if (!isMobile) new SmoothScroll();

  });
}