window.dmPreviewProductPhoto = function (input) {
    var file = input.files && input.files[0];
    var newImg = document.getElementById('dm-photo-new');
    var label = document.getElementById('dm-photo-new-label');
    var current = document.getElementById('dm-photo-current');
    var empty = document.getElementById('dm-photo-empty');

    if (!file || !newImg) {
        return;
    }

    if (newImg._objectUrl) {
        URL.revokeObjectURL(newImg._objectUrl);
    }

    newImg._objectUrl = URL.createObjectURL(file);
    newImg.src = newImg._objectUrl;
    newImg.hidden = false;

    if (label) {
        label.hidden = false;
    }
    if (current) {
        current.classList.add('is-dimmed');
    }
    if (empty) {
        empty.hidden = true;
    }
};

window.dmCsrfToken = function () {
    var meta = document.querySelector('meta[name="csrf-token"]');

    return meta ? meta.getAttribute('content') || '' : '';
};

window.dmPhotoPost = function (url, fields, fileField) {
    var token = window.dmCsrfToken();
    var body = new FormData();

    body.append('_token', token);

    Object.keys(fields || {}).forEach(function (key) {
        body.append(key, fields[key]);
    });

    if (fileField && fileField.name && fileField.file) {
        body.append(fileField.name, fileField.file);
    }

    return fetch(url, {
        method: 'POST',
        body: body,
        credentials: 'same-origin',
        headers: {
            'X-CSRF-TOKEN': token,
            'X-Requested-With': 'XMLHttpRequest',
            Accept: 'application/json, text/html, */*',
        },
        redirect: 'follow',
    }).then(function (response) {
        if (response.status === 419) {
            throw new Error('session_expired');
        }

        if (response.redirected) {
            window.location.href = response.url;

            return null;
        }

        if (response.ok) {
            var contentType = response.headers.get('content-type') || '';

            if (contentType.indexOf('application/json') !== -1) {
                return response.json();
            }

            window.location.reload();

            return null;
        }

        throw new Error('request_failed');
    });
};

