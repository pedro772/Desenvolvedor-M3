import { arrayEquals } from "./utils";

export default class App extends HTMLElement {
  constructor() {
    super();

    this._state = {};

    this.dataToFilter = {
      colors: [],
      sizes: [],
      priceRanges: []
    }

    this.dataToSort = {
      dates: [],
      prices: []
    }

    this.filteredData = [];

    this.itemsInCart = 0;

    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        @import "main.css"
      </style>
    `;
  }

  set state(value) {
    this._state = value;
  }

  get state() {
    return this._state;
  }

  connectedCallback() {
    this.updateComponent(this);
  }

  sortFilter(sortBy, node, appContainerNode) {
    let sortedData = [];

    switch (sortBy) {
      case "Mais recentes":
        node.data.forEach(product => this.dataToSort.dates.push(product.date));
        this.dataToSort.dates = this.dataToSort.dates.sort((a, b) => a - b);

        this.dataToSort.dates.forEach(date => {
          node.data.forEach(product => {
            if(product.date === date) {
              sortedData.unshift(product);
            }
          })
        })
        break;

      case "Menor preço":
        node.data.forEach(product => this.dataToSort.prices.push(product.price));
        this.dataToSort.prices = this.dataToSort.prices.sort((a, b) => a - b);

        this.dataToSort.prices.forEach(price => {
          node.data.forEach(product => {
            if(product.price === price) {
              sortedData.push(product);
            }
          })
        })
        break;

      case "Maior preço":
        node.data.forEach(product => this.dataToSort.prices.push(product.price));
        this.dataToSort.prices = this.dataToSort.prices.sort((a, b) => a - b);

        this.dataToSort.prices.forEach(price => {
          node.data.forEach(product => {
            if(product.price === price) {
              sortedData.unshift(product);
            }
          })
        })
        break;

      default:
        break;
    }

    sortedData = new Set(sortedData);
    const uniqueSortedData = Array.from(sortedData);
    node.data = uniqueSortedData;
    this.setExpandableProducts(appContainerNode);
  }

  filter(value, valueIsChecked, filterType, node, sortFilterElement, appContainerNode) {
    this.filteredData = this.state.data;

    switch (filterType) {
      case "size":
        valueIsChecked ?
          this.dataToFilter.sizes.push(value)
        :
          this.dataToFilter.sizes = this.dataToFilter.sizes.filter(sizeToFilter => sizeToFilter !== value);
        break;
      
      case "color":
        valueIsChecked ?
          this.dataToFilter.colors.push(value)
        :
          this.dataToFilter.colors = this.dataToFilter.colors.filter(colorToFilter => colorToFilter !== value);
        break;

      case "priceRange":
        const rangeArr = value.split(',').map(str => Number(str));

        valueIsChecked ?
          this.dataToFilter.priceRanges.push(rangeArr)
        :
          this.dataToFilter.priceRanges = this.dataToFilter.priceRanges.filter(rangeToFilter => !arrayEquals(rangeToFilter, rangeArr));
        break;

      default:
        return;
    }

    this.filteredData.forEach(product => {
      const IsPriceInRange = (priceRange) => product.price > priceRange[0] && product.price <= priceRange[1];

      if(!this.dataToFilter.priceRanges.some(IsPriceInRange) && this.dataToFilter.priceRanges.length > 0) {
        this.filteredData = this.filteredData.filter(productToFilter => productToFilter !== product);
      }

      if(!(this.dataToFilter.colors.some(color => product.color === color)) && this.dataToFilter.colors.length > 0) {
        this.filteredData = this.filteredData.filter(productToFilter => productToFilter !== product);
      }

      if(!(this.dataToFilter.sizes.some(size => product.size.includes(size))) && this.dataToFilter.sizes.length > 0) {
        this.filteredData = this.filteredData.filter(productToFilter => productToFilter !== product);
      }
    })

    const valueToSortBy = sortFilterElement.firstChild.options[sortFilterElement.firstChild.selectedIndex].value;
    node.data = this.filteredData;
    this.setExpandableProducts(appContainerNode);

    if(valueToSortBy !== sortFilterElement.firstChild.options[0].value) {
      this.sortFilter(valueToSortBy, node, appContainerNode)
    }
  }

  setExpandableProducts(node) {
    const nodeWidth = node.offsetWidth;
    const productsContainerWidth = window.innerWidth > 844 ? (nodeWidth - (((window.innerWidth / 10) * 2) + 204)) : (nodeWidth - 32);
    const productCardWidth = window.innerWidth > 844 ? 195 : 162;
    const numberOfElementsPerRow = Math.floor((productsContainerWidth - ((Math.floor(productsContainerWidth / productCardWidth) - 1) * 64)) / productCardWidth);

    node.querySelectorAll(`.products-container .product:nth-of-type(n + ${Math.pow(numberOfElementsPerRow, 2) + 1})`).forEach(el => el.style.display = "none");

    const seeAllProducts = document.createElement("div");
    seeAllProducts.classList.add("product-list-expand");

    const seeAllProductsButton = document.createElement("button");
    seeAllProductsButton.classList.add("product-list-expand__button");
    seeAllProductsButton.innerHTML = "Carregar mais";
    seeAllProducts.appendChild(seeAllProductsButton);

    seeAllProductsButton.addEventListener("click", (e) => {
      e.preventDefault();
      node.querySelectorAll(".products-container .product").forEach(el => el.style.display = "inherit");
      seeAllProducts.style.display = "none";
    })

    if(node.getElementsByClassName("product-list-expand").length == 0) {
      node.appendChild(seeAllProducts);
    }
  }

  updateItemsInCartCount(node) {
    this.itemsInCart++;

    node.itemsInCart = this.itemsInCart;
  }

  updateComponent(node) {
    const shadow = node.shadowRoot;
    const appContainer = document.createElement("div");
    appContainer.setAttribute("class", "app-container");
    shadow.append(appContainer);

    const pageHeader = document.createElement("header");
    const pageTitle = document.createElement("h1");
    pageTitle.classList.add("page-header__title");
    pageTitle.innerHTML = "blusas";

    const navbar = document.createElement("my-navbar");
    navbar.itemsInCart = this.itemsInCart;
    const footer = document.createElement("my-footer");

    const productsContainer = document.createElement("products-container");
    productsContainer.classList.add("products-container");
    productsContainer.data = this.state.data;
    productsContainer.addEventListener("productbought", () => this.updateItemsInCartCount(navbar));

    const filtersForm = document.createElement("form");
    filtersForm.classList.add("filters-form");

    const filtersContainer = document.createElement("div");
    filtersContainer.classList.add("filters-container--mobile");
    const filtersContainerHeader = document.createElement("div");
    filtersContainerHeader.classList.add("filters-container--mobile__header");
    const filtersContainerTitle = document.createElement("span");
    filtersContainerTitle.innerHTML = "filtrar";
    filtersContainerTitle.classList.add("filters-container--mobile__title");
    const filtersContainerIcon = document.createElement("img");
    filtersContainerIcon.setAttribute("src", "../icon_close.svg");
    filtersContainerIcon.classList.add("filters-container--mobile__icon");
    filtersContainerHeader.appendChild(filtersContainerTitle);
    filtersContainerHeader.appendChild(filtersContainerIcon);
    filtersContainer.appendChild(filtersContainerHeader);

    const sortFilter = document.createElement("sort-filter");
    sortFilter.addEventListener("optionselected", (e) => this.sortFilter(e.detail.value, productsContainer, appContainer));

    const colorFilter = document.createElement("color-filter");
    colorFilter.addEventListener("optionselected", (e) => this.filter(e.detail.value, e.detail.isChecked, "color", productsContainer, sortFilter, appContainer));
    const colorFilterMobile = document.createElement("color-filter");
    colorFilterMobile.addEventListener("optionselected", (e) => this.filter(e.detail.value, e.detail.isChecked, "color", productsContainer, sortFilter, appContainer));

    const sizeFilter = document.createElement("size-filter");
    sizeFilter.addEventListener("optionselected", (e) => this.filter(e.detail.value, e.detail.isChecked, "size", productsContainer, sortFilter, appContainer));
    const sizeFilterMobile = document.createElement("size-filter");
    sizeFilterMobile.addEventListener("optionselected", (e) => this.filter(e.detail.value, e.detail.isChecked, "size", productsContainer, sortFilter, appContainer));

    const priceFilter = document.createElement("price-filter");
    priceFilter.addEventListener("optionselected", (e) => this.filter(e.detail.value, e.detail.isChecked, "priceRange", productsContainer, sortFilter, appContainer));
    const priceFilterMobile = document.createElement("price-filter");
    priceFilterMobile.addEventListener("optionselected", (e) => this.filter(e.detail.value, e.detail.isChecked, "priceRange", productsContainer, sortFilter, appContainer));

    const openFiltersButton = document.createElement("button");
    openFiltersButton.innerHTML = "filtrar";
    openFiltersButton.classList.add("open-filter");

    filtersForm.appendChild(colorFilter);
    filtersForm.appendChild(sizeFilter);
    filtersForm.appendChild(priceFilter);

    const filterButtonsContainer = document.createElement("div");
    filterButtonsContainer.classList.add("filter__buttons");
    const applyFiltersButton = document.createElement("button");
    applyFiltersButton.innerHTML = "aplicar"
    applyFiltersButton.classList.add("filter__button--primary");
    filterButtonsContainer.appendChild(applyFiltersButton);

    const filterOptionsContainer = document.createElement("div");
    filterOptionsContainer.classList.add("filter-options__container--mobile");

    filterOptionsContainer.appendChild(colorFilterMobile);
    filterOptionsContainer.appendChild(sizeFilterMobile);
    filterOptionsContainer.appendChild(priceFilterMobile);
    filterOptionsContainer.appendChild(filterButtonsContainer);
    filtersContainer.appendChild(filterOptionsContainer);

    pageHeader.appendChild(pageTitle);
    pageHeader.appendChild(sortFilter);
    pageHeader.appendChild(openFiltersButton);
    pageHeader.classList.add("page-header");

    const pageMainContent = document.createElement("main");
    pageMainContent.classList.add("main-content");
    const pageAsideContent = document.createElement("aside");
    pageAsideContent.classList.add("aside-content");

    pageAsideContent.appendChild(filtersForm);
    pageMainContent.appendChild(pageAsideContent);
    pageMainContent.appendChild(productsContainer);

    appContainer.appendChild(navbar);
    appContainer.appendChild(pageHeader);
    appContainer.appendChild(pageMainContent);
    appContainer.appendChild(filtersContainer);

    this.setExpandableProducts(appContainer);

    window.addEventListener("resize", () => {
      appContainer.querySelectorAll(".products-container .product").forEach(el => el.style.display = "block");
      this.setExpandableProducts(appContainer);
    })

    openFiltersButton.addEventListener("click", (e) => {
      e.preventDefault();

      navbar.classList.add("hide");
      navbar.classList.remove("show");
      pageHeader.classList.add("hide");
      pageHeader.classList.remove("show");
      filtersContainer.classList.add("show");
      filtersContainer.classList.remove("hide");
      pageMainContent.classList.add("hide");
      pageMainContent.classList.remove("show");
    })

    filtersContainerHeader.addEventListener("click", (e) => {
      e.preventDefault();

      navbar.classList.add("show");
      navbar.classList.remove("hide");
      pageHeader.classList.add("show");
      pageHeader.classList.remove("hide");
      filtersContainer.classList.add("hide");
      filtersContainer.classList.remove("show");
      pageMainContent.classList.add("show");
      pageMainContent.classList.remove("hide");
    })

    applyFiltersButton.addEventListener("click", (e) => {
      e.preventDefault();

      navbar.classList.add("show");
      navbar.classList.remove("hide");
      pageHeader.classList.add("show");
      pageHeader.classList.remove("hide");
      filtersContainer.classList.add("hide");
      filtersContainer.classList.remove("show");
      pageMainContent.classList.add("show");
      pageMainContent.classList.remove("hide");
    })

    appContainer.appendChild(footer);
  }
}