// Configuración de la API
const API_URL = 'https://colegio-backend-gikk.onrender.com/api';

// Funciones de utilidad
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.add('show');
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.remove('show');
}

function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;
    const alert = document.createElement('div');
    alert.className = 'alert alert-' + type + ' alert-dismissible fade show';
    alert.innerHTML = message + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
    alertContainer.appendChild(alert);
    setTimeout(function() { alert.remove(); }, 5000);
}

function actualizarContador(id, count) {
    const el = document.getElementById(id);
    if (el) el.textContent = count;
}

// ============ ESTUDIANTES ============
async function cargarEstudiantes() {
    try {
        showLoading();
        const response = await fetch(API_URL + '/estudiantes');
        const estudiantes = await response.json();
        const tbody = document.getElementById('tablaEstudiantes');
        if (!tbody) {
            hideLoading();
            return;
        }

        if (estudiantes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-4"><i class="bi bi-inbox fs-1 d-block mb-2"></i>No hay estudiantes registrados</td></tr>';
            hideLoading();
            return;
        }

        var html = '';
        estudiantes.forEach(function(est) {
            var fechaNac = est.Fecha_nacimiento ? new Date(est.Fecha_nacimiento).toLocaleDateString() : '-';
            var sexo = est.Sexo === 'M' ? 'Masculino' : 'Femenino';
            var direccion = [est.Distrito, est.Provincia].filter(Boolean).join(', ') || '-';
            var padre = est.Nombre_padre || '<span class="text-muted">Sin asignar</span>';
            var lugarNac = est.Lugar_nacimiento || '-';
            html += '<tr>';
            html += '<td><strong>' + est.DNI_estudiante + '</strong></td>';
            html += '<td>' + est.Nombre_estudiante + '</td>';
            html += '<td>' + est.ApellidoPaterno_estudiante + '</td>';
            html += '<td>' + est.ApellidoMaterno_estudiante + '</td>';
            html += '<td>' + sexo + '</td>';
            html += '<td>' + fechaNac + '</td>';
            html += '<td>' + lugarNac + '</td>';
            html += '<td>' + padre + '</td>';
            html += '<td>' + direccion + '</td>';
            html += '<td>';
            html += '<button class="btn btn-sm btn-outline-primary btn-action" onclick="editarEstudiante(\'' + est.DNI_estudiante + '\')"><i class="bi bi-pencil"></i></button> ';
            html += '<button class="btn btn-sm btn-outline-danger btn-action" onclick="eliminarEstudiante(\'' + est.DNI_estudiante + '\')"><i class="bi bi-trash"></i></button>';
            html += '</td></tr>';
        });
        tbody.innerHTML = html;
        actualizarContador('contadorEstudiantes', estudiantes.length);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar estudiantes', 'danger');
    } finally {
        hideLoading();
    }
}

