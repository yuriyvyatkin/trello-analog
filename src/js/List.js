export default class List {
  constructor(parentEl) {
    this.parentEl = parentEl;
  }

  static listMarkup(listName, localStorageKey) {
    return `
        <div class="list-wrapper">
          <div class="list">
            <div class="list-header">
              <h2 class="list-header-name">${listName}</h2>
            </div>
            <div class="list-cards" data-key="${localStorageKey}">
              <!-- раскрытое меню -->
              <div class="card-composer hide">
                <div class="card-composer list-card">
                  <div class="card-composer list-card-details">
                    <textarea class="card-composer-textarea hover" placeholder="Введите заголовок для этой карточки"></textarea>
                  </div>
                </div>
                <div class="controls">
                  <div class="controls-section">
                    <input class="new-card-button hover" type="button" value="Добавить карточку">
                    <button class="icon-close hover" type="button"></button>
                  </div>
                </div>
              </div>
            </div>
            <!-- закрытое меню -->
            <div class="card-composer-container">
              <a class="open-card-composer hover">
                <span class="icon-add"></span>
                <span class="add-a-card">Добавить карточку</span>
              </a>
            </div>
          </div>
        </div>
    `;
  }

  static cardMarkup(title) {
    if (title !== '') {
      return `
        <a class="list-card hover" href="#">
          <div class="list-card-details">
            <span class="list-card-title">
              ${title}
            </span>
          </div>
          <div class="list-card-remover hover"></div>
        </a>
      `;
    }

    return '';
  }

  static get cardComposerSelector() {
    return '.card-composer';
  }

  static get cardComposerContainerSelector() {
    return '.card-composer-container';
  }

  static get iconCloseSelector() {
    return '.icon-close';
  }

  static get newCardButtonSelector() {
    return '.new-card-button';
  }

  static get textareaSelector() {
    return '.card-composer-textarea';
  }

  static get cardsListSelector() {
    return '.list-cards';
  }

  static get cardSelector() {
    return '.list-card';
  }

  static get cardRemoverSelector() {
    return '.list-card-remover';
  }

  bindToDOM() {
    const { listName, localStorageKey } = this.parentEl.dataset;
    this.parentEl.innerHTML = this.constructor.listMarkup(listName, localStorageKey);

    const data = localStorage.getItem(localStorageKey);
    const composer = this.parentEl.querySelector(this.constructor.cardComposerSelector);
    this.constructor.init(
      data,
      composer,
      this.constructor.cardMarkup,
    );

    const opener = this.parentEl.querySelector(this.constructor.cardComposerContainerSelector);
    const textarea = this.parentEl.querySelector(this.constructor.textareaSelector);
    opener.addEventListener('click', () => this.constructor.openCardComposer(
      opener,
      composer,
      textarea,
    ));

    const closer = this.parentEl.querySelector(this.constructor.iconCloseSelector);
    closer.addEventListener('click', () => this.constructor.closeCardComposer(
      opener,
      composer,
    ));

    composer.addEventListener('click', () => this.constructor.focusOnCardComposer(composer));

    const addBtn = this.parentEl.querySelector(this.constructor.newCardButtonSelector);
    const cardsList = this.parentEl.querySelector(this.constructor.cardsListSelector);
    addBtn.addEventListener('click', () => this.constructor.addNewCard(
      cardsList,
      composer,
      this.constructor.cardMarkup(textarea.value),
    ));

    cardsList.addEventListener('click', (event) => this.constructor.deleteCard(
      cardsList,
      event,
      this.constructor.cardSelector,
      this.constructor.cardRemoverSelector,
    ));
  }

  static init(data, composer, getMarkup) {
    if (data) {
      let html = '';

      const cardsTitles = data.split('\n');
      cardsTitles.forEach((cardTitle) => {
        html += getMarkup(cardTitle);
      });

      composer.insertAdjacentHTML('beforebegin', html);
    }
  }

  static openCardComposer(opener, composer, textarea) {
    opener.classList.add('hide');
    composer.classList.remove('hide');
    textarea.focus();
  }

  static closeCardComposer(opener, composer) {
    opener.classList.remove('hide');
    composer.classList.add('hide');
  }

  static focusOnCardComposer(composer) {
    const textarea = composer.querySelector('textarea');
    textarea.focus();
  }

  static addNewCard(cardsList, composer, markup) {
    const textarea = composer.querySelector('textarea');
    if (markup !== '') {
      composer.insertAdjacentHTML('beforebegin', markup);
      localStorage.setItem(cardsList.dataset.key, cardsList.innerText);
      textarea.value = '';
    } else {
      textarea.focus();
    }
  }

  static deleteCard(cardsList, event, cardSelector, cardRemoverSelector) {
    const { target } = event;

    if (target.className.includes(cardRemoverSelector.slice(1))) {
      target.closest(cardSelector).remove();

      if (cardsList.children.length > 1) {
        localStorage.setItem(cardsList.dataset.key, cardsList.innerText);
      } else {
        localStorage.removeItem(cardsList.dataset.key);
      }
    }
  }
}
