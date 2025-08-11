// animations.js (modo script clásico, sin 'export')
(() => {
  'use strict';

  // ⏱ Ajusta estos tiempos para que coincidan con tu CSS
  const DURATIONS = {
    fadeOut: 300,
    slideOut: 300,
    slideOutLeft: 1000,
    slideOutTop: 700,
  };

  // Conjunto de clases que usamos, para limpiar estados previos
  const ALL_CLASSES = [
    'fade-in', 'fade-out',
    'slide-in', 'slide-out',
    'slide-in-left', 'slide-out-left',
    'slide-in-top',  'slide-out-top',
  ];

  function ensureEl(el) {
    if (!el) {
      console.warn('ANIM: elemento no encontrado/undefined');
      return false;
    }
    return true;
  }

  function show(el) {
    el.style.display = 'block';
  }

  function hide(el) {
    el.style.display = 'none';
  }

  function applyClass(el, clsToAdd) {
    // Limpia cualquier clase de animación previa antes de aplicar la nueva
    ALL_CLASSES.forEach(c => el.classList.remove(c));
    el.classList.add(clsToAdd);
  }

  // -------------------------
  // Efectos de desvanecido
  // -------------------------
  function fadeIn(element) {
    if (!ensureEl(element)) return;
    applyClass(element, 'fade-in');
    show(element);
  }

  function fadeOut(element) {
    if (!ensureEl(element)) return;
    applyClass(element, 'fade-out');
    setTimeout(() => hide(element), DURATIONS.fadeOut);
  }

  // -------------------------
  // Efectos de slide genéricos
  // -------------------------
  function slideIn(element) {
    if (!ensureEl(element)) return;
    applyClass(element, 'slide-in');
    show(element);
  }

  function slideOut(element) {
    if (!ensureEl(element)) return;
    applyClass(element, 'slide-out');
    setTimeout(() => hide(element), DURATIONS.slideOut);
  }

  // -------------------------
  // Slide desde la izquierda
  // -------------------------
  function slideInLeft(element) {
    if (!ensureEl(element)) return;
    applyClass(element, 'slide-in-left');
    show(element);
  }

  function slideOutLeft(element) {
    if (!ensureEl(element)) return;
    applyClass(element, 'slide-out-left');
    setTimeout(() => hide(element), DURATIONS.slideOutLeft);
  }

  // -------------------------
  // Slide desde arriba
  // -------------------------
  function slideInTop(element) {
    if (!ensureEl(element)) return;
    applyClass(element, 'slide-in-top');
    show(element);
  }

  function slideOutTop(element) {
    if (!ensureEl(element)) return;
    applyClass(element, 'slide-out-top');
    setTimeout(() => hide(element), DURATIONS.slideOutTop);
  }

  // 🔓 API pública disponible globalmente
  window.ANIM = {
    fadeIn,
    fadeOut,
    slideIn,
    slideOut,
    slideInLeft,
    slideOutLeft,
    slideInTop,
    slideOutTop,
  };
})();
