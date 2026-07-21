/* ================================================================
   APEX MOTORS ADMIN — modules/estoque.js
   Tabela de estoque com CRUD completo via Supabase
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
let allVehicles    = [];
let sortField      = null;
let sortDirection  = 'asc';
let editingId      = null;

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
   SUPABASE — CRUD
================================================================ */
const fetchVehicles = async () => {
  const { data, error } = await supabaseClient
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

const insertVehicle = async (payload) => {
  const { data, error } = await supabaseClient
    .from('vehicles')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const updateVehicle = async (id, payload) => {
  const { data, error } = await supabaseClient
    .from('vehicles')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const deleteVehicle = async (id) => {
  const { error } = await supabaseClient
    .from('vehicles')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

/* ================================================================
   MÉTRICAS
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
  const images   = Array.isArray(v.images) ? v.images : [];
  const firstImg = images[0] || null;
  const specs    = v.specs || {};
  const km       = specs.km || '—';

  const thumbHtml = firstImg
    ? `<img src="${firstImg}" alt="${v.name}" class="vehicle-thumb" loading="lazy"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
       <div class="vehicle-thumb-placeholder" style="display:none">
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
           <rect x="1" y="3" width="15" height="13"/>
           <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
           <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
         </svg>
       </div>`
    : `<div class="vehicle-thumb-placeholder">
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
           <rect x="1" y="3" width="15" height="13"/>
           <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
           <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
         </svg>
       </div>`;

  const badgeHtml = v.badge
    ? `<span class="vehicle-badge vehicle-badge--${v.badge_color || 'accent'}">${v.badge}</span>`
    : '';

  const statusLabel = STATUS_LABELS[v.status] || v.status;
  const statusClass = `status-badge--${v.status || 'available'}`;
  const catLabel    = CATEGORY_LABELS[v.category] || v.category || '—';

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
      <button class="btn-edit" data-id="${v.id}" aria-label="Editar ${v.name}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Editar
      </button>
      <button class="btn-delete" data-id="${v.id}" data-name="${v.name}" aria-label="Excluir ${v.name}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14H6L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
        Excluir
      </button>
    </td>
  `;

  return tr;
};

/* ================================================================
   RENDERIZA A TABELA
================================================================ */
const renderTable = (vehicles) => {
  const tbody = el('estoqueTableBody');
  const empty = el('estoqueEmpty');
  const count = el('estoqueCount');

  if (!tbody) return;
  tbody.innerHTML = '';

  if (vehicles.length === 0) {
    if (empty) empty.hidden = false;
    if (count) count.textContent = '0 veículos';
    return;
  }

  if (empty) empty.hidden = true;

  const fragment = document.createDocumentFragment();
  vehicles.forEach(v => fragment.appendChild(renderRow(v)));
  tbody.appendChild(fragment);

  if (count) {
    count.textContent = `${vehicles.length} veículo${vehicles.length !== 1 ? 's' : ''}`;
  }

  tbody.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.id));
  });

  tbody.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () =>
      openDeleteModal(btn.dataset.id, btn.dataset.name)
    );
  });
};

/* ================================================================
   FILTROS E ORDENAÇÃO
================================================================ */
const applyFilters = () => {
  const query    = (el('estoqueSearch')?.value  || '').toLowerCase().trim();
  const status   = el('filterStatus')?.value   || '';
  const category = el('filterCategory')?.value || '';

  let filtered = allVehicles.filter(v => {
    const matchQuery = !query ||
      v.name?.toLowerCase().includes(query) ||
      v.category?.toLowerCase().includes(query) ||
      v.year?.toString().includes(query) ||
      (v.specs?.fuel  || '').toLowerCase().includes(query) ||
      (v.specs?.color || '').toLowerCase().includes(query);

    const matchStatus = !status   || v.status   === status;
    const matchCat    = !category || v.category === category;

    return matchQuery && matchStatus && matchCat;
  });

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
      if (valA > valB) return sortDirection === 'asc' ?  1 : -1;
      return 0;
    });
  }

  renderTable(filtered);
};

