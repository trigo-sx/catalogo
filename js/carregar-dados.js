// ===============================
// ELEMENTOS
// ===============================
const catalogoElement = document.getElementById("catalogo");
const badgeCarrinho = document.getElementById("badge-carrinho");
const btnCarrinho = document.getElementById("btn-carrinho-appbar");
const modalCarrinho = document.getElementById("modal-carrinho");
const fecharModalCarrinho = document.querySelector(".fechar-modal");
const itensCarrinhoEl = document.getElementById("itens-carrinho");
const totalCarrinhoEl = document.getElementById("total-carrinho");
const btnFinalizar = document.getElementById("btn-finalizar");
const searchBar = document.getElementById("search-bar");

// Modal quantidade
const modalQtd = document.getElementById("modal-quantidade");
const fecharQtd = document.querySelector(".fechar-modal-quantidade");
const tituloQtd = document.getElementById("titulo-produto-quantidade");
const imgQtd = document.getElementById("img-produto-quantidade");
const descQtd = document.getElementById("desc-produto-quantidade");
const inputQtd = document.getElementById("input-quantidade");
const btnMenos = document.getElementById("btn-menos-qtd");
const btnMais = document.getElementById("btn-mais-qtd");
const btnConfirmarQtd = document.getElementById("btn-confirmar-quantidade");
const qtdPreview = document.getElementById("qtd-preview");

// ===============================
// ESTADO
// ===============================
let carrinho = JSON.parse(localStorage.getItem('carrinhoSexShop')) || [];
let produtoSelecionado = null;
let quantidadeSelecionada = 1;

// ===============================
// FUNÇÕES AUXILIARES
// ===============================
function formatarPreco(valor) {
    return `R$ ${Number(valor).toFixed(2).replace(".", ",")}`;
}

function agruparItensCarrinho() {
    const map = {};
    carrinho.forEach(item => {
        const chave = `${item.descricao}|||${item.desconto}`;
        if (!map[chave]) map[chave] = { ...item, quantidade: 0 };
        map[chave].quantidade++;
    });
    return Object.values(map);
}

function atualizarBadge() {
    if (!badgeCarrinho) return;
    const total = carrinho.length;
    badgeCarrinho.style.display = total > 0 ? "flex" : "none";
    badgeCarrinho.textContent = total;
}

function atualizarStorage() {
    localStorage.setItem('carrinhoSexShop', JSON.stringify(carrinho));
    atualizarBadge();
}

function calcularTotal() {
    return carrinho.reduce((acc, item) => {
        const preco = item.desconto.replace("R$ ", "").replace(",", ".");
        return acc + parseFloat(preco);
    }, 0);
}

// ===============================
// CARRINHO
// ===============================
function mostrarCarrinho() {
    if (!itensCarrinhoEl) return;

    const agrupados = agruparItensCarrinho();
    const temItens = agrupados.length > 0;

    itensCarrinhoEl.innerHTML = temItens
        ? ''
        : '<p style="text-align:center; padding:2rem; color:#777;">Seu carrinho está vazio.</p>';

    agrupados.forEach((item, idx) => {
        const precoNum = parseFloat(item.desconto.replace("R$ ", "").replace(",", "."));
        const subtotal = formatarPreco(precoNum * item.quantidade);

        const div = document.createElement("div");
        div.className = "item-carrinho";
        div.innerHTML = `
            <div style="flex:1;">
                <strong>${item.descricao}</strong><br>
                <span>${item.desconto}</span>
                ${item.quantidade > 1 ? ` × ${item.quantidade}` : ''}
                ${item.quantidade > 1 ? `<br><small>Subtotal: ${subtotal}</small>` : ''}
            </div>
            <div>
                <button class="btn-diminuir-qtd" data-index="${idx}">-</button>
                <button class="btn-aumentar-qtd" data-index="${idx}">+</button>
                <button class="remover-tudo" data-index="${idx}">×</button>
            </div>
        `;
        itensCarrinhoEl.appendChild(div);
    });

    totalCarrinhoEl.textContent = `Total: ${formatarPreco(calcularTotal())}`;
    btnFinalizar.style.display = temItens ? "block" : "none";

    document.querySelectorAll(".btn-diminuir-qtd").forEach(btn => {
        btn.onclick = e => {
            const item = agrupados[e.target.dataset.index];
            const idx = carrinho.findIndex(i =>
                i.descricao === item.descricao && i.desconto === item.desconto
            );
            if (idx > -1) carrinho.splice(idx, 1);
            atualizarStorage();
            mostrarCarrinho();
        };
    });

    document.querySelectorAll(".btn-aumentar-qtd").forEach(btn => {
        btn.onclick = e => {
            carrinho.push({ ...agrupados[e.target.dataset.index] });
            atualizarStorage();
            mostrarCarrinho();
        };
    });

    document.querySelectorAll(".remover-tudo").forEach(btn => {
        btn.onclick = e => {
            const item = agrupados[e.target.dataset.index];
            carrinho = carrinho.filter(i =>
                !(i.descricao === item.descricao && i.desconto === item.desconto)
            );
            atualizarStorage();
            mostrarCarrinho();
        };
    });
}

