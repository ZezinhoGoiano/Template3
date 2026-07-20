/* ================================================================
   APEX MOTORS ADMIN — modules/estoque.js
   Tabela de estoque com dados do Supabase
================================================================ */

'use strict';

/* ================================================================
   HELPERS
================================================================ */
const fmt = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const el = (id) => document.getElementById(id);

/* ================================================================
   ESTADO
================================================================ */
let allVehicles   = [];   // todos os veículos carregados
let sortField     = null; // campo de ordenação ativo
let sortDirection = 'asc';

/* ================================================================
   LABELS
================================================================ */
const CATEGORY_LABELS = {
  sport:  'Esportivo',
  luxury: 'Luxo',
  suv:    'SUV',
  sedan:  'Sedan',
};

const STATUS_LABELS = {
  available: 'Disponível',
  reserved:  'Reservado',
  sold:      'Vendido',
};

/* ================================================================
   BUSCA OS VEÍCULOS NO SUPABASE
================================================================ */
const fetchVehicles = async () => {
  const { data, error } = await supabaseClient
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/* ================================================================
   CALCULA E PREENCHE AS MÉTRICAS DO TOPO
================================================================ */
const fillMetrics = (vehicles) => {
  const available = vehicles.filter(v => v.status === 'available');
  const reserved  = vehicles.filter(v => v.status === 'reserved');
  const sold      = vehicles.filter(v => v.status === 'sold');
  const totalVal  = available.reduce((sum, v) => sum + (v.price || 0), 0);

  const set = (id, val) => { const e = el(id); if (e) e.textContent = val; };

  set('metTotal',      vehicles.length);
  set('metAvailable',  available.length);
  set('metReserved',   reserved.length);
  set('metSold',       sold.length);
  set('metTotalValue', fmt(totalVal));
};

/* ================================================================
   RENDERIZA UMA LINHA DA TABELA
================================================================ */
const renderRow = (v) => {
  const images   = Array.isArray(v.images) ? v.images : (v.images || []);
  const firstImg = images[0] || null;
  const specs    = v.specs || {};
  const km       = specs.km || '—';

  // Thumb
  const thumbHtml = firstImg
    ? `<img
         src="../${firstImg}"
         alt="${v.name}"
         class="vehicle-thumb"
         loading="lazy"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
       />
       <div class="vehicle-thumb-placeholder" style="display:none">
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
           <rect x="1" y="3" width="15" height="13"/>
           <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
           <circle cx="5.5" cy="18.5" r="2.5"/>
           <circle cx="18.5" cy="18.5" r="2.5"/>
         </svg>
       </div>`
    : `<div class="vehicle-thumb-placeholder">
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
           <rect x="1" y="3" width="15" height="13"/>
           <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
           <circle cx="5.5" cy="18.5" r="2.5"/>
           <circle cx="18.5" cy="18.5" r="2.5"/>
         </svg>
       </div>`;

  // Badge do veículo
  const badgeHtml = v.badge
    ? `<span class="vehicle-badge vehicle-badge--${v.badge_color || 'accent'}">${v.badge}</span>`
    : '';

  // Status
  const statusLabel = STATUS_LABELS[v.status] || v.status;
  const statusClass = `status-badge--${v.status || 'available'}`;

  // Categoria
  const catLabel = CATEGORY_LABELS[v.category] || v.category || '—';

  const tr = document.createElement('tr');
  tr.dataset.id = v.id;

  tr.innerHTML = `
    <td class="col-img">${thumbHtml}</td>

    <td class="col-name">
      <div class="vehicle-name-cell">
        <strong>${v.name}</strong>
        ${badgeHtml}
      </div>
    </td>

    <td class="col-year">${v.year || '—'}</td>

    <td class="col-cat">
      <span class="category-pill">${catLabel}</span>
    </td>

    <td class="col-price">
      <span class="price-value">${fmt(v.price || 0)}</span>
    </td>

    <td class="col-km">${km}</td>

    <td class="col-status">
      <span class="status-badge ${statusClass}">${statusLabel}</span>
    </td>

    <td class="col-actions">
      <a href="veiculo-form.html?id=${v.id}" class="btn-edit">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Editar anúncio
      </a>
    </td>
  `;

  return tr;
};

/* ================================================================
   RENDERIZA A TABELA
================================================================ */
const renderTable = (vehicles) => {
  const tbody  = el('estoqueTableBody');
  const empty  = el('estoqueEmpty');
  const count  = el('estoqueCount');

  if (!tbody) return;

  tbody.innerHTML = '';

  if (vehicles.length === 0) {
    if (empty)  empty.hidden  = false;
    if (count)  count.textContent = '0 veículos';
    return;
  }

  if (empty) empty.hidden = true;

  const fragment = document.createDocumentFragment();
  vehicles.forEach(v => fragment.appendChild(renderRow(v)));
  tbody.appendChild(fragment);

  if (count) {
    count.textContent = `${vehicles.length} veículo${vehicles.length !== 1 ? 's' : ''}`;
  }
};

/* ================================================================
   FILTRA E ORDENA OS VEÍCULOS
================================================================ */
const applyFilters = () => {
  const query    = (el('estoqueSearch')?.value   || '').toLowerCase().trim();
  const status   = el('filterStatus')?.value    || '';
  const category = el('filterCategory')?.value  || '';

  let filtered = allVehicles.filter(v => {
    // Busca por texto
    const matchQuery = !query ||
      v.name?.toLowerCase().includes(query) ||
      v.category?.toLowerCase().includes(query) ||
      v.year?.toString().includes(query) ||
      (v.specs?.fuel || '').toLowerCase().includes(query) ||
      (v.specs?.color || '').toLowerCase().includes(query);

    // Filtro de status
    const matchStatus = !status || v.status === status;

    // Filtro de categoria
    const matchCat = !category || v.category === category;

    return matchQuery && matchStatus && matchCat;
  });

  // Ordenação
  if (sortField) {
    filtered.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'price') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  renderTable(filtered);
};

/* ================================================================
   INICIALIZA BUSCA E FILTROS
================================================================ */
const initFilters = () => {
  const searchInput  = el('estoqueSearch');
  const clearBtn     = el('searchClear');
  const clearFilters = el('btnClearFilters');
  const statusSel    = el('filterStatus');
  const categorySel  = el('filterCategory');

  // Busca com debounce
  let debounce;
  searchInput?.addEventListener('input', () => {
    clearTimeout(debounce);

    // Mostra/esconde botão de limpar
    if (clearBtn) clearBtn.hidden = !searchInput.value;

    debounce = setTimeout(applyFilters, 280);
  });

  // Limpa busca
  clearBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    clearBtn.hidden = true;
    applyFilters();
  });

  // Filtros de select
  statusSel?.addEventListener('change',   applyFilters);
  categorySel?.addEventListener('change', applyFilters);

  // Limpa todos os filtros
  clearFilters?.addEventListener('click', () => {
    if (searchInput)  searchInput.value   = '';
    if (statusSel)    statusSel.value     = '';
    if (categorySel)  categorySel.value   = '';
    if (clearBtn)     clearBtn.hidden     = true;
    sortField     = null;
    sortDirection = 'asc';

    // Remove estilos de ordenação
    document.querySelectorAll('.th-sort').forEach(btn => {
      btn.classList.remove('is-asc', 'is-desc');
    });

    applyFilters();
  });
};

