// Cria um elemento ja com as classes e o texto no lugar.
// Existe porque as duas telas montam lista na mao e repetiam essas tres linhas.
function criarElemento(tag, classes, texto = "") {
    const elemento = document.createElement(tag);

    elemento.className = classes;
    elemento.textContent = texto;

    return elemento;
}
