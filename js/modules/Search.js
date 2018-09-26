import $ from 'jquery';

class Search {
  constructor() {
    this.addSearchHTML();
    this.openSearch = $(".js-search-trigger");
    this.closeSearch = $(".search-overlay__close");
    this.searchOverlay = $(".search-overlay");
    this.searchResults = $("#search-overlay__results");
    this.searchField = $("#search-term");
    this.previousValue;
    this.typingTimer;
    this.isLoading= false;
    this.events();
  }

  events() {
    this.openSearch.on("click", this.openOverlay.bind(this));
    this.closeSearch.on("click", this.closeOverlay.bind(this));
    this.searchField.on("keyup", this.userInput.bind(this));
  }

  userInput() {
    if (this.searchField.val() != this.previousValue) {
      clearTimeout(this.typingTimer);

      if (this.searchField.val()) {
        if (!this.isLoading) {
          this.searchResults.html(`<div class="spinner-loader"></div>`);
          this.isLoading = true;
        }
        this.typingTimer = setTimeout(this.getResults.bind(this), 500);
      } else {
        this.searchResults.html('');
        this.isLoading = false;
      }
    }

    this.previousValue = this.searchField.val();
  }

  getResults() {
    $.getJSON(`${universityData['root_url']}/wp-json/university/v1/search?term=${this.searchField.val()}`, (results) => {
      this.searchResults.html(`
        <div class="row">
          <div class="one-third">
            <h2 class="search-overlay__section-title">General Information</h2>
            ${results.generalInfo.length ? '<ul class="link-list min-list">' : '<p>No general information matches that search.</p>'}
              ${results.generalInfo.map(item => `<li><a href="${item.link}">${item.title}</a> ${item.postType == 'post' ? `by ${item.authorName}` : ''}</li>`).join('')}
            ${results.generalInfo.length ? '</ul>' : ''}
          </div>
          <div class="one-third">
            <h2 class="search-overlay__section-title">Programs</h2>
            ${results.programs.length ? '<ul class="link-list min-list">' : `<p>No programs match that search. <a href="${universityData.root_url}/programs">View all programs</a></p>`}
              ${results.programs.map(item => `<li><a href="${item.link}">${item.title}</a></li>`).join('')}
            ${results.programs.length ? '</ul>' : ''}

            <h2 class="search-overlay__section-title">Professors</h2>
            ${results.professors.length ? '<ul class="professor-cards">' : `<p>No professors match that search.</p>`}
              ${results.professors.map(item => `
                <li class="professor-card__list-item">
                  <a class="professor-card" href="${item.link}">
                  <img src="${item.img}" alt="" class="professor-card__image">
                  <span class="professor-card__name">${item.title}></span>
                  </a>
                </li>`).join('')}
            ${results.professors.length ? '</ul>' : ''}
          </div>
          <div class="one-third">
            <h2 class="search-overlay__section-title">Campuses</h2>
            ${results.campuses.length ? '<ul class="link-list min-list">' : `<p>No campuses match that search. <a href="${universityData.root_url}/campuses">View all campuses</a></p>`}
              ${results.campuses.map(item => `<li><a href="${item.link}">${item.title}</a></li>`).join('')}
            ${results.campuses.length ? '</ul>' : ''}

            <h2 class="search-overlay__section-title">Events</h2>
            ${results.events.length ? '' : `<p>No events match that search. <a href="${universityData.root_url}/events">View all events</a></p>`}
            ${results.events.map(item => `
              <div class="event-summary">
                <a class="event-summary__date t-center" href="${item.link}">
                  <span class="event-summary__month">${item.month}</span>
                  <span class="event-summary__day">${item.day}</span>  
                </a>
                <div class="event-summary__content">
                  <h5 class="event-summary__title headline headline--tiny"><a ${item.link}>"${item.title}</a></h5>
                  <p>${item.description}<a href="${item.title}" class="nu gray">Learn more</a></p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `);
      this.isLoading = false;
    });
  }

  openOverlay() {
    this.searchOverlay.addClass("search-overlay--active");
    $("body").addClass("body-no-scroll");
    this.searchField.val('');
    setTimeout(() => this.searchField.focus(), 301);
    return false;
  }

  closeOverlay() {
    this.searchOverlay.removeClass('search-overlay--active');
    $("body").removeClass("body-no-scroll");
    this.searchResults.html('');
  }

  addSearchHTML() {
    $("body").append(`
      <div class="search-overlay">
        <div class="search-overlay__top">
          <div class="container">
            <i class="fa fa-search search-overlay__icon" aria-hidden="true"></i>
            <input type="text" id="search-term" class="search-term" placeholder="what are you looking for?">
            <i class="search-overlay__close fa fa-window-close" aria-hidden="true"></i>
          </div>
        </div>
        <div class="container">
          <div id="search-overlay__results"></div>
        </div>
      </div>
    `);
  }
}

export default Search;