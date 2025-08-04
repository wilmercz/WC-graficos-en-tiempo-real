/* ============================================
   ANIMACIONES SIMPLIFICADAS - BROADCAST STANDARD
   Solo animaciones esenciales para mejor performance
   ============================================ */

// ============================================
// FADE - Para logos y elementos de fondo
// ============================================
export function fadeIn(element) {
  if (!element) return;
  
  element.classList.remove('fade-out', 'hidden');
  element.classList.add('fade-in');
  element.style.display = 'block';
  
  console.log(`FadeIn aplicado a: ${element.id || element.className}`);
}

export function fadeOut(element) {
  if (!element) return;
  
  element.classList.remove('fade-in');
  element.classList.add('fade-out');
  
  // Ocultar después de la transición
  setTimeout(() => {
    element.style.display = 'none';
    element.classList.add('hidden');
  }, 400); // Duración sincronizada con CSS
  
  console.log(`FadeOut aplicado a: ${element.id || element.className}`);
}

// ============================================
// SLIDE - Para contenido principal (lower thirds)
// ============================================
export function slideIn(element) {
  if (!element) return;
  
  element.classList.remove('slide-out', 'hidden');
  element.classList.add('slide-in');
  element.style.display = 'block';
  
  console.log(`SlideIn aplicado a: ${element.id || element.className}`);
}

export function slideOut(element) {
  if (!element) return;
  
  element.classList.remove('slide-in');
  element.classList.add('slide-out');
  
  // Ocultar después de la transición
  setTimeout(() => {
    element.style.display = 'none';
    element.classList.add('hidden');
  }, 500); // Duración sincronizada con CSS
  
  console.log(`SlideOut aplicado a: ${element.id || element.className}`);
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

// Función para mostrar/ocultar con animación apropiada
export function toggleVisibility(element, isVisible, animationType = 'slide') {
  if (!element) return;
  
  if (isVisible) {
    if (animationType === 'fade') {
      fadeIn(element);
    } else {
      slideIn(element);
    }
  } else {
    if (animationType === 'fade') {
      fadeOut(element);
    } else {
      slideOut(element);
    }
  }
}

// Función para aplicar animación según tipo de elemento
export function animateElement(element, isVisible) {
  if (!element) return;
  
  const elementId = element.id;
  
  // Determinar tipo de animación según elemento
  if (elementId === 'logo' || elementId === 'grafico-publicidad') {
    // Logos y publicidad usan fade
    toggleVisibility(element, isVisible, 'fade');
  } else {
    // Lower thirds usan slide
    toggleVisibility(element, isVisible, 'slide');
  }
}

// ============================================
// FUNCIONES LEGACY - Para compatibilidad
// (Se pueden eliminar después de migrar completamente)
// ============================================

// Mantener compatibilidad con código existente
export function slideInLeft(element) {
  console.warn('slideInLeft deprecated - usando slideIn');
  slideIn(element);
}

export function slideOutLeft(element) {
  console.warn('slideOutLeft deprecated - usando slideOut');
  slideOut(element);
}

export function slideInTop(element) {
  console.warn('slideInTop deprecated - usando slideIn');
  slideIn(element);
}

export function slideOutTop(element) {
  console.warn('slideOutTop deprecated - usando slideOut');
  slideOut(element);
}

// ============================================
// DEBUG Y UTILIDADES
// ============================================

// Función para debugging
export function logAnimationState(element) {
  if (!element) return;
  
  console.log(`Estado de ${element.id}:`, {
    display: element.style.display,
    opacity: getComputedStyle(element).opacity,
    transform: getComputedStyle(element).transform,
    classes: element.className
  });
}

// Función para resetear estados
export function resetElementState(element) {
  if (!element) return;
  
  element.classList.remove('fade-in', 'fade-out', 'slide-in', 'slide-out', 'hidden');
  element.style.display = 'none';
  element.style.opacity = '';
  element.style.transform = '';
  
  console.log(`Estado reseteado para: ${element.id}`);
}

/* ============================================
   ELIMINADAS LAS SIGUIENTES FUNCIONES COMPLEJAS:
   - slideInLeft/slideOutLeft con timers específicos
   - slideInTop/slideOutTop con diferentes duraciones  
   - Múltiples setTimeout anidados
   - Animaciones con duraciones variables (300ms, 700ms, 1000ms)
   
   AHORA: Solo 2 animaciones básicas (fade + slide)
   con duraciones consistentes (400ms fade, 500ms slide)
   ============================================ */