window.dmInitProductPhotoPanel = function (root) {
    if (!root) {
        return;
    }

    if (root.dataset.dmInitialized === '1') {
        return;
    }

    root.dataset.dmInitialized = '1';

    var fileInput = root.querySelector('#dm-photo-file-input');
    var saveBtn = root.querySelector('#dm-photo-save-btn');
    var deleteBtn = root.querySelector('#dm-photo-delete-btn');
    var loadVisualBtn = root.querySelector('#dm-photo-load-visual');
    var loadNameBtn = root.querySelector('#dm-photo-load-name');
    var suggestionsBox = root.querySelector('#dm-photo-suggestions');
    var grid = root.querySelector('#dm-photo-suggestions-grid');
    var emptyMsg = root.querySelector('#dm-photo-suggestions-empty');
    var hint = root.querySelector('#dm-photo-suggestions-hint');

    if (fileInput) {
        fileInput.addEventListener('change', function () {
            window.dmPreviewProductPhoto(fileInput);
        });
    }

    if (saveBtn && fileInput) {
        saveBtn.addEventListener('click', function () {
            if (!fileInput.files || !fileInput.files[0]) {
                window.alert('Elige una imagen primero.');

                return;
            }

            saveBtn.disabled = true;
            saveBtn.textContent = 'Guardando…';

            window.dmPhotoPost(root.dataset.uploadUrl, {}, { name: 'foto', file: fileInput.files[0] })
                .catch(function (error) {
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Guardar foto';

                    if (error.message === 'session_expired') {
                        window.alert('Sesión expirada. Recarga la página (F5) e intenta de nuevo.');
                    } else {
                        window.alert('No se pudo guardar la foto. Intenta de nuevo.');
                    }
                });
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', function () {
            if (!window.confirm('¿Eliminar la foto de la tienda?')) {
                return;
            }

            deleteBtn.disabled = true;
            deleteBtn.textContent = 'Eliminando…';

            window.dmPhotoPost(root.dataset.deleteUrl, {})
                .catch(function (error) {
                    deleteBtn.disabled = false;
                    deleteBtn.textContent = 'Eliminar foto';

                    if (error.message === 'session_expired') {
                        window.alert('Sesión expirada. Recarga la página (F5) e intenta de nuevo.');
                    } else {
                        window.alert('No se pudo eliminar la foto. Intenta de nuevo.');
                    }
                });
        });
    }

    function renderSuggestions(data) {
        var items = data.items || [];
        grid.innerHTML = '';

        if (hint) {
            hint.textContent = data.mode === 'name'
                ? 'Sugerencias por nombre del producto.'
                : 'Sugerencias orientadas a la foto / código de barras.';
        }

        if (!items.length) {
            if (emptyMsg) {
                emptyMsg.hidden = false;
            }

            return;
        }

        if (emptyMsg) {
            emptyMsg.hidden = true;
        }

        items.forEach(function (item) {
            var card = document.createElement('div');
            card.className = 'dm-photo-suggestion-card';

            var img = document.createElement('img');
            img.src = item.thumbnailUrl || item.imageUrl;
            img.alt = item.title || 'Sugerencia';
            img.loading = 'lazy';
            card.appendChild(img);

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'dm-photo-suggestion-use';
            btn.textContent = 'Usar esta foto';
            btn.addEventListener('click', function () {
                if (!window.confirm('¿Usar esta imagen como foto del producto?')) {
                    return;
                }

                btn.disabled = true;
                btn.textContent = 'Aplicando…';

                window.dmPhotoPost(root.dataset.fromUrl, { image_url: item.imageUrl })
                    .catch(function (error) {
                        btn.disabled = false;
                        btn.textContent = 'Usar esta foto';

                        if (error.message === 'session_expired') {
                            window.alert('Sesión expirada. Recarga la página (F5) e intenta de nuevo.');
                        } else {
                            window.alert('No se pudo aplicar esa imagen.');
                        }
                    });
            });
            card.appendChild(btn);

            grid.appendChild(card);
        });
    }

    function resolveReferenceUrl(mode) {
        var previewUrl = root.dataset.previewUrl || '';

        if (mode !== 'visual') {
            return Promise.resolve('');
        }

        if (fileInput && fileInput.files && fileInput.files[0]) {
            return window.dmPhotoPost(root.dataset.referenceUrl, {}, { name: 'foto', file: fileInput.files[0] })
                .then(function (data) {
                    return data && data.referenceUrl ? data.referenceUrl : previewUrl;
                })
                .catch(function () {
                    return previewUrl;
                });
        }

        return Promise.resolve(previewUrl);
    }

    function loadSuggestions(mode, triggerBtn) {
        if (!suggestionsBox || !grid) {
            return;
        }

        triggerBtn.disabled = true;
        triggerBtn.textContent = 'Buscando…';
        suggestionsBox.hidden = false;
        grid.innerHTML = '';

        if (emptyMsg) {
            emptyMsg.hidden = true;
        }

        resolveReferenceUrl(mode).then(function (referenceUrl) {
            var url = new URL(root.dataset.suggestionsUrl, window.location.origin);
            url.searchParams.set('mode', mode);

            if (referenceUrl) {
                url.searchParams.set('reference_url', referenceUrl);
            }

            return fetch(url.toString(), {
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('fetch_failed');
                }

                return response.json();
            })
            .then(renderSuggestions)
            .catch(function () {
                if (emptyMsg) {
                    emptyMsg.textContent = 'No se pudieron cargar sugerencias. Usa Google Lens o busca similares en Google.';
                    emptyMsg.hidden = false;
                }
            })
            .finally(function () {
                triggerBtn.disabled = false;
                triggerBtn.textContent = mode === 'name'
                    ? 'Sugerencias por nombre'
                    : 'Sugerencias según la foto';
            });
    }

    if (loadVisualBtn) {
        loadVisualBtn.addEventListener('click', function () {
            loadSuggestions('visual', loadVisualBtn);
        });
    }

    if (loadNameBtn) {
        loadNameBtn.addEventListener('click', function () {
            loadSuggestions('name', loadNameBtn);
        });
    }
};

document.addEventListener('livewire:navigated', function () {
    var root = document.getElementById('dm-photo-panel-root');

    if (root) {
        delete root.dataset.dmInitialized;
    }

    window.dmInitProductPhotoPanel(root);
});

document.addEventListener('DOMContentLoaded', function () {
    window.dmInitProductPhotoPanel(document.getElementById('dm-photo-panel-root'));
});
