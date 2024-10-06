// Función para desvanecer un elemento
export function fadeIn(element) {
  element.classList.remove('fade-out');
  element.classList.add('fade-in');
  element.style.display = 'block';
}

// Función para ocultar un elemento desvaneciéndolo
export function fadeOut(element) {
  element.classList.remove('fade-in');
  element.classList.add('fade-out');
  setTimeout(() => {
    element.style.display = 'none';
  }, 300); // Corresponde a la duración de la transición en CSS
}

// Función para deslizar un elemento hacia adentro
export function slideIn(element) {
  element.classList.remove('slide-out');
  element.classList.add('slide-in');
  element.style.display = 'block';
}

// Función para deslizar un elemento hacia afuera
export function slideOut(element) {
  element.classList.remove('slide-in');
  element.classList.add('slide-out');
  setTimeout(() => {
    element.style.display = 'none';
  }, 300); // Corresponde a la duración de la transición en CSS
}

export function slideInLeft(element) {
  element.classList.remove('slide-out-left');
  element.classList.add('slide-in-left');
  element.style.display = 'block';  // Asegúrate de que el elemento sea visible
}

export function slideOutLeft(element) {
  element.classList.remove('slide-in-left');
  element.classList.add('slide-out-left');
  setTimeout(() => {
    element.style.display = 'none';  // Oculta el elemento después de la animación
  }, 300);  // Duración de la animación
}


export function slideInTop(element) {
  element.classList.remove('slide-out-top');
  element.classList.add('slide-in-top');
  element.style.display = 'block';  // Asegúrate de que el elemento sea visible
}

export function slideOutTop(element) {
  element.classList.remove('slide-in-top');
  element.classList.add('slide-out-top');
  setTimeout(() => {
    element.style.display = 'none';  // Oculta el elemento después de la animación
  }, 300);  // Duración de la animación
}