// ===============================
// MODAL QUANTIDADE
// ===============================
function abrirModalQuantidade(produto) {
    produtoSelecionado = produto;
    quantidadeSelecionada = 1;

    tituloQtd.textContent = "Adicionar ao carrinho";
    imgQtd.src = produto.imagem;
    descQtd.innerHTML = `<strong>${produto.descricao}</strong><br>${produto.desconto}`;
    inputQtd.value = 1;
    qtdPreview.textContent = 1;

    modalQtd.style.display = "flex";
}

btnMenos.onclick = () => {
    if (quantidadeSelecionada > 1) {
        quantidadeSelecionada--;
        qtdPreview.textContent = quantidadeSelecionada;
        inputQtd.value = quantidadeSelecionada;
    }
};

btnMais.onclick = () => {
    if (quantidadeSelecionada < 99) {
        quantidadeSelecionada++;
        qtdPreview.textContent = quantidadeSelecionada;
        inputQtd.value = quantidadeSelecionada;
    }
};

btnConfirmarQtd.onclick = () => {
    for (let i = 0; i < quantidadeSelecionada; i++) {
        carrinho.push({ ...produtoSelecionado });
    }
    atualizarStorage();
    modalQtd.style.display = "none";
};

fecharQtd.onclick = () => modalQtd.style.display = "none";

// ===============================
// FETCH PRODUTOS (COM DESCONTO + OBS)
// ===============================
fetch('./dados-produtos.json')
    .then(r => r.json())
    .then(dados => {
        catalogoElement.innerHTML = '';

        for (let cat in dados) {
            const secao = document.createElement('div');
            secao.id = cat;
            secao.className = 'catalogo__categoria';

            const titulo = document.createElement('h3');
            titulo.textContent = dados[cat].categoria;

            const grid = document.createElement('div');
            grid.className = 'catalogo__categoria-itens';

            dados[cat].itens.forEach(item => {
                const temDesconto = item.desconto > 0;

                const precoOriginal = formatarPreco(item.preco);
                const precoFinal = temDesconto
                    ? formatarPreco(item.preco - item.desconto)
                    : precoOriginal;

                const card = document.createElement('div');
                card.className = 'card__produto';

                card.innerHTML = `
                    <img src="${item.imagem}" alt="${item.descricao}">
                    <div class="card__produto-info">
                        <h3>${item.descricao}</h3>

                        <div class="precos-produto">

                        ${item.obs ? `<p class="obs-produto">${item.obs}</p>` : ''}

                        ${temDesconto
                        ? `<p class="preco-riscado">De ${precoOriginal}</p>
                                   <p class="preco-destaque">Por ${precoFinal}</p>`
                        : `<p class="preco-destaque">${precoOriginal}</p>`
                    }

                        

                        <button class="btn-adicionar">Adicionar</button>
                        </div>
                    </div>
                `;

                card.querySelector(".btn-adicionar").onclick = () =>
                    abrirModalQuantidade({ ...item, desconto: precoFinal });

                grid.appendChild(card);
            });

            secao.append(titulo, grid);
            catalogoElement.appendChild(secao);
        }

        atualizarBadge();
    });

// ===============================
// MODAL CARRINHO
// ===============================
btnCarrinho.onclick = () => {
    mostrarCarrinho();
    modalCarrinho.style.display = "flex";
};

fecharModalCarrinho.onclick = () => modalCarrinho.style.display = "none";

// btnFinalizar.onclick = () => {
//     if (!carrinho.length) return;

//     const agrupados = agruparItensCarrinho();
//     let msg = "Olá! Pedido:\n\n";

//     agrupados.forEach(i => {
//         msg += `• ${i.descricao} ${i.desconto} × ${i.quantidade}\n`;
//     });

//     msg += `\nTotal: ${formatarPreco(calcularTotal())}`;
//     window.open(`https://wa.me/5554999736061=${encodeURIComponent(msg)}`);
// };

