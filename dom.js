function criarElemento(tag, classes, texto = "") {
    const elemento = document.createElement(tag);

    elemento.className = classes;
    elemento.textContent = texto;

    return elemento;
}