const initFilters = () => {
  const searchInput  = el('estoqueSearch');
  const clearBtn     = el('searchClear');
  const clearFilters = el('btnClearFilters');
  const statusSel    = el('filterStatus');
  const categorySel  = el('filterCategory');

  let debounce;
  searchInput?.addEventListener('input', () => {
    clearTimeout(debounce);
    if (clearBtn) clearBtn.hidden = !searchInput.value;
    debounce = setTimeout(applyFilters, 280);
  });

  clearBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    clearBtn.hidden = true;
    applyFilters();
  });

  statusSel?.addEventListener('change',   applyFilters);
  categorySel?.addEventListener('change', applyFilters);

  clearFilters?.addEventListener('click', () => {
    if (searchInput) searchInput.value  = '';
    if (statusSel)   statusSel.value    = '';
    if (categorySel) categorySel.value  = '';
    if (clearBtn)    clearBtn.hidden    = true;
    sortField     = null;
    sortDirection = 'asc';
    document.querySelectorAll('.th-sort').forEach(b =>
      b.classList.remove('is-asc', 'is-desc')
    );
    applyFilters();
  });
};

const initSort = () => {
  document.querySelectorAll('.th-sort').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.dataset.sort;
      if (sortField === field) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortField     = field;
        sortDirection = 'asc';
      }
      document.querySelectorAll('.th-sort').forEach(b =>
        b.classList.remove('is-asc', 'is-desc')
      );
      btn.classList.add(sortDirection === 'asc' ? 'is-asc' : 'is-desc');
      applyFilters();
    });
  });
};

/* ================================================================
   MODAL — ABRIR / FECHAR
================================================================ */
const openModal = () => {
  const modal = el('vehicleModal');
  requestAnimationFrame(() => modal.classList.add('is-open'));
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  const modal = el('vehicleModal');
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
  setTimeout(resetForm, 250);
};

/* ✅ FUNÇÃO QUE ESTAVA FALTANDO — CAUSA DO ERRO */
const openAddModal = () => {
  resetForm();
  openModal();
};

const resetForm = () => {
  el('vehicleForm')?.reset();
  editingId = null;
  MediaManager.reset();

  el('financingPreview').hidden      = true;
  el('discountPreview').hidden       = true;
  el('discountPriceGroup').hidden    = true;
  el('errFinancing').textContent     = '';
  el('errDiscountPrice').textContent = '';

  el('modalTitle').textContent  = 'Adicionar Veículo';
  el('btnDeleteVehicle').hidden = true;
  el('btnModalSave').innerHTML  = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
    Salvar`;

  ['errName', 'errYear', 'errPrice', 'errCategory'].forEach(id => {
    const e = el(id);
    if (e) e.textContent = '';
  });
};

/* ================================================================
   MODAL — PREENCHE COM DADOS DO VEÍCULO (modo edição)
================================================================ */
const fillForm = (v) => {
  const specs = v.specs || {};

  el('fieldName').value         = v.name        || '';
  el('fieldYear').value         = v.year        || '';
  el('fieldPrice').value        = v.price       || '';
  el('fieldCategory').value     = v.category    || '';
  el('fieldStatus').value       = v.status      || 'available';
  el('fieldBadge').value        = v.badge       || '';
  el('fieldBadgeColor').value   = v.badge_color || '';
  el('fieldDescription').value  = v.description || '';

  el('fieldMotor').value        = specs.motor        || '';
  el('fieldKm').value           = specs.km           || '';
  el('fieldPower').value        = specs.power        || '';
  el('fieldTransmission').value = specs.transmission || '';
  el('fieldFuel').value         = specs.fuel         || '';
  el('fieldAcceleration').value = specs.acceleration || '';
  el('fieldTopSpeed').value     = specs.topSpeed     || '';
  el('fieldColor').value        = specs.color        || '';
  el('fieldDoors').value        = specs.doors        || '';

  const optionals = Array.isArray(v.optionals) ? v.optionals : [];
  el('fieldOptionals').value = optionals.join(', ');

  el('fieldFinancing').value     = v.financing_enabled ? 'true' : 'false';
  el('fieldDiscount').value      = v.discount_enabled  ? 'true' : 'false';
  el('fieldDiscountPrice').value = v.discount_price || '';
  renderFinancingPreview();
  renderDiscountPreview();

  const images = Array.isArray(v.images) ? v.images : [];
  const videos = Array.isArray(v.videos) ? v.videos : [];
  MediaManager.setExisting(images, videos);
};

/* ================================================================
   MODAL — ABRE EM MODO EDITAR
================================================================ */
const openEditModal = (id) => {
  const vehicle = allVehicles.find(v => String(v.id) === String(id));
  if (!vehicle) return;

  const vehicleId = vehicle.id;
  resetForm();
  editingId = vehicleId;
  fillForm(vehicle);

  el('modalTitle').textContent  = 'Editar Veículo';
  el('btnDeleteVehicle').hidden = false;
  el('btnModalSave').innerHTML  = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
    Atualizar`;

  openModal();
};