btnFinalizar.onclick = () => {
    if (!carrinho.length) return;

    const agrupados = agruparItensCarrinho();
    let msg = "Olá, tudo bem?\n";
    msg += "O meu pedido vai ser:\n\n";

    agrupados.forEach(item => {
        const precoUnitario = item.desconto;
        const precoNum = parseFloat(precoUnitario.replace("R$ ", "").replace(",", "."));
        const subtotal = formatarPreco(precoNum * item.quantidade);

        msg += `*${item.descricao}*\n`;
        msg += `Quantidade: ${item.quantidade}\n`;
        msg += `Valor un.: ${precoUnitario}\n`;
        msg += `Total do produto: ${subtotal}\n\n`;
    });

    msg += `*VALOR TOTAL DO PEDIDO: ${formatarPreco(calcularTotal())}*\n\n`;
    msg += "_*Não altere essa mensagem*_";

    window.open(`https://wa.me/5554999736061?text=${encodeURIComponent(msg)}`);
};


// ===============================
atualizarBadge();
mostrarCarrinho();


// ==============================================
// CARROSSEL DINÂMICO – ajusta automaticamente
// ==============================================
const carousel = document.getElementById('banner');
if (carousel) {
    const slidesContainer = carousel.querySelector('.slides');
    const slides = carousel.querySelectorAll('.slide');
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    const dotsContainer = carousel.querySelector('.dots');

    let currentIndex = 0;
    const totalSlides = slides.length;
    const intervalTime = 5000; // 5 segundos
    let autoInterval;

    // Cria os dots dinamicamente
    if (dotsContainer && totalSlides > 1) {
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.dataset.index = i;
            dotsContainer.appendChild(dot);
        }
    }

    const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];

    function showSlide(index) {
        // Ajusta a largura do container e move
        slidesContainer.style.width = `${totalSlides * 100}%`;
        slides.forEach(slide => {
            slide.style.width = `${100 / totalSlides}%`;
        });

        slidesContainer.style.transform = `translateX(-${index * (100 / totalSlides)}%)`;

        // Atualiza classes active
        slides.forEach((s, i) => s.classList.toggle('active', i === index));
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        showSlide(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        showSlide(currentIndex);
    }

    // Eventos
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            clearInterval(autoInterval);
            nextSlide();
            autoInterval = setInterval(nextSlide, intervalTime);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            clearInterval(autoInterval);
            prevSlide();
            autoInterval = setInterval(nextSlide, intervalTime);
        });
    }

    // Clique nos dots
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            clearInterval(autoInterval);
            currentIndex = parseInt(dot.dataset.index);
            showSlide(currentIndex);
            autoInterval = setInterval(nextSlide, intervalTime);
        });
    });

    // Pausa no hover
    carousel.addEventListener('mouseenter', () => clearInterval(autoInterval));
    carousel.addEventListener('mouseleave', () => autoInterval = setInterval(nextSlide, intervalTime));

    // Inicializa
    if (totalSlides > 0) {
        showSlide(0);
        if (totalSlides > 1) {
            autoInterval = setInterval(nextSlide, intervalTime);
        }
    }
}

// Drawer
const menuBtn = document.getElementById('menu-btn');
const closeDrawer = document.getElementById('close-drawer');
const drawer = document.getElementById('drawer');
const overlay = document.getElementById('overlay');

menuBtn?.addEventListener('click', () => { drawer?.classList.add('open'); overlay?.classList.remove('hidden'); });
closeDrawer?.addEventListener('click', () => { drawer?.classList.remove('open'); overlay?.classList.add('hidden'); });
overlay?.addEventListener('click', () => { drawer?.classList.remove('open'); overlay?.classList.add('hidden'); });

document.querySelectorAll('.drawer-list a').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
        drawer?.classList.remove('open');
        overlay?.classList.add('hidden');
    });
});

// Busca
document.getElementById('search-toggle')?.addEventListener('click', () => {
    document.getElementById('search-bar-container')?.classList.toggle('hidden');
    searchBar?.focus();
});

function filtrarProdutos(termo) {
    termo = (termo || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    if (!termo) {
        document.querySelectorAll('.catalogo__categoria, .card__produto').forEach(el => el.style.display = '');
        return;
    }
    document.querySelectorAll('.catalogo__categoria').forEach(cat => {
        let visivel = false;
        cat.querySelectorAll('.card__produto').forEach(card => {
            const desc = card.querySelector('h3')?.textContent?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || "";
            const match = desc.includes(termo);
            card.style.display = match ? '' : 'none';
            if (match) visivel = true;
        });
        cat.style.display = visivel ? '' : 'none';
    });
}

searchBar?.addEventListener("input", e => filtrarProdutos(e.target.value));