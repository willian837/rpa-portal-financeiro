(function () {
  'use strict';

  const LOGIN_KEY = 'finantech_rpa_logado';
  const STORAGE_KEY = 'finantech_rpa_titulos_v1';

  if (localStorage.getItem(LOGIN_KEY) !== 'true') {
    window.location.replace('login.html');
    return;
  }

  const form = document.getElementById('formFinanceiro');
  const clearFieldsButton = document.getElementById('btnLimparCampos');
  const clearTitlesButton = document.getElementById('btnLimparTabela');
  const logoutButton = document.getElementById('botaoSair');
  const tableBody = document.getElementById('corpoTabela');
  const count = document.getElementById('contadorRegistros');
  const footerSummary = document.getElementById('resumoRodape');
  const emptyState = document.getElementById('estadoVazio');
  const feedback = document.getElementById('feedbackMsg');
  const codeInput = document.getElementById('codigoLancamento');
  let feedbackTimeout;
  let titles = loadTitles();

  function showFeedback(message, type) {
    window.clearTimeout(feedbackTimeout);
    feedback.textContent = message;
    feedback.className = `feedback-toast ${type}`;
    feedbackTimeout = window.setTimeout(() => {
      feedback.className = 'feedback-toast hidden';
      feedback.textContent = '';
    }, 4500);
  }

  function loadTitles() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];

      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        throw new Error('Os dados salvos não estão no formato esperado.');
      }

      const loaded = parsed.map(normalizeTitle);
      loaded.forEach(validateTitle);
      return loaded;
    } catch (error) {
      console.error('Não foi possível carregar os títulos salvos.', error);
      showFeedback('Não foi possível carregar os títulos salvos. Consulte o console para mais detalhes.', 'error');
      return [];
    }
  }

  function saveTitles() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(titles));
      return true;
    } catch (error) {
      console.error('Não foi possível salvar os títulos financeiros.', error);
      showFeedback('Não foi possível salvar os dados. Verifique o espaço disponível no navegador.', 'error');
      return false;
    }
  }

  function formatCurrency(value) {
    return Number(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  function formatDate(value) {
    if (!value) return '—';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  function appendTextCell(row, value, className) {
    const cell = document.createElement('td');
    if (className) cell.className = className;
    cell.textContent = value || '—';
    row.appendChild(cell);
    return cell;
  }

  function createTitleRow(title) {
    const row = document.createElement('tr');
    appendTextCell(row, title.codigo, 'code-cell');

    const companyCell = document.createElement('td');
    const companyName = document.createElement('span');
    companyName.className = 'company-main';
    companyName.textContent = title.empresa;
    const companyDetails = document.createElement('span');
    companyDetails.className = 'company-sub';
    companyDetails.textContent = [title.documento, title.centroCusto].filter(Boolean).join(' · ') || '—';
    companyCell.append(companyName, companyDetails);
    row.appendChild(companyCell);

    const categoryCell = document.createElement('td');
    const category = document.createElement('span');
    category.className = 'cat-pill';
    category.textContent = title.categoria;
    categoryCell.appendChild(category);
    row.appendChild(categoryCell);

    appendTextCell(row, `${title.operacao} · ${title.pagamento}`);

    const documentCell = document.createElement('td');
    const documentNumber = document.createElement('span');
    documentNumber.className = 'nf-main';
    documentNumber.textContent = title.numeroNota || 'Sem documento';
    const dueDate = document.createElement('span');
    dueDate.className = 'venc-pill';
    dueDate.textContent = formatDate(title.vencimento);
    documentCell.append(documentNumber, dueDate);
    row.appendChild(documentCell);

    const installmentCell = document.createElement('td');
    const installmentBadge = document.createElement('span');
    installmentBadge.className = 'parc-badge';
    installmentBadge.textContent = `${title.parcelas}x`;
    installmentCell.appendChild(installmentBadge);
    row.appendChild(installmentCell);

    appendTextCell(row, formatCurrency(title.valor), 'val-cell');
    return row;
  }

  function renderTitles() {
    tableBody.replaceChildren(...titles.map(createTitleRow));
    count.textContent = String(titles.length);
    footerSummary.textContent = `${titles.length} ${titles.length === 1 ? 'título' : 'títulos'}`;
    emptyState.classList.toggle('hidden', titles.length > 0);
  }

  function normalizeTitle(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Os dados do título estão em formato inválido.');
    }

    return {
      id: data.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      codigo: String(data.codigo || '').trim(),
      empresa: String(data.empresa || '').trim(),
      documento: String(data.documento || '').trim(),
      categoria: String(data.categoria || '').trim(),
      operacao: String(data.operacao || '').trim(),
      pagamento: String(data.pagamento || '').trim(),
      centroCusto: String(data.centroCusto || '').trim(),
      codigoBarras: String(data.codigoBarras || '').trim(),
      numeroNota: String(data.numeroNota || '').trim(),
      vencimento: String(data.vencimento || '').trim(),
      parcelas: Number(data.parcelas),
      valor: Number(data.valor),
      createdAt: data.createdAt || new Date().toISOString()
    };
  }

  function validateTitle(title) {
    const requiredFields = [
      ['codigo', 'Código interno'],
      ['empresa', 'Cliente / Fornecedor'],
      ['documento', 'CNPJ / CPF'],
      ['categoria', 'Categoria'],
      ['operacao', 'Tipo de operação'],
      ['pagamento', 'Forma de pagamento'],
      ['vencimento', 'Vencimento']
    ];
    const missing = requiredFields.find(([field]) => !title[field]);
    if (missing) throw new Error(`${missing[1]} é obrigatório.`);
    if (!Number.isInteger(title.parcelas) || title.parcelas < 1) {
      throw new Error('Informe uma quantidade de parcelas igual ou maior que 1.');
    }
    if (!Number.isFinite(title.valor) || title.valor <= 0) {
      throw new Error('Informe um valor de título maior que zero.');
    }
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(title.vencimento);
    if (!dateMatch) throw new Error('Informe uma data de vencimento válida.');
    const [year, month, day] = dateMatch.slice(1).map(Number);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));
    if (
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() !== month - 1 ||
      parsedDate.getUTCDate() !== day
    ) {
      throw new Error('Informe uma data de vencimento válida.');
    }
  }

  function addTitle(data) {
    const title = normalizeTitle(data);
    validateTitle(title);

    const duplicate = titles.some(item =>
      item.codigo.toLocaleLowerCase('pt-BR') === title.codigo.toLocaleLowerCase('pt-BR')
    );
    if (duplicate) throw new Error('Já existe um título com esse código interno.');

    titles.unshift(title);
    if (!saveTitles()) {
      titles.shift();
      return null;
    }

    renderTitles();
    return title;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    try {
      const title = addTitle({
        codigo: data.get('codigoLancamento'),
        empresa: data.get('nomeEmpresa'),
        documento: data.get('documento'),
        categoria: data.get('categoria'),
        operacao: data.get('tipoOperacao'),
        pagamento: data.get('formaPagamento'),
        centroCusto: data.get('centroCusto'),
        codigoBarras: data.get('codigoBarras'),
        numeroNota: data.get('numeroNota'),
        vencimento: data.get('dataVencimento'),
        parcelas: data.get('parcelas'),
        valor: data.get('valorBruto')
      });

      if (!title) return;
      form.reset();
      showFeedback(`Título "${title.empresa}" cadastrado com sucesso.`, 'success');
      codeInput.focus();
    } catch (error) {
      showFeedback(error.message, 'error');
      if (error.message.includes('código interno')) codeInput.focus();
    }
  }

  function clearTitles(requireConfirmation) {
    if (titles.length === 0) return true;
    if (requireConfirmation && !window.confirm('Deseja remover todos os títulos cadastrados?')) return false;

    const previousTitles = titles;
    titles = [];
    if (!saveTitles()) {
      titles = previousTitles;
      renderTitles();
      return false;
    }

    renderTitles();
    showFeedback('Todos os títulos foram removidos.', 'success');
    return true;
  }

  form.addEventListener('submit', handleSubmit);
  clearFieldsButton.addEventListener('click', () => {
    form.reset();
    feedback.className = 'feedback-toast hidden';
    feedback.textContent = '';
    codeInput.focus();
  });
  clearTitlesButton.addEventListener('click', () => clearTitles(true));
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem(LOGIN_KEY);
    window.location.replace('login.html');
  });

  renderTitles();

  window.RPAFinanceiro = {
    adicionar(data) {
      const title = addTitle(data);
      if (!title) throw new Error('Não foi possível salvar o título no navegador.');
      return { ...title };
    },
    obter: () => titles.map(title => ({ ...title })),
    total: () => titles.length,
    limpar: () => clearTitles(false)
  };
})();
