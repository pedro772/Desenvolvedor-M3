export const allColors = ["Amarelo", "Azul", "Branco", "Cinza", "Laranja", "Verde", "Vermelho", "Preto", "Rosa", "Vinho"];
export const allSizes = ["P", "M", "G", "GG", "U", "36", "38", "40", "42", "44", "46"];
export const allPriceRanges = [[0, 50], [50, 150], [150, 300], [300, 500], [500, Number.MAX_SAFE_INTEGER]];
export const allSortOptions = ["Mais recentes", "Menor preço", "Maior preço"];

export const arrayEquals = (a, b) => {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}