/* ================================================================
   INICIALIZA ORDENAÇÃO POR COLUNA
================================================================ */
const initSort = () => {
  document.querySelectorAll('.th-sort').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.dataset.sort;

      if (sortField === field) {
        // Inverte direção
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortField     = field;
        sortDirection = 'asc';
      }

      // Atualiza visual dos botões
      document.querySelectorAll('.th-sort').forEach(b => {
        b.classList.remove('is-asc', 'is-desc');
      });
      btn.classList.add(sortDirection === 'asc' ? 'is-asc' : 'is-desc');

      applyFilters();
    });
  });
};

/* ================================================================
   REALTIME — atualiza tabela quando houver mudanças
================================================================ */
const initRealtime = () => {
  supabaseClient
    .channel('estoque-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'vehicles' },
      async () => {
        // Recarrega os dados do Supabase
        try {
          allVehicles = await fetchVehicles();
          fillMetrics(allVehicles);
          applyFilters();
          AdminToast.show('Estoque atualizado!', 'info', 2000);
        } catch (err) {
          console.error('Erro ao recarregar estoque:', err);
        }
      }
    )
    .subscribe();
};

/* ================================================================
   INIT
================================================================ */
const initEstoque = async () => {
  try {
    // Carrega dados
    allVehicles = await fetchVehicles();

    // Preenche métricas
    fillMetrics(allVehicles);

    // Renderiza tabela inicial
    renderTable(allVehicles);

    // Liga filtros e ordenação
    initFilters();
    initSort();

    // Liga realtime
    initRealtime();

  } catch (err) {
    console.error('Erro ao carregar estoque:', err);

    // Mostra erro na tabela
    const tbody = el('estoqueTableBody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;padding:3rem;color:var(--color-error)">
            ❌ Erro ao carregar veículos: ${err.message}
          </td>
        </tr>`;
    }

    AdminToast.show('Erro ao carregar estoque', 'error');
  }
};

// Inicia quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEstoque);
} else {
  initEstoque();
}
