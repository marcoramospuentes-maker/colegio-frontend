// Configuración de la API
const API_URL = 'https://colegio-backend-gikk.onrender.com/api';

// Funciones de utilidad
function showLoading() {
    document.getElementById('loading')?.classList.add('show');
}

function hideLoading() {
    document.getElementById('loading')?.classList.remove('show');
}

function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    alertContainer.appendChild(alert);
    
    setTimeout(() => alert.remove(), 5000);
}

// ============ ESTUDIANTES ============
async function cargarEstudiantes() {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/estudiantes`);
        const estudiantes = await response.json();
        
        const tbody = document.getElementById('tablaEstudiantes');
        if (!tbody) return;
        
        if (estudiantes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                        No hay estudiantes registrados
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = estudiantes.map(est => `
            <tr>
                <td><strong>${est.Codigo_estudiante}</strong></td>
                <td>${est.Nombre_estudiante}</td>
                <td>${est.ApellidoPaterno_estudiante}</td>
                <td>${est.ApellidoMaterno_estudiante}</td>
                <td>${est.Sexo}</td>
                <td>${new Date(est.Fecha_nacimiento).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="editarEstudiante(${est.Codigo_estudiante})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action" onclick="eliminarEstudiante(${est.Codigo_estudiante})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
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
    
    const formData = {
        Nombre_estudiante: document.getElementById('nombreEstudiante').value,
        ApellidoPaterno_estudiante: document.getElementById('apellidoPaternoEstudiante').value,
        ApellidoMaterno_estudiante: document.getElementById('apellidoMaternoEstudiante').value,
        Sexo: document.getElementById('sexoEstudiante').value,
        Fecha_nacimiento: document.getElementById('fechaNacimiento').value
    };
    
    try {
        showLoading();
        const response = await fetch(`${API_URL}/estudiantes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showAlert('Estudiante registrado correctamente', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalEstudiante')).hide();
            document.getElementById('formEstudiante').reset();
            cargarEstudiantes();
        } else {
            const error = await response.json();
            showAlert(error.error || 'Error al guardar', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión', 'danger');
    } finally {
        hideLoading();
    }
}

async function eliminarEstudiante(id) {
    if (!confirm('¿Está seguro de eliminar este estudiante?')) return;
    
    try {
        showLoading();
        const response = await fetch(`${API_URL}/estudiantes/${id}`, {
            method: 'DELETE'
        });
        
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

// ============ PADRES ============
async function cargarPadres() {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/padres`);
        const padres = await response.json();
        
        const tbody = document.getElementById('tablaPadres');
        if (!tbody) return;
        
        if (padres.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                        No hay padres registrados
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = padres.map(padre => `
            <tr>
                <td><strong>${padre.DNI_padre}</strong></td>
                <td>${padre.Nombre_padre}</td>
                <td>${padre.ApellidoPaterno_padre}</td>
                <td>${padre.ApellidoMaterno_padre}</td>
                <td>${padre.Telefono_padre || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="editarPadre('${padre.DNI_padre}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action" onclick="eliminarPadre('${padre.DNI_padre}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
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
    
    const formData = {
        DNI_padre: document.getElementById('dniPadre').value,
        Nombre_padre: document.getElementById('nombrePadre').value,
        ApellidoPaterno_padre: document.getElementById('apellidoPaternoPadre').value,
        ApellidoMaterno_padre: document.getElementById('apellidoMaternoPadre').value,
        Telefono_padre: document.getElementById('telefonoPadre').value
    };
    
    try {
        showLoading();
        const response = await fetch(`${API_URL}/padres`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showAlert('Padre/Apoderado registrado correctamente', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalPadre')).hide();
            document.getElementById('formPadre').reset();
            cargarPadres();
        } else {
            const error = await response.json();
            showAlert(error.error || 'Error al guardar', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión', 'danger');
    } finally {
        hideLoading();
    }
}

async function eliminarPadre(dni) {
    if (!confirm('¿Está seguro de eliminar este padre/apoderado?')) return;
    
    try {
        showLoading();
        const response = await fetch(`${API_URL}/padres/${dni}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showAlert('Registro eliminado', 'success');
            cargarPadres();
        } else {
            showAlert('Error al eliminar. Puede tener estudiantes asociados.', 'danger');
        }
    } catch (error) {
        showAlert('Error de conexión', 'danger');
    } finally {
        hideLoading();
    }
}

// ============ PROFESORES ============
async function cargarProfesores() {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/profesores`);
        const profesores = await response.json();
        
        const tbody = document.getElementById('tablaProfesores');
        if (!tbody) return;
        
        if (profesores.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                        No hay profesores registrados
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = profesores.map(prof => `
            <tr>
                <td><strong>${prof.Codigo_profesor}</strong></td>
                <td>${prof.Nombre_profesor}</td>
                <td>${prof.ApellidoPaterno_profesor}</td>
                <td>${prof.ApellidoMaterno_profesor}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="editarProfesor(${prof.Codigo_profesor})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action" onclick="eliminarProfesor(${prof.Codigo_profesor})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        actualizarContador('contadorProfesores', profesores.length);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar profesores', 'danger');
    } finally {
        hideLoading();
    }
}

async function guardarProfesor(event) {
    event.preventDefault();
    
    const formData = {
        Nombre_profesor: document.getElementById('nombreProfesor').value,
        ApellidoPaterno_profesor: document.getElementById('apellidoPaternoProfesor').value,
        ApellidoMaterno_profesor: document.getElementById('apellidoMaternoProfesor').value
    };
    
    try {
        showLoading();
        const response = await fetch(`${API_URL}/profesores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showAlert('Profesor registrado correctamente', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalProfesor')).hide();
            document.getElementById('formProfesor').reset();
            cargarProfesores();
        } else {
            const error = await response.json();
            showAlert(error.error || 'Error al guardar', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión', 'danger');
    } finally {
        hideLoading();
    }
}

async function eliminarProfesor(id) {
    if (!confirm('¿Está seguro de eliminar este profesor?')) return;
    
    try {
        showLoading();
        const response = await fetch(`${API_URL}/profesores/${id}`, {
            method: 'DELETE'
        });
        
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

// ============ MATRÍCULAS ============
async function cargarMatriculas() {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/matriculas`);
        const matriculas = await response.json();
        
        const tbody = document.getElementById('tablaMatriculas');
        if (!tbody) return;
        
        if (matriculas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                        No hay matrículas registradas
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = matriculas.map(mat => `
            <tr>
                <td><strong>${mat.Id_Matricula}</strong></td>
                <td>${new Date(mat.Fecha_Matricula).toLocaleDateString()}</td>
                <td>
                    <span class="badge ${mat.Estado_matricula === 'activo' ? 'bg-success' : mat.Estado_matricula === 'inactivo' ? 'bg-secondary' : 'bg-danger'}">
                        ${mat.Estado_matricula}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-info btn-action">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        actualizarContador('contadorMatriculas', matriculas.length);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar matrículas', 'danger');
    } finally {
        hideLoading();
    }
}

// ============ PAGOS ============
async function cargarPagos() {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/pagos`);
        const pagos = await response.json();
        
        const tbody = document.getElementById('tablaPagos');
        if (!tbody) return;
        
        if (pagos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                        No hay pagos registrados
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = pagos.map(pago => `
            <tr>
                <td><strong>${pago.Id_pago}</strong></td>
                <td>S/. ${parseFloat(pago.Monto_pago).toFixed(2)}</td>
                <td>${new Date(pago.Fecha_pago).toLocaleDateString()}</td>
                <td>${pago.Id_matricula || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info btn-action">
                        <i class="bi bi-printer"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        actualizarContador('contadorPagos', pagos.length);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar pagos', 'danger');
    } finally {
        hideLoading();
    }
}

// ============ CALIFICACIONES ============
async function cargarCalificaciones() {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/calificaciones`);
        const calificaciones = await response.json();
        
        const tbody = document.getElementById('tablaCalificaciones');
        if (!tbody) return;
        
        if (calificaciones.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                        No hay calificaciones registradas
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = calificaciones.map(cal => `
            <tr>
                <td><strong>${cal.Id_calificacion}</strong></td>
                <td>${cal.NotaPractica || '-'}</td>
                <td>${cal.NotaExamen || '-'}</td>
                <td>${cal.NotaLaboratorio || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="editarCalificacion(${cal.Id_calificacion})">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        actualizarContador('contadorCalificaciones', calificaciones.length);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar calificaciones', 'danger');
    } finally {
        hideLoading();
    }
}

async function guardarCalificacion(event) {
    event.preventDefault();
    
    const formData = {
        NotaPractica: document.getElementById('notaPractica').value || null,
        NotaExamen: document.getElementById('notaExamen').value || null,
        NotaLaboratorio: document.getElementById('notaLaboratorio').value || null
    };
    
    try {
        showLoading();
        const response = await fetch(`${API_URL}/calificaciones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showAlert('Calificación registrada correctamente', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalCalificacion')).hide();
            document.getElementById('formCalificacion').reset();
            cargarCalificaciones();
        } else {
            const error = await response.json();
            showAlert(error.error || 'Error al guardar', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión', 'danger');
    } finally {
        hideLoading();
    }
}

// ============ MATERIAS ============
async function cargarMaterias() {
    try {
        const response = await fetch(`${API_URL}/materias`);
        const materias = await response.json();
        
        const tbody = document.getElementById('tablaMaterias');
        if (tbody) {
            if (materias.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center text-muted py-4">
                            No hay materias registradas
                        </td>
                    </tr>
                `;
            } else {
                tbody.innerHTML = materias.map(mat => `
                    <tr>
                        <td><strong>${mat.Codigo_materia}</strong></td>
                        <td>${mat.Nombre_materia}</td>
                        <td>${mat.Nivel_grado || '-'}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary btn-action">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }
        
        actualizarContador('contadorMaterias', materias.length);
    } catch (error) {
        console.error('Error:', error);
    }
}

// ============ GRADOS ============
async function cargarGrados() {
    try {
        const response = await fetch(`${API_URL}/grados`);
        const grados = await response.json();
        
        const tbody = document.getElementById('tablaGrados');
        if (tbody) {
            if (grados.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="3" class="text-center text-muted py-4">
                            No hay grados registrados
                        </td>
                    </tr>
                `;
            } else {
                tbody.innerHTML = grados.map(g => `
                    <tr>
                        <td><strong>${g.Id_grado}</strong></td>
                        <td>${g.Nivel_grado}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary btn-action">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }
        
        actualizarContador('contadorGrados', grados.length);
    } catch (error) {
        console.error('Error:', error);
    }
}

// ============ PERIODOS ============
async function cargarPeriodos() {
    try {
        const response = await fetch(`${API_URL}/periodos`);
        const periodos = await response.json();
        
        const tbody = document.getElementById('tablaPeriodos');
        if (tbody) {
            if (periodos.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center text-muted py-4">
                            No hay periodos registrados
                        </td>
                    </tr>
                `;
            } else {
                tbody.innerHTML = periodos.map(p => `
                    <tr>
                        <td><strong>${p.Id_periodo}</strong></td>
                        <td>${new Date(p.Fecha_inicio).toLocaleDateString()}</td>
                        <td>${new Date(p.Fecha_fin).toLocaleDateString()}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary btn-action">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// ============ UTILIDADES ============
function actualizarContador(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = valor;
    }
}

// Inicialización según la página
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    
    if (path.includes('director')) {
        cargarEstudiantes();
        cargarPadres();
        cargarProfesores();
        cargarMatriculas();
        cargarPagos();
        cargarCalificaciones();
        cargarMaterias();
        cargarGrados();
    } else if (path.includes('secretaria')) {
        cargarEstudiantes();
        cargarPadres();
        cargarMatriculas();
        cargarPagos();
    } else if (path.includes('profesor')) {
        cargarCalificaciones();
        cargarMaterias();
        cargarPeriodos();
    }
});
