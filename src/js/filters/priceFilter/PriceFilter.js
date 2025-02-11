import { allPriceRanges } from "../../utils";

export default class PriceFilter extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.updateComponent(this);
  }

  dispatchOptionSelectedEvent(event, node) {
    const optionSelected = new CustomEvent('optionselected', {
      detail: {
        value: event.detail.value,
        isChecked: event.detail.isChecked
      }
    })

    node.dispatchEvent(optionSelected)
  }

  updateComponent(node) {
    const priceFilterContainer = document.createElement("fieldset");
    priceFilterContainer.classList.add("filter__container");
    priceFilterContainer.setAttribute("id", "priceFilterContainer");
    node.append(priceFilterContainer);

    const filterTitle = document.createElement("legend");
    filterTitle.classList.add("filter__title")
    filterTitle.innerHTML = "FAIXA DE PREÇO";
    priceFilterContainer.appendChild(filterTitle);

    allPriceRanges.map((priceRange, i) => {
      const priceOption = document.createElement("price-option");
      const range = `${priceRange[0]}, ${priceRange[1]}`;
      let labelText;

      if(i === (allPriceRanges.length - 1)) {
        labelText = `a partir de R$${priceRange[0]}`;
      } else {
        labelText = `de R$${priceRange[0]} até R$${priceRange[1]}`;
      }

      priceOption.data = {
        labelText: labelText,
        range: range,
        disabled: false
      }

      priceOption.addEventListener("optionselected", (e) => this.dispatchOptionSelectedEvent(e, node));
      priceFilterContainer.appendChild(priceOption);
    });
  }
}