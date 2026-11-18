import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealSelector = "[data-reveal]";
const introSelector = ".site-header, .hero__prompt, .hero__title span, .hero__aside > *";

let introTimeline = null;
let sectionTimelines = [];
let initialized = false;

function createTypingTween(element) {
  const text = element.dataset.typedText ?? "";
  const state = { count: 0 };

  element.textContent = "";

  return gsap.to(state, {
    count: text.length,
    duration: Math.min(1.6, Math.max(0.8, text.length * 0.028)),
    ease: "none",
    onUpdate() {
      element.textContent = text.slice(0, Math.round(state.count));
    },
    onComplete() {
      element.textContent = text;
    }
  });
}

function buildIntro() {
  const typed = document.querySelector("[data-typed-text]");
  const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

  timeline
    .from(".site-header", { y: -14, autoAlpha: 0, duration: 0.55 })
    .from(".hero__prompt", { y: 10, autoAlpha: 0, duration: 0.35 }, "-=0.25");

  if (typed) {
    timeline.add(createTypingTween(typed), "-=0.1");
  }

  timeline
    .from(
      ".hero__title span",
      {
        y: 28,
        autoAlpha: 0,
        duration: 0.75,
        stagger: 0.09,
        clearProps: "transform"
      },
      "-=0.55"
    )
    .from(
      ".hero__aside > *",
      {
        y: 18,
        autoAlpha: 0,
        duration: 0.55,
        stagger: 0.08,
        clearProps: "transform"
      },
      "-=0.45"
    );

  return timeline;
}

function buildSectionReveals() {
  const sections = document.querySelectorAll("main > section:not(.hero)");

  sectionTimelines = Array.from(sections)
    .map((section) => {
      const items = section.querySelectorAll(revealSelector);

      if (!items.length) {
        return null;
      }

      return gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
            onRefresh(self) {
              if (self.progress > 0) {
                self.animation.progress(1);
              }
            }
          }
        })
        .from(items, {
          y: 24,
          autoAlpha: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "transform"
        });
    })
    .filter(Boolean);
}

function setStaticState() {
  const typed = document.querySelector("[data-typed-text]");

  if (typed) {
    typed.textContent = typed.dataset.typedText ?? "";
  }

  gsap.set(introSelector, { clearProps: "all" });
  gsap.set(revealSelector, { clearProps: "all" });
}

function teardown() {
  if (introTimeline) {
    introTimeline.kill();
    introTimeline = null;
  }

  sectionTimelines.forEach((timeline) => {
    timeline.scrollTrigger?.kill();
    timeline.kill();
  });
  sectionTimelines = [];
}

function buildAll(refresh = true) {
  teardown();
  gsap.set(introSelector, { clearProps: "all" });
  gsap.set(revealSelector, { clearProps: "all" });

  introTimeline = buildIntro();
  buildSectionReveals();

  if (refresh) {
    ScrollTrigger.refresh();
  }
}

function handleMotionPreference(event) {
  if (event.matches) {
    teardown();
    setStaticState();
    ScrollTrigger.refresh();
    return;
  }

  buildAll();
}

export function initAnimations() {
  if (initialized) {
    return;
  }

  initialized = true;
  reduceMotion.addEventListener("change", handleMotionPreference);

  if (reduceMotion.matches) {
    setStaticState();
    return;
  }

  buildAll();
}

export function replayAnimations() {
  if (!initialized) {
    return;
  }

  if (window.location.hash) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }

  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;

  root.style.scrollBehavior = "auto";
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  root.style.scrollBehavior = previousBehavior;

  if (reduceMotion.matches) {
    setStaticState();
    return;
  }

  buildAll(false);
}
