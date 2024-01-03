export default class DnD {
  constructor(board, hoverElements, cardsVerticalDistance) {
    this.board = board;
    this.hoverElements = hoverElements;
    this.cardsVerticalDistance = cardsVerticalDistance;
    this.draggedEl = null;
    this.ghostEl = null;
    this.template = null;
    this.origin = {};
  }

  toggleGrabbing() {
    document.body.parentElement.classList.toggle('grabbing');
    this.hoverElements.forEach((element) => {
      element.classList.toggle('hover');
    });
  }

  insertElement(event, closest, element) {
    const card = closest.closest('.list-card');
    let list;
    if (!card) {
      list = closest;
      let upCard = document
        .elementFromPoint(event.clientX, event.clientY - this.cardsVerticalDistance);
      let downCard = document
        .elementFromPoint(event.clientX, event.clientY + this.cardsVerticalDistance);
      if (upCard.className.startsWith('list-card')) {
        upCard = upCard.closest('.list-card');
        if (upCard) {
          list.insertBefore(element, upCard.nextElementSibling);
        }
      } else if (downCard.className.startsWith('list-card')) {
        downCard = downCard.closest('.list-card');
        if (downCard) {
          list.insertBefore(element, downCard);
        }
      } else {
        list.insertAdjacentElement('afterbegin', element);
      }
    } else {
      list = card.closest('.list-cards');
      const { top } = card.getBoundingClientRect();

      if (event.pageY > window.scrollY + top + card.offsetHeight / 2) {
        list.insertBefore(element, card.nextElementSibling);
      } else {
        list.insertBefore(element, card);
      }
    }
  }

  getCardBack() {
    const target = this.origin.sibling;
    target.insertAdjacentElement(this.origin.position, this.draggedEl);
  }

  handleMousedown() {
    this.board.addEventListener('mousedown', (event) => {
      event.preventDefault();

      // если карточки под курсором нет, выходим
      const card = event.target.closest('.list-card');
      if (
        !card
        || event.target.classList.contains('list-card-remover')
        || event.target.className.startsWith('card-composer')
      ) {
        return;
      }

      // запоминаем исходное расположение карточки и курсора
      if (card.nextElementSibling
        && card.nextElementSibling.classList.contains('list-card')
      ) {
        this.origin.position = 'beforebegin';
        this.origin.sibling = card.nextElementSibling;
      } else if (
        card.previousElementSibling
        && card.previousElementSibling.classList.contains('list-card')
      ) {
        this.origin.position = 'afterend';
        this.origin.sibling = card.previousElementSibling;
      } else {
        this.origin.position = 'afterbegin';
        this.origin.sibling = card.closest('.list-cards');
      }
      this.origin.shiftX = event.clientX - card.getBoundingClientRect().left;
      this.origin.shiftY = event.clientY - card.getBoundingClientRect().top;
      this.origin.left = event.pageX - this.origin.shiftX;
      this.origin.top = event.pageY - this.origin.shiftY;

      // запоминаем исходную карточку
      this.draggedEl = card;

      // создаём "летающую" карточку
      this.ghostEl = card.cloneNode(true);
      this.ghostEl.classList.add('dragged');
      document.body.appendChild(this.ghostEl);
      this.ghostEl.style.left = `${this.origin.left}px`;
      this.ghostEl.style.top = `${this.origin.top}px`;

      // создаём "тень" летающей карточки на месте исходной
      this.template = card.cloneNode(true);
      this.template.style.backgroundColor = '#e2e4ea';
      this.template.style.boxShadow = 'none';
      this.template.lastElementChild.style.display = 'none';
      this.template.style.cursor = 'grabbing';
      const title = this.template.querySelector('.list-card-title');
      title.style.color = '#e2e4ea';
      card.replaceWith(this.template);

      // отключаем hover эффекты и активируем курсор "grabbing"
      this.toggleGrabbing();
    });
  }

  handleMousemove() {
    this.board.addEventListener('mousemove', (event) => {
      event.preventDefault();

      // если карточка не схвачена, выходим
      if (!this.draggedEl) {
        return;
      }

      // поворачиваем "летающую" карточку
      this.ghostEl.classList.add('transformed');

      // удаляем "тень" из предыдущего положения
      this.template.remove();

      // вставляем "тень", если есть доступное место
      const closest = document.elementFromPoint(event.clientX, event.clientY);
      if (closest.className.startsWith('list-card')) {
        this.insertElement(event, closest, this.template);
      }

      // обновляем координаты "летающей" карточки
      this.ghostEl.style.left = `${event.pageX - this.origin.shiftX}px`;
      this.ghostEl.style.top = `${event.pageY - this.origin.shiftY}px`;
    });
  }

  handleMouseleave() {
    this.board.addEventListener('mouseleave', () => {
      // если карточка не схвачена, выходим
      if (!this.draggedEl) {
        return;
      }

      // удаляем "тень"
      this.template.remove();

      // возвращаем карточку туда, откуда она была взята
      this.getCardBack();

      // удаляем "летающую" карточку
      document.body.removeChild(this.ghostEl);

      // включаем hover эффекты и деактивируем курсор "grabbing"
      this.toggleGrabbing();

      // очищаем исходные данные
      this.ghostEl = null;
      this.draggedEl = null;
      this.template = null;
      this.origin = {};
    });
  }

  handleMouseup() {
    this.board.addEventListener('mouseup', (event) => {
      // если карточка не схвачена, выходим
      if (!this.draggedEl) {
        return;
      }

      // удаляем "тень"
      this.template.remove();

      const closest = document.elementFromPoint(event.clientX, event.clientY);
      if (
        Math.trunc(this.origin.left) === parseInt(this.ghostEl.style.left, 10)
        && Math.trunc(this.origin.top) === parseInt(this.ghostEl.style.top, 10)
      ) {
        // если карточка в исходном положении, то вернём её обратно
        const target = this.origin.sibling;
        target.insertAdjacentElement(this.origin.position, this.draggedEl);
      } else if (closest.className.startsWith('list-card')) {
        // если карточка была перемещена в новую позицию, то вставим в новую
        this.insertElement(event, closest, this.draggedEl);
        // обновим LocalStorage у старого списка
        const originalCardsList = this.origin.sibling.closest('.list-cards');
        localStorage.setItem(
          originalCardsList.dataset.key,
          originalCardsList.innerText,
        );
        const newCardsList = closest.closest('.list-cards');
        if (originalCardsList !== newCardsList) {
          // если карточка не в старом списке, то обновим LocalStorage нового
          localStorage.setItem(newCardsList.dataset.key, newCardsList.innerText);
        }
      } else {
        // иначе возвращаем карточку туда, откуда она была взята
        this.getCardBack();
      }

      // удаляем "летающую" карточку
      document.body.removeChild(this.ghostEl);

      // очищаем исходные данные
      this.ghostEl = null;
      this.draggedEl = null;
      this.template = null;
      this.origin = {};

      // включаем hover эффекты и деактивируем курсор "grabbing"
      this.toggleGrabbing();
    });
  }
}
