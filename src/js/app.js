import List from './List';
import DnD from './DnD';

const containers = document.querySelectorAll('.list-container');

containers.forEach((container) => {
  const list = new List(container);
  list.bindToDOM();
});

const board = document.querySelector('.board');
const hoverElements = document.querySelectorAll('.hover');
const cardsVerticalDistance = 8;
const dragAndDrop = new DnD(board, hoverElements, cardsVerticalDistance);

dragAndDrop.handleMousedown();
dragAndDrop.handleMousemove();
dragAndDrop.handleMouseleave();
dragAndDrop.handleMouseup();

// при нажатии Enter добавим карточку, закроем меню и очистим поле ввода
document.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    const cardsList = document.activeElement.closest('.list-cards');
    const addBtn = cardsList.querySelector('.new-card-button');
    const closeBtn = addBtn.nextElementSibling;
    addBtn.click();
    closeBtn.click();
    document.activeElement.value = '';
  }
});