async function guardarEstudiante(event) {
    event.preventDefault();

    var padreSelect = document.getElementById('padreEstudiante');
    var dniPadre = padreSelect ? padreSelect.value : null;
    
    if (!dniPadre) {
        showAlert('Debe seleccionar un Padre/Apoderado. Si no existe, registrelo primero en la seccion Padres.', 'warning');
        return;
    }

    var formData = {
        DNI_estudiante: document.getElementById('dniEstudiante').value,
        Nombre_estudiante: document.getElementById('nombreEstudiante').value,
        ApellidoPaterno_estudiante: document.getElementById('apellidoPaternoEstudiante').value,
        ApellidoMaterno_estudiante: document.getElementById('apellidoMaternoEstudiante').value,
        Sexo: document.getElementById('sexoEstudiante').value,
        Fecha_nacimiento: document.getElementById('fechaNacimiento').value,
        DNI_padre: dniPadre,
        Lugar_nacimiento: document.getElementById('lugarNacimiento') ? document.getElementById('lugarNacimiento').value || null : null,
        Provincia: document.getElementById('provinciaEstudiante') ? document.getElementById('provinciaEstudiante').value || null : null,
        Distrito: document.getElementById('distritoEstudiante') ? document.getElementById('distritoEstudiante').value || null : null,
        Manzana: document.getElementById('manzanaEstudiante') ? document.getElementById('manzanaEstudiante').value || null : null,
        Lote: document.getElementById('loteEstudiante') ? document.getElementById('loteEstudiante').value || null : null,
        Calle: document.getElementById('calleEstudiante') ? document.getElementById('calleEstudiante').value || null : null,
        Referencia: document.getElementById('referenciaEstudiante') ? document.getElementById('referenciaEstudiante').value || null : null
    };

    var isEditing = document.getElementById('formEstudiante').dataset.editing;
    var url = API_URL + '/estudiantes';
    var method = 'POST';
    
    if (isEditing) {
        url = API_URL + '/estudiantes/' + isEditing;
        method = 'PUT';
    }

    try {
        showLoading();
        var response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showAlert(isEditing ? 'Estudiante actualizado correctamente' : 'Estudiante registrado correctamente', 'success');
            var modal = bootstrap.Modal.getInstance(document.getElementById('modalEstudiante'));
            if (modal) modal.hide();
            document.getElementById('formEstudiante').reset();
            delete document.getElementById('formEstudiante').dataset.editing;
            cargarEstudiantes();
        } else {
            var errorData = await response.json();
            showAlert(errorData.error || 'Error al guardar', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión', 'danger');
    } finally {
        hideLoading();
    }
}

async function editarEstudiante(dni) {
    try {
        showLoading();
        var response = await fetch(API_URL + '/estudiantes/' + dni);
        var est = await response.json();
        
        document.getElementById('dniEstudiante').value = est.DNI_estudiante;
        document.getElementById('dniEstudiante').readOnly = true;
        document.getElementById('nombreEstudiante').value = est.Nombre_estudiante;
        document.getElementById('apellidoPaternoEstudiante').value = est.ApellidoPaterno_estudiante;
        document.getElementById('apellidoMaternoEstudiante').value = est.ApellidoMaterno_estudiante;
        document.getElementById('sexoEstudiante').value = est.Sexo;
        document.getElementById('fechaNacimiento').value = est.Fecha_nacimiento ? est.Fecha_nacimiento.split('T')[0] : '';
        
        if (document.getElementById('provinciaEstudiante')) document.getElementById('provinciaEstudiante').value = est.Provincia || '';
        if (document.getElementById('distritoEstudiante')) document.getElementById('distritoEstudiante').value = est.Distrito || '';
        if (document.getElementById('manzanaEstudiante')) document.getElementById('manzanaEstudiante').value = est.Manzana || '';
        if (document.getElementById('loteEstudiante')) document.getElementById('loteEstudiante').value = est.Lote || '';
        if (document.getElementById('calleEstudiante')) document.getElementById('calleEstudiante').value = est.Calle || '';
        if (document.getElementById('referenciaEstudiante')) document.getElementById('referenciaEstudiante').value = est.Referencia || '';
        if (document.getElementById('lugarNacimiento')) document.getElementById('lugarNacimiento').value = est.Lugar_nacimiento || '';
        
        // Cargar padres y seleccionar el asignado
        await cargarPadresParaEstudiante(est.DNI_padre);
        
        document.getElementById('formEstudiante').dataset.editing = dni;
        document.getElementById('modalEstudianteLabel').textContent = 'Editar Estudiante';
        
        var modal = new bootstrap.Modal(document.getElementById('modalEstudiante'));
        modal.show();
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar estudiante', 'danger');
    } finally {
        hideLoading();
    }
}

async function eliminarEstudiante(dni) {
    if (!confirm('¿Está seguro de eliminar este estudiante?')) return;
    try {
        showLoading();
        var response = await fetch(API_URL + '/estudiantes/' + dni, { method: 'DELETE' });
        if (response.ok) {
            showAlert('Estudiante eliminado', 'success');
            cargarEstudiantes();
        } else {
            showAlert('Error al eliminar', 'danger');
        }
    } catch (error) {
        showAlert('Error de conexión', 'danger');
    } finally {
        hideLoading();
    }
}

function nuevoEstudiante() {
    document.getElementById('formEstudiante').reset();
    delete document.getElementById('formEstudiante').dataset.editing;
    document.getElementById('dniEstudiante').readOnly = false;
    document.getElementById('modalEstudianteLabel').textContent = 'Nuevo Estudiante';
    cargarPadresParaEstudiante();
}

// Cargar lista de padres para el select de estudiante
async function cargarPadresParaEstudiante(dniPadreSeleccionado) {
    try {
        var response = await fetch(API_URL + '/padres');
        var padres = await response.json();
        var select = document.getElementById('padreEstudiante');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccione padre/apoderado...</option>';
        
        if (padres.length === 0) {
            select.innerHTML = '<option value="">No hay padres registrados - Registre uno primero</option>';
            return;
        }
        
        padres.forEach(function(padre) {
            var option = document.createElement('option');
            option.value = padre.DNI_padre;
            option.textContent = padre.DNI_padre + ' - ' + padre.Nombre_padre + ' ' + padre.ApellidoPaterno_padre + ' ' + padre.ApellidoMaterno_padre;
            if (dniPadreSeleccionado && padre.DNI_padre == dniPadreSeleccionado) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar padres:', error);
    }
}

// ============ PADRES ============
async function cargarPadres() {
    try {
        showLoading();
        var response = await fetch(API_URL + '/padres');
        var padres = await response.json();
        var tbody = document.getElementById('tablaPadres');
        if (!tbody) {
            hideLoading();
            return;
        }

        if (padres.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4"><i class="bi bi-inbox fs-1 d-block mb-2"></i>No hay padres registrados</td></tr>';
            hideLoading();
            return;
        }

        var html = '';
        padres.forEach(function(padre) {
            html += '<tr>';
            html += '<td><strong>' + padre.DNI_padre + '</strong></td>';
            html += '<td>' + padre.Nombre_padre + '</td>';
            html += '<td>' + padre.ApellidoPaterno_padre + '</td>';
            html += '<td>' + padre.ApellidoMaterno_padre + '</td>';
            html += '<td>' + (padre.Telefono_padre || '-') + '</td>';
            html += '<td>' + (padre.Ocupacion || '-') + '</td>';
            html += '<td>';
            html += '<button class="btn btn-sm btn-outline-primary btn-action" onclick="editarPadre(\'' + padre.DNI_padre + '\')"><i class="bi bi-pencil"></i></button> ';
            html += '<button class="btn btn-sm btn-outline-danger btn-action" onclick="eliminarPadre(\'' + padre.DNI_padre + '\')"><i class="bi bi-trash"></i></button>';
            html += '</td></tr>';
        });
        tbody.innerHTML = html;
        actualizarContador('contadorPadres', padres.length);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar padres', 'danger');
    } finally {
        hideLoading();
    }
}

async function guardarPadre(event) {
    event.preventDefault();
    var formData = {
        DNI_padre: document.getElementById('dniPadre').value,
        Nombre_padre: document.getElementById('nombrePadre').value,
        ApellidoPaterno_padre: document.getElementById('apellidoPaternoPadre').value,
        ApellidoMaterno_padre: document.getElementById('apellidoMaternoPadre').value,
        Telefono_padre: document.getElementById('telefonoPadre').value || null,
        Ocupacion: document.getElementById('ocupacionPadre').value || null
    };

    var isEditing = document.getElementById('formPadre').dataset.editing;
    var url = API_URL + '/padres';
    var method = 'POST';
    
    if (isEditing) {
        url = API_URL + '/padres/' + isEditing;
        method = 'PUT';
    }

    try {
        showLoading();
        var response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showAlert(isEditing ? 'Padre actualizado correctamente' : 'Padre registrado correctamente', 'success');
            var modal = bootstrap.Modal.getInstance(document.getElementById('modalPadre'));
            if (modal) modal.hide();
            document.getElementById('formPadre').reset();
            delete document.getElementById('formPadre').dataset.editing;
            cargarPadres();
        } else {
            var errorData = await response.json();
            showAlert(errorData.error || 'Error al guardar', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión', 'danger');
    } finally {
        hideLoading();
    }
}

async function editarPadre(dni) {
    try {
        showLoading();
        var response = await fetch(API_URL + '/padres/' + dni);
        var padre = await response.json();
        
        document.getElementById('dniPadre').value = padre.DNI_padre;
        document.getElementById('dniPadre').readOnly = true;
        document.getElementById('nombrePadre').value = padre.Nombre_padre;
        document.getElementById('apellidoPaternoPadre').value = padre.ApellidoPaterno_padre;
        document.getElementById('apellidoMaternoPadre').value = padre.ApellidoMaterno_padre;
        document.getElementById('telefonoPadre').value = padre.Telefono_padre || '';
        document.getElementById('ocupacionPadre').value = padre.Ocupacion || '';
        
        document.getElementById('formPadre').dataset.editing = dni;
        document.getElementById('modalPadreLabel').textContent = 'Editar Padre';
        
        var modal = new bootstrap.Modal(document.getElementById('modalPadre'));
        modal.show();
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar padre', 'danger');
    } finally {
        hideLoading();
    }
}

async function eliminarPadre(dni) {
    if (!confirm('¿Está seguro de eliminar este padre?')) return;
    try {
        showLoading();
        var response = await fetch(API_URL + '/padres/' + dni, { method: 'DELETE' });
        if (response.ok) {
            showAlert('Padre eliminado', 'success');
            cargarPadres();
        } else {
            showAlert('Error al eliminar', 'danger');
        }
    } catch (error) {
        showAlert('Error de conexión', 'danger');
    } finally {
        hideLoading();
    }
}

function nuevoPadre() {
    document.getElementById('formPadre').reset();
    delete document.getElementById('formPadre').dataset.editing;
    document.getElementById('dniPadre').readOnly = false;
    document.getElementById('modalPadreLabel').textContent = 'Nuevo Padre';
}

// ============ PROFESORES ============
async function cargarProfesores() {
    try {
        showLoading();
        var response = await fetch(API_URL + '/profesores');
        var profesores = await response.json();
        var tbody = document.getElementById('tablaProfesores');
        if (!tbody) {
            hideLoading();
            return;
        }

        if (profesores.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4"><i class="bi bi-inbox fs-1 d-block mb-2"></i>No hay profesores registrados</td></tr>';
            hideLoading();
            return;
        }

        var html = '';
        profesores.forEach(function(prof) {
            html += '<tr>';
            html += '<td><strong>' + prof.Codigo_profesor + '</strong></td>';
            html += '<td>' + prof.Nombre_profesor + '</td>';
            html += '<td>' + prof.ApellidoPaterno_profesor + '</td>';
            html += '<td>' + prof.ApellidoMaterno_profesor + '</td>';
            html += '<td>' + (prof.Especialidades || '<span class="text-muted">Sin asignar</span>') + '</td>';
            html += '<td>' + (prof.Horarios || '<span class="text-muted">Sin asignar</span>') + '</td>';
            html += '<td>';
            html += '<button class="btn btn-sm btn-outline-primary btn-action" onclick="editarProfesor(' + prof.Codigo_profesor + ')"><i class="bi bi-pencil"></i></button> ';
            html += '<button class="btn btn-sm btn-outline-danger btn-action" onclick="eliminarProfesor(' + prof.Codigo_profesor + ')"><i class="bi bi-trash"></i></button>';
            html += '</td></tr>';
        });
        tbody.innerHTML = html;
        actualizarContador('contadorProfesores', profesores.length);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar profesores', 'danger');
    } finally {
        hideLoading();
    }
}

// Cargar especialidades en el select del modal
async function cargarEspecialidadesSelect() {
    try {
        var response = await fetch(API_URL + '/especialidades');
        var especialidades = await response.json();
        var select = document.getElementById('especialidadesProfesor');
        if (!select) return;
        
        select.innerHTML = '';
        especialidades.forEach(function(esp) {
            var option = document.createElement('option');
            option.value = esp.Id_especialidad;
            option.textContent = esp.Nombre_especialidad;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar especialidades:', error);
    }
}

// Cargar horarios en el select del modal
async function cargarHorariosSelect() {
    try {
        var response = await fetch(API_URL + '/horarios');
        var horarios = await response.json();
        var select = document.getElementById('horariosProfesor');
        if (!select) return;
        
        select.innerHTML = '';
        horarios.forEach(function(hor) {
            var option = document.createElement('option');
            option.value = hor.Id_horario;
            option.textContent = hor.Hora_inicio + ' - ' + hor.Hora_fin;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar horarios:', error);
    }
}

async function guardarProfesor(event) {
    event.preventDefault();
    
    // Obtener especialidades seleccionadas
    var especialidadesSelect = document.getElementById('especialidadesProfesor');
    var especialidades = [];
    if (especialidadesSelect) {
        for (var i = 0; i < especialidadesSelect.selectedOptions.length; i++) {
            especialidades.push(parseInt(especialidadesSelect.selectedOptions[i].value));
        }
    }
    
    // Obtener horarios seleccionados
    var horariosSelect = document.getElementById('horariosProfesor');
    var horarios = [];
    if (horariosSelect) {
        for (var i = 0; i < horariosSelect.selectedOptions.length; i++) {
            horarios.push(parseInt(horariosSelect.selectedOptions[i].value));
        }
    }
    
    var formData = {
        Codigo_profesor: parseInt(document.getElementById('codigoProfesor').value),
        Nombre_profesor: document.getElementById('nombreProfesor').value,
        ApellidoPaterno_profesor: document.getElementById('apellidoPaternoProfesor').value,
        ApellidoMaterno_profesor: document.getElementById('apellidoMaternoProfesor').value,
        especialidades: especialidades,
        horarios: horarios
    };

    var isEditing = document.getElementById('formProfesor').dataset.editing;
    var url = API_URL + '/profesores';
    var method = 'POST';
    
    if (isEditing) {
        url = API_URL + '/profesores/' + isEditing;
        method = 'PUT';
    }

    try {
        showLoading();
        var response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showAlert(isEditing ? 'Profesor actualizado correctamente' : 'Profesor registrado correctamente', 'success');
            var modal = bootstrap.Modal.getInstance(document.getElementById('modalProfesor'));
            if (modal) modal.hide();
            document.getElementById('formProfesor').reset();
            delete document.getElementById('formProfesor').dataset.editing;
            cargarProfesores();
        } else {
            var errorData = await response.json();
            showAlert(errorData.error || 'Error al guardar', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión', 'danger');
    } finally {
        hideLoading();
    }
}

async function editarProfesor(codigo) {
    try {
        showLoading();
        
        // Cargar los selects primero
        await cargarEspecialidadesSelect();
        await cargarHorariosSelect();
        
        var response = await fetch(API_URL + '/profesores/' + codigo);
        var prof = await response.json();
        
        document.getElementById('codigoProfesor').value = prof.Codigo_profesor;
        document.getElementById('codigoProfesor').readOnly = true;
        document.getElementById('nombreProfesor').value = prof.Nombre_profesor;
        document.getElementById('apellidoPaternoProfesor').value = prof.ApellidoPaterno_profesor;
        document.getElementById('apellidoMaternoProfesor').value = prof.ApellidoMaterno_profesor;
        
        // Seleccionar especialidades del profesor
        var especialidadesSelect = document.getElementById('especialidadesProfesor');
        if (especialidadesSelect && prof.especialidades) {
            for (var i = 0; i < especialidadesSelect.options.length; i++) {
                especialidadesSelect.options[i].selected = prof.especialidades.includes(parseInt(especialidadesSelect.options[i].value));
            }
        }
        
        // Seleccionar horarios del profesor
        var horariosSelect = document.getElementById('horariosProfesor');
        if (horariosSelect && prof.horarios) {
            for (var i = 0; i < horariosSelect.options.length; i++) {
                horariosSelect.options[i].selected = prof.horarios.includes(parseInt(horariosSelect.options[i].value));
            }
        }
        
        document.getElementById('formProfesor').dataset.editing = codigo;
        document.getElementById('modalProfesorLabel').textContent = 'Editar Profesor';
        
        var modal = new bootstrap.Modal(document.getElementById('modalProfesor'));
        modal.show();
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar profesor', 'danger');
    } finally {
        hideLoading();
    }
}

async function eliminarProfesor(codigo) {
    if (!confirm('¿Está seguro de eliminar este profesor?')) return;
    try {
        showLoading();
        var response = await fetch(API_URL + '/profesores/' + codigo, { method: 'DELETE' });
        if (response.ok) {
            showAlert('Profesor eliminado', 'success');
            cargarProfesores();
        } else {
            showAlert('Error al eliminar', 'danger');
        }
    } catch (error) {
        showAlert('Error de conexión', 'danger');
    } finally {
        hideLoading();
    }
}

async function nuevoProfesor() {
    document.getElementById('formProfesor').reset();
    delete document.getElementById('formProfesor').dataset.editing;
    document.getElementById('codigoProfesor').readOnly = false;
    document.getElementById('modalProfesorLabel').textContent = 'Nuevo Profesor';
    
    // Cargar los selects
    await cargarEspecialidadesSelect();
    await cargarHorariosSelect();
}

// ============ MATRÍCULAS ============
async function cargarMatriculas() {
    try {
        showLoading();
        var response = await fetch(API_URL + '/matriculas');
        var matriculas = await response.json();
        var tbody = document.getElementById('tablaMatriculas');
        if (!tbody) {
            hideLoading();
            return;
        }

        if (matriculas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4"><i class="bi bi-inbox fs-1 d-block mb-2"></i>No hay matrículas registradas</td></tr>';
            hideLoading();
            return;
        }

        var html = '';
        matriculas.forEach(function(mat) {
            var fecha = mat.Fecha_matricula ? new Date(mat.Fecha_matricula).toLocaleDateString() : '-';
            html += '<tr>';
            html += '<td><strong>' + mat.Codigo_matricula + '</strong></td>';
            html += '<td>' + fecha + '</td>';
            html += '<td>' + mat.Anio_academico + '</td>';
            html += '<td>' + (mat.Estado || 'Activa') + '</td>';
            html += '<td>';
            html += '<button class="btn btn-sm btn-outline-info btn-action" onclick="verMatricula(' + mat.Codigo_matricula + ')"><i class="bi bi-eye"></i></button> ';
            html += '<button class="btn btn-sm btn-outline-danger btn-action" onclick="eliminarMatricula(' + mat.Codigo_matricula + ')"><i class="bi bi-trash"></i></button>';
            html += '</td></tr>';
        });
        tbody.innerHTML = html;
        actualizarContador('contadorMatriculas', matriculas.length);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar matrículas', 'danger');
    } finally {
        hideLoading();
    }
}

async function cargarEstudiantesParaMatricula() {
    try {
        var response = await fetch(API_URL + '/estudiantes');
        var estudiantes = await response.json();
        var select = document.getElementById('estudianteMatricula');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccione estudiante...</option>';
        estudiantes.forEach(function(est) {
            var option = document.createElement('option');
            option.value = est.DNI_estudiante;
            option.textContent = est.DNI_estudiante + ' - ' + est.Nombre_estudiante + ' ' + est.ApellidoPaterno_estudiante;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function guardarMatricula(event) {
    event.preventDefault();
    var formData = {
        DNI_estudiante: document.getElementById('estudianteMatricula').value,
        Fecha_matricula: document.getElementById('fechaMatricula').value,
        Anio_academico: document.getElementById('anioAcademico').value,
        Estado: 'Activa'
    };

    try {
        showLoading();
        var response = await fetch(API_URL + '/matriculas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showAlert('Matrícula registrada correctamente', 'success');
            var modal = bootstrap.Modal.getInstance(document.getElementById('modalMatricula'));
            if (modal) modal.hide();
            document.getElementById('formMatricula').reset();
            cargarMatriculas();
        } else {
            var errorData = await response.json();
            showAlert(errorData.error || 'Error al guardar', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión', 'danger');
    } finally {
        hideLoading();
    }
}

async function eliminarMatricula(codigo) {
    if (!confirm('¿Está seguro de eliminar esta matrícula?')) return;
    try {
        showLoading();
        var response = await fetch(API_URL + '/matriculas/' + codigo, { method: 'DELETE' });
        if (response.ok) {
            showAlert('Matrícula eliminada', 'success');
            cargarMatriculas();
        } else {
            showAlert('Error al eliminar', 'danger');
        }
    } catch (error) {
        showAlert('Error de conexión', 'danger');
    } finally {
        hideLoading();
    }
}

function nuevaMatricula() {
    document.getElementById('formMatricula').reset();
    cargarEstudiantesParaMatricula();
}

function verMatricula(codigo) {
    showAlert('Ver matrícula #' + codigo, 'info');
}

// ============ PAGOS ============
async function cargarPagos() {
    try {
        showLoading();
        var response = await fetch(API_URL + '/pagos');
        var pagos = await response.json();
        var tbody = document.getElementById('tablaPagos');
        if (!tbody) {
            hideLoading();
            return;
        }

        if (pagos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4"><i class="bi bi-inbox fs-1 d-block mb-2"></i>No hay pagos registrados</td></tr>';
            hideLoading();
            return;
        }

        var html = '';
        pagos.forEach(function(pago) {
            var fecha = pago.Fecha_pago ? new Date(pago.Fecha_pago).toLocaleDateString() : '-';
            html += '<tr>';
            html += '<td><strong>' + pago.Codigo_pago + '</strong></td>';
            html += '<td>' + fecha + '</td>';
            html += '<td>S/. ' + parseFloat(pago.Monto).toFixed(2) + '</td>';
            html += '<td>' + (pago.Descripcion || 'Pago de matrícula') + '</td>';
            html += '<td>';
            html += '<button class="btn btn-sm btn-outline-info btn-action" onclick="verPago(' + pago.Codigo_pago + ')"><i class="bi bi-eye"></i></button>';
            html += '</td></tr>';
        });
        tbody.innerHTML = html;
        actualizarContador('contadorPagos', pagos.length);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar pagos', 'danger');
    } finally {
        hideLoading();
    }
}

async function cargarMatriculasParaPago() {
    try {
        var response = await fetch(API_URL + '/matriculas');
        var matriculas = await response.json();
        var select = document.getElementById('matriculaPago');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccione matrícula...</option>';
        matriculas.forEach(function(mat) {
            var option = document.createElement('option');
            option.value = mat.Codigo_matricula;
            option.textContent = 'Matrícula #' + mat.Codigo_matricula + ' - ' + mat.Anio_academico;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function guardarPago(event) {
    event.preventDefault();
    var formData = {
        Codigo_matricula: document.getElementById('matriculaPago').value,
        Fecha_pago: document.getElementById('fechaPago').value,
        Monto: document.getElementById('montoPago').value,
        Descripcion: document.getElementById('descripcionPago').value || 'Pago de matrícula'
    };

    try {
        showLoading();
        var response = await fetch(API_URL + '/pagos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showAlert('Pago registrado correctamente', 'success');
            var modal = bootstrap.Modal.getInstance(document.getElementById('modalPago'));
            if (modal) modal.hide();
            document.getElementById('formPago').reset();
            cargarPagos();
        } else {
            var errorData = await response.json();
            showAlert(errorData.error || 'Error al guardar', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión', 'danger');
    } finally {
        hideLoading();
    }
}

function nuevoPago() {
    document.getElementById('formPago').reset();
    cargarMatriculasParaPago();
}

function verPago(codigo) {
    showAlert('Ver pago #' + codigo, 'info');
}

// ============ CALIFICACIONES ============
async function cargarCalificaciones() {
    try {
        showLoading();
        var response = await fetch(API_URL + '/calificaciones');
        var calificaciones = await response.json();
        var tbody = document.getElementById('tablaCalificaciones');
        if (!tbody) {
            hideLoading();
            return;
        }

        if (calificaciones.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4"><i class="bi bi-inbox fs-1 d-block mb-2"></i>No hay calificaciones registradas</td></tr>';
            hideLoading();
            return;
        }

        var html = '';
        calificaciones.forEach(function(cal) {
            html += '<tr>';
            html += '<td>' + cal.DNI_estudiante + '</td>';
            html += '<td>' + (cal.Nombre_materia || cal.Codigo_materia) + '</td>';
            html += '<td>' + cal.Periodo + '</td>';
            html += '<td><strong>' + cal.Nota + '</strong></td>';
            html += '<td>';
            html += '<button class="btn btn-sm btn-outline-primary btn-action" onclick="editarCalificacion(' + cal.Codigo_calificacion + ')"><i class="bi bi-pencil"></i></button>';
            html += '</td></tr>';
        });
        tbody.innerHTML = html;
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar calificaciones', 'danger');
    } finally {
        hideLoading();
    }
}

async function cargarEstudiantesParaCalificacion() {
    try {
        var response = await fetch(API_URL + '/estudiantes');
        var estudiantes = await response.json();
        var select = document.getElementById('estudianteCalificacion');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccione estudiante...</option>';
        estudiantes.forEach(function(est) {
            var option = document.createElement('option');
            option.value = est.DNI_estudiante;
            option.textContent = est.DNI_estudiante + ' - ' + est.Nombre_estudiante + ' ' + est.ApellidoPaterno_estudiante;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarMateriasParaCalificacion() {
    try {
        var response = await fetch(API_URL + '/materias');
        var materias = await response.json();
        var select = document.getElementById('materiaCalificacion');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccione materia...</option>';
        materias.forEach(function(mat) {
            var option = document.createElement('option');
            option.value = mat.Codigo_materia;
            option.textContent = mat.Nombre_materia;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function guardarCalificacion(event) {
    event.preventDefault();
    var formData = {
        DNI_estudiante: document.getElementById('estudianteCalificacion').value,
        Codigo_materia: document.getElementById('materiaCalificacion').value,
        Periodo: document.getElementById('periodoCalificacion').value,
        Nota: parseInt(document.getElementById('notaCalificacion').value)
    };

    try {
        showLoading();
        var response = await fetch(API_URL + '/calificaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showAlert('Calificación registrada correctamente', 'success');
            var modal = bootstrap.Modal.getInstance(document.getElementById('modalCalificacion'));
            if (modal) modal.hide();
            document.getElementById('formCalificacion').reset();
            cargarCalificaciones();
        } else {
            var errorData = await response.json();
            showAlert(errorData.error || 'Error al guardar', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión', 'danger');
    } finally {
        hideLoading();
    }
}

function nuevaCalificacion() {
    document.getElementById('formCalificacion').reset();
    cargarEstudiantesParaCalificacion();
    cargarMateriasParaCalificacion();
}

function editarCalificacion(codigo) {
    showAlert('Editar calificación #' + codigo, 'info');
}

// ============ NAVEGACIÓN ============
function mostrarSeccion(seccion) {
    // Ocultar todas las secciones
    var secciones = document.querySelectorAll('.content-section');
    secciones.forEach(function(s) {
        s.classList.add('d-none');
    });

    // Mostrar la sección seleccionada
    var seccionActiva = document.getElementById('seccion-' + seccion);
    if (seccionActiva) {
        seccionActiva.classList.remove('d-none');
    }

    // Actualizar menú activo
    var menuItems = document.querySelectorAll('.nav-link');
    menuItems.forEach(function(item) {
        item.classList.remove('active');
    });
    var menuActivo = document.querySelector('[data-seccion="' + seccion + '"]');
    if (menuActivo) {
        menuActivo.classList.add('active');
    }

    // Cargar datos según la sección
    switch(seccion) {
        case 'estudiantes':
            cargarEstudiantes();
            break;
        case 'padres':
            cargarPadres();
            break;
        case 'profesores':
            cargarProfesores();
            break;
        case 'matriculas':
            cargarMatriculas();
            break;
        case 'pagos':
            cargarPagos();
            break;
        case 'calificaciones':
            cargarCalificaciones();
            break;
        case 'horarios':
            cargarGradosParaHorario();
            break;
        case 'grados-secciones':
            cargarGradosSecciones();
            break;
        case 'dashboard':
            cargarDashboard();
            break;
    }
}

// ============ HORARIOS DE CLASE ============

// Variable global para almacenar el Id_seccion seleccionada
var seccionSeleccionada = null;

// Cargar grados para el selector de horarios
async function cargarGradosParaHorario() {
    try {
        var response = await fetch(API_URL + '/grados');
        var grados = await response.json();
        var select = document.getElementById('selectGradoHorario');
        if (!select) return;

        select.innerHTML = '<option value="">-- Seleccione Grado --</option>';
        grados.forEach(function(g) {
            select.innerHTML += '<option value="' + g.Id_grado + '">' + g.Nombre_grado + ' (' + g.Turno + ')</option>';
        });
        
        // Limpiar secciones y grilla
        document.getElementById('selectSeccionHorario').innerHTML = '<option value="">-- Primero seleccione grado --</option>';
        document.getElementById('cuerpoGrillaHorario').innerHTML = '';
    } catch (error) {
        console.error('Error al cargar grados:', error);
    }
}

// Cargar secciones según el grado seleccionado
async function cargarSeccionesParaHorario() {
    var idGrado = document.getElementById('selectGradoHorario').value;
    var selectSeccion = document.getElementById('selectSeccionHorario');
    
    if (!idGrado) {
        selectSeccion.innerHTML = '<option value="">-- Primero seleccione grado --</option>';
        document.getElementById('cuerpoGrillaHorario').innerHTML = '';
        return;
    }

    try {
        var response = await fetch(API_URL + '/secciones/grado/' + idGrado);
        var secciones = await response.json();
        
        selectSeccion.innerHTML = '<option value="">-- Seleccione Sección --</option>';
        secciones.forEach(function(s) {
            selectSeccion.innerHTML += '<option value="' + s.Id_seccion + '">Sección ' + s.Letra + '</option>';
        });
        
        // Limpiar grilla
        document.getElementById('cuerpoGrillaHorario').innerHTML = '';
    } catch (error) {
        console.error('Error al cargar secciones:', error);
    }
}

// Cargar grilla de horario para la sección seleccionada
async function cargarGrillaHorario() {
    var idSeccion = document.getElementById('selectSeccionHorario').value;
    
    if (!idSeccion) {
        showAlert('Seleccione una sección', 'warning');
        return;
    }

    seccionSeleccionada = idSeccion;

    try {
        showLoading();
        var response = await fetch(API_URL + '/horario-clase/' + idSeccion);
        var horarios = await response.json();
        
        renderizarGrillaHorario(horarios);
    } catch (error) {
        console.error('Error al cargar grilla:', error);
        showAlert('Error al cargar horario', 'danger');
    } finally {
        hideLoading();
    }
}

// Inicializar grilla con bloques vacíos
async function inicializarGrillaHorario() {
    var idSeccion = document.getElementById('selectSeccionHorario').value;
    
    if (!idSeccion) {
        showAlert('Seleccione una sección primero', 'warning');
        return;
    }

    if (!confirm('¿Crear bloques de horario vacíos para esta sección?')) return;

    try {
        showLoading();
        var response = await fetch(API_URL + '/horario-clase/inicializar/' + idSeccion, {
            method: 'POST'
        });
        
        if (response.ok) {
            showAlert('Grilla inicializada correctamente', 'success');
            cargarGrillaHorario();
        } else {
            var data = await response.json();
            showAlert(data.error || 'Error al inicializar', 'danger');
        }
    } catch (error) {
        showAlert('Error de conexión', 'danger');
    } finally {
        hideLoading();
    }
}

// Renderizar la grilla de horarios
function renderizarGrillaHorario(horarios) {
    var tbody = document.getElementById('cuerpoGrillaHorario');
    tbody.innerHTML = '';

    if (horarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4"><i class="bi bi-calendar-x fs-1"></i><br>No hay horario. Use "Inicializar Grilla" para crear los bloques.</td></tr>';
        return;
    }

    // Agrupar por hora
    var horasPorBloque = {};
    horarios.forEach(function(h) {
        var key = h.Hora_inicio + '-' + h.Hora_fin;
        if (!horasPorBloque[key]) {
            horasPorBloque[key] = { Hora_inicio: h.Hora_inicio, Hora_fin: h.Hora_fin, dias: {} };
        }
        horasPorBloque[key].dias[h.Dia] = h;
    });

    var dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    // Crear filas
    Object.keys(horasPorBloque).sort().forEach(function(key) {
        var bloque = horasPorBloque[key];
        var tr = document.createElement('tr');
        
        // Columna de hora
        var tdHora = document.createElement('td');
        tdHora.className = 'fw-bold text-center';
        tdHora.innerHTML = bloque.Hora_inicio.substring(0,5) + '<br><small class="text-muted">' + bloque.Hora_fin.substring(0,5) + '</small>';
        tr.appendChild(tdHora);

        // Columnas de días
        dias.forEach(function(dia) {
            var td = document.createElement('td');
            td.className = 'text-center celda-horario';
            
            var h = bloque.dias[dia];
            if (h) {
                if (h.Nombre_especialidad && h.Codigo_profesor) {
                    td.innerHTML = '<div class="badge bg-primary mb-1">' + h.Nombre_especialidad + '</div><br>' +
                                   '<small class="text-muted">' + (h.Nombre_profesor || 'Prof. ' + h.Codigo_profesor) + '</small>';
                    td.className += ' bg-light';
                } else {
                    td.innerHTML = '<span class="text-muted">Sin asignar</span>';
                }
                td.style.cursor = 'pointer';
                td.onclick = function() { abrirModalAsignacion(h.Id_horario_clase); };
            }
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}

// Abrir modal para asignar materia y profesor
async function abrirModalAsignacion(idHorarioClase) {
    try {
        // Guardar el ID en el formulario
        document.getElementById('idHorarioClase').value = idHorarioClase;

        // Cargar especialidades
        var respEsp = await fetch(API_URL + '/especialidades');
        var especialidades = await respEsp.json();
        var selectEsp = document.getElementById('selectEspecialidadAsignar');
        selectEsp.innerHTML = '<option value="">-- Seleccione Materia --</option>';
        especialidades.forEach(function(e) {
            selectEsp.innerHTML += '<option value="' + e.Id_especialidad + '">' + e.Nombre_especialidad + '</option>';
        });

        // Cargar profesores
        var respProf = await fetch(API_URL + '/profesores');
        var profesores = await respProf.json();
        var selectProf = document.getElementById('selectProfesorAsignar');
        selectProf.innerHTML = '<option value="">-- Seleccione Profesor --</option>';
        profesores.forEach(function(p) {
            selectProf.innerHTML += '<option value="' + p.Codigo_profesor + '">' + p.Nombre_profesor + ' ' + p.ApellidoPaterno_profesor + ' ' + p.ApellidoMaterno_profesor + '</option>';
        });

        // Mostrar modal
        var modal = new bootstrap.Modal(document.getElementById('modalAsignarClase'));
        modal.show();
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar datos', 'danger');
    }
}

// Guardar asignación de horario
async function guardarAsignacionHorario(event) {
    event.preventDefault();
    
    var idHorarioClase = document.getElementById('idHorarioClase').value;
    var idEspecialidad = document.getElementById('selectEspecialidadAsignar').value;
    var codigoProfesor = document.getElementById('selectProfesorAsignar').value;

    try {
        showLoading();
        var response = await fetch(API_URL + '/horario-clase/' + idHorarioClase, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Id_especialidad: idEspecialidad || null,
                Codigo_profesor: codigoProfesor || null
            })
        });

        if (response.ok) {
            showAlert('Asignación guardada', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalAsignarClase')).hide();
            cargarGrillaHorario();
        } else {
            showAlert('Error al guardar', 'danger');
        }
    } catch (error) {
        showAlert('Error de conexión', 'danger');
    } finally {
        hideLoading();
    }
}

// Limpiar asignación (quitar materia y profesor)
async function limpiarAsignacionHorario() {
    var idHorarioClase = document.getElementById('idHorarioClase').value;
    
    if (!confirm('¿Quitar la asignación de este bloque?')) return;

    try {
        showLoading();
        var response = await fetch(API_URL + '/horario-clase/' + idHorarioClase, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Id_especialidad: null,
                Codigo_profesor: null
            })
        });

        if (response.ok) {
            showAlert('Asignación eliminada', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalAsignarClase')).hide();
            cargarGrillaHorario();
        } else {
            showAlert('Error al limpiar', 'danger');
        }
    } catch (error) {
        showAlert('Error de conexión', 'danger');
    } finally {
        hideLoading();
    }
}

// ============ GRADOS Y SECCIONES ============
async function cargarGradosSecciones() {
    try {
        var response = await fetch(API_URL + '/grados');
        var grados = await response.json();
        var container = document.getElementById('listaGradosSecciones');
        if (!container) return;

        if (grados.length === 0) {
            container.innerHTML = '<div class="alert alert-info"><i class="bi bi-info-circle me-2"></i>No hay grados registrados. Use "Inicializar Grados y Secciones" para crear la estructura.</div>';
            return;
        }

        var html = '<div class="row">';
        
        // Separar por nivel
        var inicial = grados.filter(function(g) { return g.Nivel === 'Inicial'; });
        var primaria = grados.filter(function(g) { return g.Nivel === 'Primaria'; });

        // Inicial
        html += '<div class="col-md-6">';
        html += '<h5 class="text-primary"><i class="bi bi-sun me-2"></i>Nivel Inicial (Turno Mañana)</h5>';
        html += '<ul class="list-group mb-3">';
        inicial.forEach(function(g) {
            html += '<li class="list-group-item d-flex justify-content-between align-items-center">';
            html += '<span><i class="bi bi-mortarboard me-2"></i>' + g.Nombre_grado + '</span>';
            html += '<span class="badge bg-primary rounded-pill">Secciones A, B</span>';
            html += '</li>';
        });
        if (inicial.length === 0) html += '<li class="list-group-item text-muted">Sin grados de inicial</li>';
        html += '</ul></div>';

        // Primaria
        html += '<div class="col-md-6">';
        html += '<h5 class="text-success"><i class="bi bi-moon me-2"></i>Nivel Primaria (Turno Tarde)</h5>';
        html += '<ul class="list-group mb-3">';
        primaria.forEach(function(g) {
            html += '<li class="list-group-item d-flex justify-content-between align-items-center">';
            html += '<span><i class="bi bi-mortarboard me-2"></i>' + g.Nombre_grado + '</span>';
            html += '<span class="badge bg-success rounded-pill">Secciones A, B</span>';
            html += '</li>';
        });
        if (primaria.length === 0) html += '<li class="list-group-item text-muted">Sin grados de primaria</li>';
        html += '</ul></div>';

        html += '</div>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Inicializar Grados y Secciones
async function inicializarGradosSecciones() {
    if (!confirm('¿Desea inicializar los grados y secciones con datos predeterminados?\n\nEsto creará:\n- 3 Grados de Inicial (3, 4, 5 años) - Turno Mañana\n- 6 Grados de Primaria (1° a 6°) - Turno Tarde\n- 2 Secciones (A, B) por cada grado\n- Especialidades básicas')) return;
    
    try {
        showLoading();
        var response = await fetch(API_URL + '/inicializar-catalogos', { method: 'POST' });
        var data = await response.json();
        showAlert(data.message, 'success');
        cargarGradosSecciones();
    } catch (error) {
        showAlert('Error al inicializar', 'danger');
    } finally {
        hideLoading();
    }
}

async function cargarDashboard() {
    try {
        var responses = await Promise.all([
            fetch(API_URL + '/estudiantes'),
            fetch(API_URL + '/padres'),
            fetch(API_URL + '/profesores'),
            fetch(API_URL + '/matriculas')
        ]);
        
        var estudiantes = await responses[0].json();
        var padres = await responses[1].json();
        var profesores = await responses[2].json();
        var matriculas = await responses[3].json();
        
        actualizarContador('totalEstudiantes', estudiantes.length);
        actualizarContador('totalPadres', padres.length);
        actualizarContador('totalProfesores', profesores.length);
        actualizarContador('totalMatriculas', matriculas.length);
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Configurar navegación del sidebar
    var navLinks = document.querySelectorAll('.nav-link[data-seccion]');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var seccion = this.getAttribute('data-seccion');
            mostrarSeccion(seccion);
        });
    });

    // Cargar dashboard por defecto si existe
    if (document.getElementById('seccion-dashboard')) {
        cargarDashboard();
    }
});
