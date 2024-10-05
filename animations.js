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