/* ================================================================
   MODAL — COLETA E VALIDA DADOS DO FORMULÁRIO
================================================================ */
const collectFormData = () => {
  let valid = true;

  ['errName', 'errYear', 'errPrice', 'errCategory', 'errFinancing', 'errDiscountPrice'].forEach(id => {
    const e = el(id);
    if (e) e.textContent = '';
  });

  const name     = el('fieldName').value.trim();
  const year     = el('fieldYear').value.trim();
  const price    = el('fieldPrice').value.trim();
  const category = el('fieldCategory').value;

  if (!name) {
    el('errName').textContent = 'Nome obrigatório.';
    valid = false;
  }
  if (!year || isNaN(year)) {
    el('errYear').textContent = 'Ano inválido.';
    valid = false;
  }
  if (!price || isNaN(price) || Number(price) < 0) {
    el('errPrice').textContent = 'Preço inválido.';
    valid = false;
  }
  if (!category) {
    el('errCategory').textContent = 'Selecione uma categoria.';
    valid = false;
  }

  const financingEnabled = el('fieldFinancing').value === 'true';
  if (financingEnabled && (!price || Number(price) <= 0)) {
    el('errFinancing').textContent = 'Informe o preço antes de ativar o financiamento.';
    valid = false;
  }

  const discountEnabled  = el('fieldDiscount').value === 'true';
  const discountPriceRaw = el('fieldDiscountPrice').value.trim();
  let discountPrice = null;

  if (discountEnabled) {
    if (!discountPriceRaw || isNaN(discountPriceRaw) || Number(discountPriceRaw) <= 0) {
      el('errDiscountPrice').textContent = 'Informe um preço de desconto válido.';
      valid = false;
    } else if (Number(discountPriceRaw) >= Number(price)) {
      el('errDiscountPrice').textContent = 'Preço com desconto deve ser menor que o preço cheio.';
      valid = false;
    } else {
      discountPrice = Number(discountPriceRaw);
    }
  }

  if (!valid) return null;

  const optionalsRaw = el('fieldOptionals').value;
  const optionals = optionalsRaw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const financingOptions = financingEnabled
    ? FinancingUtils.calculateFinancingOptions(Number(price))
    : [];

  return {
    name,
    year:        year,
    price:       Number(price),
    category,
    status:      el('fieldStatus').value,
    badge:       el('fieldBadge').value       || null,
    badge_color: el('fieldBadgeColor').value  || null,
    description: el('fieldDescription').value.trim() || null,
    specs: {
      motor:        el('fieldMotor').value.trim()        || null,
      km:           el('fieldKm').value.trim()           || null,
      power:        el('fieldPower').value.trim()        || null,
      transmission: el('fieldTransmission').value.trim() || null,
      fuel:         el('fieldFuel').value.trim()         || null,
      acceleration: el('fieldAcceleration').value.trim() || null,
      topSpeed:     el('fieldTopSpeed').value.trim()     || null,
      color:        el('fieldColor').value.trim()        || null,
      doors:        el('fieldDoors').value.trim()        || null,
    },
    optionals,
    financing_enabled: financingEnabled,
    financing_options: financingOptions,
    discount_enabled:  discountEnabled,
    discount_price:    discountPrice,
  };
};

