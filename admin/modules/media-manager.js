/* ================================================================
   APEX MOTORS ADMIN — modules/media-manager.js
   Upload de fotos/vídeos com drag & drop + recorte de imagem
================================================================ */

'use strict';

const MediaManager = (() => {
  const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
  const MAX_SIZE_IMAGE = 8 * 1024 * 1024;   // 8MB
  const MAX_SIZE_VIDEO = 60 * 1024 * 1024;  // 60MB
  const BUCKET_NAME = 'vehicle-media';

  let items = [];       // {id, type, file, url, path, isNew}
  let cropTargetId = null;
  let cropperInstance = null;

  const dropzone     = () => document.getElementById('mediaDropzone');
  const fileInput    = () => document.getElementById('mediaFileInput');
  const grid         = () => document.getElementById('mediaGrid');
  const cropModal    = () => document.getElementById('cropModal');
  const cropperImage = () => document.getElementById('cropperImage');

  const genId  = () => `m-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const getExt = (name = 'file') => (name.split('.').pop() || 'jpg').toLowerCase();

  /* ============================================================
     VALIDAÇÃO
  ============================================================ */
  const validateFile = (file) => {
    if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      if (file.size > MAX_SIZE_IMAGE) {
        return { ok: false, msg: `Imagem muito grande (máx 8MB): ${file.name}` };
      }
      return { ok: true, type: 'image' };
    }
    if (ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      if (file.size > MAX_SIZE_VIDEO) {
        return { ok: false, msg: `Vídeo muito grande (máx 60MB): ${file.name}` };
      }
      return { ok: true, type: 'video' };
    }
    return { ok: false, msg: `Tipo de arquivo não suportado: ${file.name}` };
  };

  /* ============================================================
     ADICIONA ARQUIVOS (drag/drop ou seleção)
  ============================================================ */
  const handleFiles = (fileList) => {
    Array.from(fileList).forEach((file) => {
      const result = validateFile(file);
      if (!result.ok) {
        window.AdminToast?.show(result.msg, 'error');
        return;
      }
      items.push({
        id: genId(),
        type: result.type,
        file,
        url: URL.createObjectURL(file),
        path: null,
        isNew: true,
      });
    });
    render();
  };

  /* ============================================================
     REMOVE ITEM (local ou do storage)
  ============================================================ */
  const removeItem = async (id) => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const item = items[idx];

    if (item.path) {
      try {
        await supabaseClient.storage.from(BUCKET_NAME).remove([item.path]);
      } catch (err) {
        console.error('[MediaManager] Erro ao remover do storage:', err);
      }
    }

    if (item.url?.startsWith('blob:')) URL.revokeObjectURL(item.url);

    items.splice(idx, 1);
    render();
  };

  /* ============================================================
     CROP (recorte de imagem)
  ============================================================ */
  const openCrop = (id) => {
    const item = items.find((i) => i.id === id);
    if (!item || item.type !== 'image') return;

    cropTargetId = id;
    cropperImage().src = item.url;
    cropModal().classList.add('is-open');
    document.body.style.overflow = 'hidden';

    if (cropperInstance) cropperInstance.destroy();
    cropperInstance = new Cropper(cropperImage(), {
      viewMode: 1,
      autoCropArea: 1,
      responsive: true,
      background: false,
    });
  };

  const closeCrop = () => {
    cropModal().classList.remove('is-open');
    document.body.style.overflow = '';
    if (cropperInstance) {
      cropperInstance.destroy();
      cropperInstance = null;
    }
    cropTargetId = null;
  };

  const confirmCrop = () => {
    if (!cropperInstance || !cropTargetId) return;

    cropperInstance.getCroppedCanvas().toBlob((blob) => {
      const item = items.find((i) => i.id === cropTargetId);
      if (!item || !blob) return;

      if (item.url?.startsWith('blob:')) URL.revokeObjectURL(item.url);

      const croppedFile = new File(
        [blob],
        item.file?.name || `cropped-${Date.now()}.jpg`,
        { type: 'image/jpeg' }
      );

      item.file  = croppedFile;
      item.url   = URL.createObjectURL(blob);
      item.isNew = true;  // precisa reenviar
      item.path  = null;

      render();
      closeCrop();
    }, 'image/jpeg', 0.92);
  };

  /* ============================================================
     RENDER
  ============================================================ */
  const render = () => {
    const g = grid();
    if (!g) return;

    g.innerHTML = items.length
      ? items.map((item) => `
        <div class="media-item" data-id="${item.id}">
          ${item.type === 'image'
            ? `<img src="${item.url}" class="media-item__thumb" alt="Preview" />`
            : `<video src="${item.url}" class="media-item__thumb" muted></video>
               <span class="media-item__video-badge">▶ Vídeo</span>`
          }
          <div class="media-item__actions">
            ${item.type === 'image' ? `
              <button type="button" class="media-item__btn" data-action="crop" title="Recortar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 2v14a2 2 0 002 2h14"/><path d="M18 22V8a2 2 0 00-2-2H2"/>
                </svg>
              </button>` : ''
            }
            <button type="button" class="media-item__btn media-item__btn--danger" data-action="remove" title="Remover">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          ${item.isNew ? '<span class="media-item__new-badge">Novo</span>' : ''}
        </div>
      `).join('')
      : `<div class="media-empty">Nenhuma foto ou vídeo adicionado ainda.</div>`;
  };

  /* ============================================================
     EVENTOS
  ============================================================ */
  const initEvents = () => {
    grid()?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = btn.closest('.media-item')?.dataset.id;
      if (!id) return;

      if (btn.dataset.action === 'remove') removeItem(id);
      if (btn.dataset.action === 'crop')   openCrop(id);
    });

    const dz = dropzone();
    const fi = fileInput();

    dz?.addEventListener('click', () => fi.click());

    dz?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dz.classList.add('is-dragover');
    });

    dz?.addEventListener('dragleave', () => dz.classList.remove('is-dragover'));

    dz?.addEventListener('drop', (e) => {
      e.preventDefault();
      dz.classList.remove('is-dragover');
      handleFiles(e.dataTransfer.files);
    });

    fi?.addEventListener('change', () => {
      handleFiles(fi.files);
      fi.value = ''; // permite re-selecionar o mesmo arquivo
    });

    document.getElementById('cropCancel')?.addEventListener('click', closeCrop);
    document.getElementById('cropModalClose')?.addEventListener('click', closeCrop);
    document.getElementById('cropConfirm')?.addEventListener('click', confirmCrop);
    cropModal()?.addEventListener('click', (e) => {
      if (e.target === cropModal()) closeCrop();
    });
  };

  /* ============================================================
     API PÚBLICA
  ============================================================ */

  // Extrai o path relativo dentro do bucket, a partir da URL pública
  const extractPath = (url) => {
    const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
    const idx = url.indexOf(marker);
    return idx !== -1 ? url.slice(idx + marker.length) : null;
  };

  // Carrega mídia existente (modo edição)
  const setExisting = (images = [], videos = []) => {
    reset();
    images.forEach((url) => {
      items.push({ id: genId(), type: 'image', file: null, url, path: extractPath(url), isNew: false });
    });
    videos.forEach((url) => {
      items.push({ id: genId(), type: 'video', file: null, url, path: extractPath(url), isNew: false });
    });
    render();
  };

  // Limpa tudo (ao fechar modal / adicionar novo)
  const reset = () => {
    items.forEach((item) => {
      if (item.isNew && item.url?.startsWith('blob:')) URL.revokeObjectURL(item.url);
    });
    items = [];
    render();
  };

  // Envia todos os arquivos pendentes ao Storage e retorna as URLs finais
  const uploadAll = async () => {
    for (const item of items) {
      if (!item.isNew || !item.file) continue;

      const ext  = getExt(item.file.name);
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error } = await supabaseClient.storage
        .from(BUCKET_NAME)
        .upload(path, item.file, {
          cacheControl: '3600',
          upsert: false,
          contentType: item.file.type,
        });

      if (error) {
        throw new Error(`Falha ao enviar "${item.file.name}": ${error.message}`);
      }

      const { data } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(path);

      if (item.url?.startsWith('blob:')) URL.revokeObjectURL(item.url);

      item.url   = data.publicUrl;
      item.path  = path;
      item.isNew = false;
    }

    return {
      images: items.filter((i) => i.type === 'image').map((i) => i.url),
      videos: items.filter((i) => i.type === 'video').map((i) => i.url),
    };
  };

  const init = () => {
    initEvents();
    render();
  };

  return { init, setExisting, reset, uploadAll };
})();

window.MediaManager = MediaManager;