/* ================================================================
   MODAL — SALVA (ADICIONAR ou ATUALIZAR)
================================================================ */
const saveVehicle = async (e) => {
  e?.preventDefault();

  const payload = collectFormData();
  if (!payload) return;

  const currentEditingId = editingId;

  const saveBtn = el('btnModalSave');
  const originalHtml = saveBtn.innerHTML;
  saveBtn.disabled = true;
  saveBtn.textContent = 'Enviando mídia...';

  try {
    const media = await MediaManager.uploadAll();
    payload.images = media.images;
    payload.videos = media.videos;

    saveBtn.textContent = 'Salvando...';

    if (currentEditingId) {
      await updateVehicle(currentEditingId, payload);
      await logAction('UPDATE', 'vehicle', String(currentEditingId), { name: payload.name });
      AdminToast.show(`"${payload.name}" atualizado com sucesso!`, 'success');
    } else {
      const created = await insertVehicle(payload);
      await logAction('INSERT', 'vehicle', String(created.id), { name: payload.name });
      AdminToast.show(`"${payload.name}" adicionado com sucesso!`, 'success');
    }

    closeModal();

    allVehicles = await fetchVehicles();
    fillMetrics(allVehicles);
    applyFilters();

  } catch (err) {
    console.error('[Estoque] Erro ao salvar veículo:', err);
    AdminToast.show(`Erro: ${err.message}`, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = originalHtml;
  }
};

/* ================================================================
   MODAL DE CONFIRMAÇÃO — EXCLUIR
================================================================ */
let pendingDeleteId   = null;
let pendingDeleteName = '';

const openDeleteModal = (id, name) => {
  pendingDeleteId   = id;
  pendingDeleteName = name;
  el('deleteVehicleName').textContent = name;

  const modal = el('deleteModal');
  requestAnimationFrame(() => modal.classList.add('is-open'));
  document.body.style.overflow = 'hidden';
};

const closeDeleteModal = () => {
  const modal = el('deleteModal');
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
  setTimeout(() => {
    pendingDeleteId   = null;
    pendingDeleteName = '';
  }, 250);
};

const confirmDelete = async () => {
  if (!pendingDeleteId) return;

  const confirmBtn = el('btnDeleteConfirm');
  const originalHtml = confirmBtn.innerHTML;
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Excluindo...';

  try {
    await deleteVehicle(pendingDeleteId);
    await logAction('DELETE', 'vehicle', String(pendingDeleteId), {
      name: pendingDeleteName,
    });

    AdminToast.show(`"${pendingDeleteName}" removido do estoque.`, 'success');

    closeDeleteModal();
    closeModal();

    allVehicles = await fetchVehicles();
    fillMetrics(allVehicles);
    applyFilters();

  } catch (err) {
    console.error('[Estoque] Erro ao excluir veículo:', err);
    AdminToast.show(`Erro ao excluir: ${err.message}`, 'error');
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = originalHtml;
  }
};

/* ================================================================
   PREVIEW — FINANCIAMENTO E DESCONTO
================================================================ */
const renderFinancingPreview = () => {
  const enabled = el('fieldFinancing').value === 'true';
  const price   = Number(el('fieldPrice').value) || 0;
  const preview = el('financingPreview');
  const list    = el('financingPreviewList');
  const err     = el('errFinancing');

  err.textContent = '';

  if (!enabled) {
    preview.hidden = true;
    list.innerHTML = '';
    return;
  }

  if (!price || price <= 0) {
    preview.hidden = true;
    err.textContent = 'Informe o preço do veículo antes de ativar o financiamento.';
    return;
  }

  const options = FinancingUtils.calculateFinancingOptions(price);
  list.innerHTML = options.map(opt => `
    <div class="financing-preview__item">
      <strong>${opt.installments}x</strong> de ${fmt(opt.value)}
      <span>${opt.entry > 0 ? `+ entrada de ${fmt(opt.entry)}` : 'sem entrada'}</span>
    </div>
  `).join('');
  preview.hidden = false;
};

const renderDiscountPreview = () => {
  const enabled = el('fieldDiscount').value === 'true';
  const group   = el('discountPriceGroup');
  const preview = el('discountPreview');
  const text    = el('discountPreviewText');
  const err     = el('errDiscountPrice');

  err.textContent = '';
  group.hidden = !enabled;

  if (!enabled) {
    preview.hidden = true;
    return;
  }

  const price         = Number(el('fieldPrice').value) || 0;
  const discountPrice = Number(el('fieldDiscountPrice').value) || 0;

  if (!discountPrice || discountPrice <= 0) {
    preview.hidden = true;
    return;
  }

  if (discountPrice >= price) {
    err.textContent = 'O preço com desconto deve ser menor que o preço cheio.';
    preview.hidden = true;
    return;
  }

  const percent = FinancingUtils.calculateDiscountPercent(price, discountPrice);
  text.textContent = `Desconto de ${percent}% — de ${fmt(price)} por ${fmt(discountPrice)}`;
  preview.hidden = false;
};

/* ================================================================
   INICIALIZA EVENTOS DOS MODAIS
================================================================ */
const initModalEvents = () => {
  el('btnAddVehicle')?.addEventListener('click', openAddModal);

  el('modalClose')?.addEventListener('click',     closeModal);
  el('btnModalCancel')?.addEventListener('click', closeModal);

  el('vehicleModal')?.addEventListener('click', (e) => {
    if (e.target === el('vehicleModal')) closeModal();
  });

  el('btnModalSave')?.addEventListener('click', saveVehicle);

  el('btnDeleteVehicle')?.addEventListener('click', () => {
    const vehicle = allVehicles.find(v => String(v.id) === String(editingId));
    if (vehicle) openDeleteModal(vehicle.id, vehicle.name);
  });

  el('deleteModalClose')?.addEventListener('click',  closeDeleteModal);
  el('btnDeleteCancel')?.addEventListener('click',   closeDeleteModal);

  el('deleteModal')?.addEventListener('click', (e) => {
    if (e.target === el('deleteModal')) closeDeleteModal();
  });

  el('btnDeleteConfirm')?.addEventListener('click', confirmDelete);

  el('fieldPrice')?.addEventListener('input', () => {
    renderFinancingPreview();
    renderDiscountPreview();
  });
  el('fieldFinancing')?.addEventListener('change', renderFinancingPreview);
  el('fieldDiscount')?.addEventListener('change', renderDiscountPreview);
  el('fieldDiscountPrice')?.addEventListener('input', renderDiscountPreview);

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (el('deleteModal').classList.contains('is-open')) {
      closeDeleteModal();
      return;
    }
    if (el('vehicleModal').classList.contains('is-open')) {
      closeModal();
    }
  });
};

/* ================================================================
   REALTIME
================================================================ */
const initRealtime = () => {
  supabaseClient
    .channel('estoque-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'vehicles' },
      async () => {
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
    allVehicles = await fetchVehicles();
    fillMetrics(allVehicles);
    renderTable(allVehicles);
    initFilters();
    initSort();
    initModalEvents();
    initRealtime();
    MediaManager.init();
  } catch (err) {
    console.error('Erro ao carregar estoque:', err);
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEstoque);
} else {
  initEstoque();
}
