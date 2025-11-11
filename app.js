/* === app.js (CÓDIGO FINAL Y COMPLETO CON MODAL DE OPCIONES DE RESERVA) === */

// --- 1. CONFIGURACIÓN DE SUPABASE ---
const SUPABASE_URL = 'https://rfetptbdzkmghvyhulje.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZXRwdGJkemttZ2h2eWh1bGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTg2NDYsImV4cCI6MjA3ODE5NDY0Nn0.hPnuVcVMkfuDJK32a701pQ0msf0qJat9asnHnuAhkGM';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 2. DATOS DE LA FUNDACIÓN (¡ACTUALIZA ESTO!) ---
const CLAVE_ADMIN = "Geneluchi102025";
const FUNDACION_TELEFONO = "04142629169"; 
const FUNDACION_BANCO = "Banco de Venezuela"; 
const FUNDACION_CEDULA = "J-501657513"; 

// Datos de la fundación para mostrar en el modal de reserva
const DATOS_PAGO_FUNDACION = `
    <ul style="list-style: none; padding: 10px; text-align: left; background-color: #ffe0f0; border: 1px solid #c2185b; border-radius: 8px;">
        <li style="margin-bottom: 8px;">
            <strong>🏦 Banco:</strong> ${FUNDACION_BANCO}
        </li>
        <li style="margin-bottom: 8px;">
            <strong>🆔 Cédula/RIF:</strong> ${FUNDACION_CEDULA}
        </li>
        <li>
            <strong>📱 Teléfono Pago Móvil:</strong> ${FUNDACION_TELEFONO}
        </li>
    </ul>
`;

// --- 3. REFERENCIAS A ELEMENTOS DEL DOM ---
const preloaderOverlay = document.getElementById('preloader-overlay');
const talonarioContainer = document.getElementById('talonario-container');
const mensajeCargando = document.getElementById('cargando-mensaje');
const modal = document.getElementById('modal-formulario');
const closeModalBtn = document.querySelector('.close-modal');
const formulario = document.getElementById('formulario-reserva');
const spanNumeroSeleccionado = document.getElementById('numero-seleccionado');
const inputNumeroIdHidden = document.getElementById('numero-id-hidden');
const inputNombre = document.getElementById('nombre_apellido');
const inputTelefono = document.getElementById('telefono');
const inputCorreo = document.getElementById('correo_electronico');
const radioPagado = document.getElementById('estado-pagado');
const radioReservado = document.getElementById('estado-reservado');
const datosPagoMovilBox = document.getElementById('datos-pago-movil');
const inputReferenciaPago = document.getElementById('referencia-pago');
const adminModal = document.getElementById('admin-modal');
const adminCloseBtn = document.querySelector('.admin-close-btn');
const adminLoginBox = document.getElementById('admin-login-box');
const adminPasswordInput = document.getElementById('admin-password-input');
const adminLoginBtn = document.getElementById('admin-login-btn');
const adminOptionsBox = document.getElementById('admin-options-box');
const adminLiberarBtn = document.getElementById('admin-liberar-btn');
const adminVerificarBtn = document.getElementById('admin-verificar-btn');
const adminCancelBtn = document.getElementById('admin-cancel-btn');
const adminNumeroDisplay = document.getElementById('admin-numero-display');
const adminNumeroOpcion = document.getElementById('admin-numero-opcion');
const adminModalStatus = document.getElementById('admin-modal-status');
const adminInfoBox = document.getElementById('admin-info-box');
const adminInfoText = document.getElementById('admin-info-text');
const adminInfoCloseBtn = document.getElementById('admin-info-close-btn');
let currentAdminNumberId = null;
let currentAdminNumberEstado = null;
const pagoReservaModal = document.getElementById('pago-reserva-modal');
const pagoReservaCloseBtn = document.querySelector('.pago-reserva-close-btn');
const pagoReservaNumeroDisplay = document.getElementById('pago-reserva-numero');
const pagoReservaIdHidden = document.getElementById('pago-reserva-id-hidden');
const formularioReportePago = document.getElementById('formulario-reporte-pago');
const inputReferenciaPagoReserva = document.getElementById('referencia-pago-reserva');
const successModal = document.getElementById('success-modal');
const successModalTitle = document.getElementById('success-modal-title');
const successModalIcon = document.getElementById('success-modal-icon');
const successModalMessage = document.getElementById('success-modal-message');
const successCloseBtn = document.getElementById('success-close-btn');
const opcionesReservaModal = document.getElementById('opciones-reserva-modal');
const opcionesReservaCloseBtn = document.querySelector('.opciones-reserva-close-btn');
const opcionesReservaNumeroDisplay = document.getElementById('opciones-reserva-numero');
const btnReportarPago = document.getElementById('btn-reportar-pago');
const btnAdminReserva = document.getElementById('btn-admin-reserva');
const btnCancelarOpciones = document.getElementById('btn-cancelar-reserva-opciones');

// --- REFERENCIAS NUEVAS PARA EL MODAL DE RECORDATORIO ---
const recordatorioModal = document.getElementById('recordatorio-modal');
const recordatorioCloseBtn = document.getElementById('recordatorio-close-btn');
const recordatorioTitle = document.getElementById('recordatorio-title');
const recordatorioBody = document.getElementById('recordatorio-body');
const recordatorioFooter = document.getElementById('recordatorio-footer');
let numerosDelUsuario = []; // Almacena los números encontrados del usuario

// --- FUNCIONES AUXILIARES DE MODALES Y ADMIN (Se omiten para concisión, pero son las mismas) ---
// ... (mismo código de funciones auxiliares)

function openAdminModal(id, estado) {
    currentAdminNumberId = id;
    currentAdminNumberEstado = estado;
    const numeroFormateado = String(id).padStart(3, '0');
    adminNumeroDisplay.textContent = numeroFormateado;
    adminNumeroOpcion.textContent = numeroFormateado;
    let estadoTexto = '';
    let estadoColor = '';
    if (estado === 'pagado') {
        estadoTexto = 'PAGO VERIFICADO';
        estadoColor = '#5cb85c';
    } else if (estado === 'reservado') {
        estadoTexto = 'RESERVADO';
        estadoColor = '#f0ad4e';
    } else if (estado === 'por-verificar') {
        estadoTexto = 'VERIFICANDO PAGO';
        estadoColor = '#007bff';
    } else {
        estadoTexto = 'DESCONOCIDO';
        estadoColor = '#333';
    }
    adminModalStatus.textContent = `Estado Actual: ${estadoTexto}`;
    adminModalStatus.style.backgroundColor = estadoColor;
    adminModalStatus.style.color = 'white';
    adminLoginBox.style.display = 'block';
    adminOptionsBox.style.display = 'none';
    adminInfoBox.style.display = 'none';
    adminPasswordInput.value = '';
    adminModal.style.display = 'flex';
}

function closeAdminModal() {
    adminModal.style.display = 'none';
    currentAdminNumberId = null;
    currentAdminNumberEstado = null;
}

function showAdminOptions() {
    adminLoginBox.style.display = 'none';
    adminOptionsBox.style.display = 'block';
}

function showAdminInfo(message) {
    adminLoginBox.style.display = 'none';
    adminOptionsBox.style.display = 'none';
    adminInfoText.textContent = message;
    adminInfoBox.style.display = 'block';
    adminModal.style.display = 'flex';
}

function handleAdminLogin() {
    const password = adminPasswordInput.value;
    if (password === CLAVE_ADMIN) {
        showAdminOptions();
    } else {
        showAdminInfo("❌ Clave de administrador es incorrecta. Acceso denegado.❌");
    }
}

async function verificarPago(id) {
    const { error } = await supabase
        .from('numeros_rifa')
        .update({ estado: 'pagado' })
        .eq('id', id);
    closeAdminModal();
    if (error) {
        console.error('❌ Error al verificar pago:', error);
        showAdminInfo('Intentalo más tarde. Estamos presentando fallas.');
        return;
    }
    const numeroDiv = document.querySelector(`.numero-item[data-id="${id}"]`);
    if (numeroDiv) {
        numeroDiv.classList.remove('reservado', 'por-verificar');
        numeroDiv.classList.add('pagado');
        numeroDiv.dataset.estado = 'pagado';
        numeroDiv.setAttribute('data-tooltip', '¡Pagado y Asegurado!');
        showAdminInfo(`🎉 El número ${String(id).padStart(3, '0')} ha sido marcado como PAGADO.`);
    }
}

async function liberarNumero(id) {
    const { error } = await supabase
        .from('numeros_rifa')
        .update({
            estado: 'disponible',
            nombre_apellido: null,
            telefono: null,
            correo_electronico: null,
            referencia_pago: null
        })
        .eq('id', id);
    closeAdminModal();
    if (error) {
        console.error('❌ Error al liberar:', error);
        showAdminInfo('Intentalo más tarde. Estamos presentando fallas.');
        return;
    }
    const numeroDiv = document.querySelector(`.numero-item[data-id="${id}"]`);
    if (numeroDiv) {
        numeroDiv.classList.remove('reservado', 'pagado', 'por-verificar');
        numeroDiv.classList.add('disponible');
        numeroDiv.dataset.estado = 'disponible';
        numeroDiv.removeAttribute('data-tooltip');
        showAdminInfo(`🎉 El número ${String(id).padStart(3, '0')} ha sido liberado y está DISPONIBLE.`);
    }
}

// --- FUNCIÓN DE NOTIFICACIÓN DE ÉXITO (Se omite para concisión, pero es la misma) ---

function showSuccessModal(numero, estado) {
    const numeroFormateado = String(numero).padStart(3, '0');
    let title = '';
    let iconHTML = '';
    let message = '';
    if (estado === 'reservado') {
        title = '¡Número Reservado con éxito! 🥳';
        iconHTML = '📌';
        message = `
            El Número ${numeroFormateado} ha sido reservado a tu nombre. ¡Gracias por unirte a la lucha!
            
            <p style="margin-top: 15px; font-weight: 700; color: #c2185b;">
                🚨 Recuerda cancelar a la brevedad a los siguientes datos:
            </p>
            ${DATOS_PAGO_FUNDACION}
            <p style="font-size: 0.9em; color: #333; margin-top: 15px;">
                Luego de realizar el pago, puedes volver a presionar el número ${numeroFormateado} y usar la opción de "Reportar Pago" para pasarlo a Verificando Pago.
                Asi como, puedes tomar capture a los datos de Pago Móvil para tenerlos a la mano. 
                No olvides enviar tu comprobante de pago conjuntamente a tu Nombre y Apellido al número antes mencionado.
                ¡Mucha suerte! 
            </p>
        `;
        successCloseBtn.textContent = '¡Entendido, haré el pago!';
        successCloseBtn.classList.remove('primary-btn', 'success-btn');
        successCloseBtn.classList.add('danger-btn');
    } else if (estado === 'por-verificar') {
        title = '¡Pago Registrado! 🔵';
        iconHTML = '⏳';
        message = `¡Gracias! El Número ${numeroFormateado} está marcado como "Verificando Pago". Revisaremos tu referencia en breve. ¡Mucha suerte!`;
        successCloseBtn.textContent = '¡Gracias por mi número!';
        successCloseBtn.classList.remove('danger-btn');
        successCloseBtn.classList.add('success-btn');
    }
    successModalTitle.innerHTML = title;
    successModalIcon.textContent = iconHTML;
    successModalMessage.innerHTML = message;
    successModal.style.display = 'flex';
}

function closeSuccessModal() {
    successModal.style.display = 'none';
}

// --- FUNCIÓN PARA ABRIR EL MODAL DE OPCIONES DE RESERVA ---
function openOpcionesReservaModal(id) {
    opcionesReservaNumeroDisplay.textContent = String(id).padStart(3, '0');
    opcionesReservaModal.dataset.currentId = id;
    opcionesReservaModal.style.display = 'flex';
}

function closeOpcionesReservaModal() {
    opcionesReservaModal.style.display = 'none';
    opcionesReservaModal.removeAttribute('data-current-id');
}


// --- LÓGICA DE INTERACCIÓN Y FORMULARIO (Se omiten para concisión, pero son las mismas) ---

function handleEstadoChange() {
    if (radioPagado.checked) {
        datosPagoMovilBox.style.display = 'block';
        inputReferenciaPago.required = true;
    } else {
        datosPagoMovilBox.style.display = 'none';
        inputReferenciaPago.required = false;
        inputReferenciaPago.value = '';
    }
}

function abrirModal(id) {
    const numeroFormateado = String(id).padStart(3, '0');
    localStorage.setItem('ultimo_numero_seleccionado', id);
    spanNumeroSeleccionado.textContent = numeroFormateado;
    inputNumeroIdHidden.value = id;
    formulario.reset();
    datosPagoMovilBox.style.display = 'none';
    radioReservado.checked = true;
    modal.style.display = 'flex';
    setTimeout(() => { modal.classList.add('show'); }, 10);
}

function cerrarModal() {
    modal.classList.remove('show');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}

function mostrarDatosOcupados(id, estado) {
    const numeroFormateado = String(id).padStart(3, '0');
    if (estado === 'reservado') {
        openOpcionesReservaModal(id);
    } else if (estado === 'pagado' || estado === 'por-verificar') {
        const esAdmin = confirm(
            `El Número ${numeroFormateado} ya está ${estado.toUpperCase().replace('-', ' ')}.\n` +
            `Presiona "Aceptar" unicamente si eres administrador.`
        );
        if (esAdmin) {
            openAdminModal(id, estado);
        } else {
            alert(`El Número ${numeroFormateado} ya está ocupado. ¡Busca otro y se el GANADOR!`);
        }
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const estadoSeleccionado = document.querySelector('input[name="estado"]:checked').value;
    const idNumero = inputNumeroIdHidden.value;
    let referencia = null;
    let estadoFinal = estadoSeleccionado;
    if (estadoSeleccionado === 'pagado') {
        referencia = inputReferenciaPago.value.trim();
        if (!referencia) {
            alert('🚨 Por favor, introduce el Número de Referencia/Transacción.');
            return;
        }
        estadoFinal = 'por-verificar';
    }
    const datosActualizacion = {
        nombre_apellido: inputNombre.value,
        telefono: inputTelefono.value,
        correo_electronico: inputCorreo.value || null,
        estado: estadoFinal,
        referencia_pago: referencia
    };
    const { data, error } = await supabase
        .from('numeros_rifa')
        .update(datosActualizacion)
        .eq('id', idNumero)
        .select()
        .single();
    if (error) {
        console.error('❌ Error al guardar datos:', error);
        alert('Refresca la pagina (F5) e intenta de nuevo.');
        return;
    }
    if (data) {
        const numeroDiv = document.querySelector(`.numero-item[data-id="${idNumero}"]`);
        numeroDiv.classList.remove('disponible', 'reservado', 'pagado', 'por-verificar');
        numeroDiv.classList.add(data.estado);
        numeroDiv.dataset.estado = data.estado;
        let tooltipText = data.estado === 'reservado' ? 'Reservado (Paga ahora)' : (data.estado === 'por-verificar' ? 'Pendiente de Pago' : '');
        if (tooltipText) {
            numeroDiv.setAttribute('data-tooltip', tooltipText);
        } else {
             numeroDiv.removeAttribute('data-tooltip');
        }
        cerrarModal();
        showSuccessModal(data.id, data.estado);
        localStorage.removeItem('ultimo_numero_seleccionado');
    }
}

// --- LÓGICA DEL MODAL DE REPORTE DE PAGO (Se omite para concisión, pero es la misma) ---

function openPagoReservaModal(id) {
    pagoReservaNumeroDisplay.textContent = String(id).padStart(3, '0');
    pagoReservaIdHidden.value = id;
    formularioReportePago.reset();
    const datosPagoInfo = pagoReservaModal.querySelector('.pago-info-grid');
    datosPagoInfo.innerHTML = `
        <label>Banco:</label>
        <span class="info-data">${FUNDACION_BANCO}</span>
        <label>RIF/Cédula:</label>
        <span class="info-data">${FUNDACION_CEDULA}</span>
        <label>Teléfono:</label>
        <span class="info-data">${FUNDACION_TELEFONO}</span>
    `;
    pagoReservaModal.style.display = 'flex';
}

function closePagoReservaModal() {
    pagoReservaModal.style.display = 'none';
}

async function handleReportePagoSubmit(event) {
    event.preventDefault();
    const idNumero = pagoReservaIdHidden.value;
    const referencia = inputReferenciaPagoReserva.value.trim();
    if (!referencia) {
        alert('🚨 Por favor, introduce el Número de Referencia/Transacción.');
        return;
    }
    const datosActualizacion = {
        estado: 'por-verificar',
        referencia_pago: referencia
    };
    const { data, error } = await supabase
        .from('numeros_rifa')
        .update(datosActualizacion)
        .eq('id', idNumero)
        .select()
        .single();
    if (error) {
        console.error('❌ Error al reportar pago:', error);
        alert('Hubo un error al reportar el pago. Intenta de nuevo.');
        return;
    }
    if (data) {
        const numeroDiv = document.querySelector(`.numero-item[data-id="${idNumero}"]`);
        numeroDiv.classList.remove('reservado');
        numeroDiv.classList.add(data.estado);
        numeroDiv.dataset.estado = data.estado;
        numeroDiv.setAttribute('data-tooltip', 'Pendiente de Pago');
        closePagoReservaModal();
        showSuccessModal(data.id, data.estado);
        localStorage.removeItem('ultimo_numero_seleccionado');
    }
}

// --- FUNCIÓN CENTRAL DE RECORDATORIO (¡MODIFICADA!) ---

async function revisarNumeroPendiente() {
    // 1. Obtener el ID del último número tocado
    const ultimoId = localStorage.getItem('ultimo_numero_seleccionado');
    if (!ultimoId) return; // Si no hay ID en la memoria local, no hacemos nada.
    
    // 2. Intentar buscar el número en Supabase usando el ID como referencia
    const { data: numeroLocal, error } = await supabase
        .from('numeros_rifa')
        .select('id, estado, nombre_apellido, telefono')
        .eq('id', ultimoId)
        .single();

    if (error || !numeroLocal) {
        console.error("No se pudo obtener el número de la sesión local. Limpiando caché. Error:", error);
        localStorage.removeItem('ultimo_numero_seleccionado');
        return;
    }

    // 3. Buscar TODOS los números asociados a este usuario (por Nombre y Teléfono)
    // Usamos el nombre y teléfono del número local como clave de búsqueda
    const { data: numerosUsuario, error: errorUsuario } = await supabase
        .from('numeros_rifa')
        .select('id, estado')
        .eq('nombre_apellido', numeroLocal.nombre_apellido)
        .eq('telefono', numeroLocal.telefono)
        .order('id', { ascending: true });

    if (errorUsuario || !numerosUsuario || numerosUsuario.length === 0) {
        // Esto no debería pasar si el primer query funcionó, pero es un buen guardián
        return;
    }
    
    numerosDelUsuario = numerosUsuario; // Guardar la lista globalmente
    let listaHTML = '';
    let totalReservados = 0;
    let totalPorVerificar = 0;
    let todosPagados = true;
    let primerNumeroReservado = null; // Para el botón de "Pagar ahora"

    // 4. Construir la lista HTML y contar estados
    numerosUsuario.forEach(n => {
        const numeroFormateado = String(n.id).padStart(3, '0');
        let claseEstado = '';
        let estadoTexto = '';

        if (n.estado === 'reservado') {
            claseEstado = 'recordatorio-reservado';
            estadoTexto = '⚠️ Pendiente de Pago';
            totalReservados++;
            todosPagados = false;
            if (!primerNumeroReservado) primerNumeroReservado = n.id;
        } else if (n.estado === 'por-verificar') {
            claseEstado = 'recordatorio-por-verificar';
            estadoTexto = '⏳ Pago en Revisión';
            totalPorVerificar++;
            todosPagados = false;
        } else if (n.estado === 'pagado') {
            claseEstado = 'recordatorio-pagado';
            estadoTexto = '✅ ¡Confirmado!';
        } else {
             return; // Ignorar si está disponible o cualquier otro estado anómalo
        }

        listaHTML += `
            <li class="${claseEstado}">
                <span class="numero-id">${numeroFormateado}</span>
                <span class="estado-texto">${estadoTexto}</span>
            </li>
        `;
    });

    // Si el usuario no tiene números reservados o pendientes (todos pagados o ninguno)
    if (todosPagados) {
        // Caso: Todos Pagados (Verde)
        recordatorioTitle.innerHTML = '🎉 ¡Felicidades, ' + numeroLocal.nombre_apellido.split(' ')[0] + '!';
        recordatorioBody.innerHTML = `
            <p>¡Todos tus números (${numerosUsuario.length}) han sido confirmados y pagados!</p>
            <ul class="lista-recordatorio">${listaHTML}</ul>
            <p style="margin-top: 20px;">Tu apoyo es invaluable. ¿Te animas a participar con otro número?</p>
        `;
        recordatorioFooter.innerHTML = `
            <button id="btn-tomar-otro" class="admin-btn primary-btn">Sí, Tomar Otro</button>
        `;
        document.getElementById('btn-tomar-otro').onclick = closeRecordatorioModal;
    } else {
        // Caso: Pendientes (Reservado o Por-Verificar)
        recordatorioTitle.innerHTML = '👋 ¡Bienvenido de nuevo!';
        let accionPrincipal = '';

        if (totalReservados > 0) {
            // El usuario tiene números en naranja (Reservado)
            accionPrincipal = `
                <button id="btn-pagar-ahora" class="admin-btn danger-btn" data-id="${primerNumeroReservado}">Pagar/Reportar Ahora</button>
            `;
            recordatorioBody.innerHTML = `
                <p>Aún tienes ${totalReservados} número(s) reservados, pendientes de pago. ¡No pierdas tu oportunidad!</p>
                <p>También tienes ${totalPorVerificar} en revisión.</p>
                <ul class="lista-recordatorio">${listaHTML}</ul>
                <p style="margin-top: 15px; font-weight: bold;">¿Deseas reportar el pago de uno de tus números reservados ahora?</p>
            `;
        } else {
            // Todos los números pendientes están en Azul (Por Verificar)
            accionPrincipal = `
                <p style="color: #007bff; font-weight: 700;">Estamos revisando tu pago, te notificaremos pronto.</p>
            `;
            recordatorioBody.innerHTML = `
                <p>Tus ${totalPorVerificar} números se encuentran en estado de VERIFICANDO PAGO (Azul).</p>
                <ul class="lista-recordatorio">${listaHTML}</ul>
                <p style="margin-top: 15px;">¡Gracias por tu apoyo! No necesitas hacer nada más por ahora.</p>
            `;
        }

        recordatorioFooter.innerHTML = `
            ${accionPrincipal}
            <button id="btn-revisar-luego" class="admin-btn secondary-btn">Revisar más tarde</button>
        `;

        if (document.getElementById('btn-pagar-ahora')) {
            document.getElementById('btn-pagar-ahora').onclick = (e) => {
                closeRecordatorioModal();
                const id = e.target.getAttribute('data-id');
                openPagoReservaModal(parseInt(id)); // Abrir modal de reporte de pago
            };
        }
        document.getElementById('btn-revisar-luego').onclick = closeRecordatorioModal;
    }
    
    recordatorioModal.style.display = 'flex';
}

function closeRecordatorioModal() {
    recordatorioModal.style.display = 'none';
}

// --- FUNCIÓN PRINCIPAL DE CARGA DE NÚMEROS (Misceláneos) ---

async function cargarNumeros() {
    const MIN_LOAD_TIME = 1000;
    const startTime = Date.now();
    
    const { data: numeros, error } = await supabase
        .from('numeros_rifa')
        .select('*')
        .order('id', { ascending: true })
        .limit(1001);
    
    // --- MANEJO DE ERRORES MEJORADO ---
    if (error) {
        console.error("❌ Oh, algo ha salido mal:", error);
        mensajeCargando.innerHTML = `
            <strong>🚨 ¡ERROR DE CONEXIÓN!</strong><br>
            Refreca la pagina (F5):<br>
            1. Verifica que estes conectado a Internet.<br>
            2. En caso de emergencia, comunicate con el administrador.
        `;
        mensajeCargando.style.color = '#d9534f';
        setTimeout(() => { preloaderOverlay.classList.add('loaded'); }, MIN_LOAD_TIME);
        return;
    }
    // --------------------------------------------------

    mensajeCargando.style.display = 'none';
    talonarioContainer.innerHTML = '';
    
    numeros.forEach(numero => {
        const numeroDiv = document.createElement('div');
        numeroDiv.classList.add('numero-item');
        numeroDiv.classList.add(numero.estado);
        numeroDiv.textContent = String(numero.id).padStart(3, '0');
        numeroDiv.dataset.id = numero.id;
        numeroDiv.dataset.estado = numero.estado;
        let tooltipText = '';
        if (numero.estado === 'reservado') {
            tooltipText = 'Reservado (Pagar ahora)';
        } else if (numero.estado === 'por-verificar') {
            tooltipText = 'Verificando Pago';
        } else if (numero.estado === 'pagado') {
            tooltipText = '¡Pagado y Asegurado!';
        }
        if (tooltipText) {
            numeroDiv.setAttribute('data-tooltip', tooltipText);
        }
        numeroDiv.addEventListener('click', () => {
            const estadoActual = numeroDiv.dataset.estado;
            if (estadoActual === 'disponible') {
                abrirModal(numero.id);
            } else {
                mostrarDatosOcupados(numero.id, estadoActual);
            }
        });
        talonarioContainer.appendChild(numeroDiv);
    });

    const elapsedTime = Date.now() - startTime;
    const timeToWait = Math.max(0, MIN_LOAD_TIME - elapsedTime);
    setTimeout(() => {
        preloaderOverlay.classList.add('loaded');
        revisarNumeroPendiente(); // <-- LLAMADA PARA ACTIVAR EL RECORDATORIO
    }, timeToWait);
}

// --- 8. INICIO DEL PROGRAMA Y LISTENERS ---
document.addEventListener('DOMContentLoaded', cargarNumeros);
closeModalBtn.addEventListener('click', cerrarModal);
formulario.addEventListener('submit', handleFormSubmit);
radioPagado.addEventListener('change', handleEstadoChange);
radioReservado.addEventListener('change', handleEstadoChange);
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        cerrarModal();
    }
});
adminCloseBtn.addEventListener('click', closeAdminModal);
adminInfoCloseBtn.addEventListener('click', closeAdminModal);
adminCancelBtn.addEventListener('click', closeAdminModal);
adminLoginBtn.addEventListener('click', handleAdminLogin);
adminModal.addEventListener('click', (event) => {
    if (event.target === adminModal) {
        if (adminInfoBox.style.display === 'none') {
             closeAdminModal();
        }
    }
});
adminLiberarBtn.addEventListener('click', () => {
    liberarNumero(currentAdminNumberId);
});
adminVerificarBtn.addEventListener('click', () => {
    if (currentAdminNumberEstado === 'reservado' || currentAdminNumberEstado === 'por-verificar') {
        verificarPago(currentAdminNumberId);
    } else {
        showAdminInfo('Este número ya está verificado y pagado.');
    }
});
pagoReservaCloseBtn.addEventListener('click', closePagoReservaModal);
formularioReportePago.addEventListener('submit', handleReportePagoSubmit);
pagoReservaModal.addEventListener('click', (event) => {
    if (event.target === pagoReservaModal) {
        closePagoReservaModal();
    }
});
successCloseBtn.addEventListener('click', closeSuccessModal);
successModal.addEventListener('click', (event) => {
    if (event.target === successModal) {
        closeSuccessModal();
    }
});
opcionesReservaCloseBtn.addEventListener('click', closeOpcionesReservaModal);
btnCancelarOpciones.addEventListener('click', closeOpcionesReservaModal);
btnAdminReserva.addEventListener('click', () => {
    const id = opcionesReservaModal.dataset.currentId;
    closeOpcionesReservaModal();
    openAdminModal(parseInt(id), 'reservado');
});
btnReportarPago.addEventListener('click', () => {
    const id = opcionesReservaModal.dataset.currentId;
    closeOpcionesReservaModal();
    openPagoReservaModal(parseInt(id));
});
opcionesReservaModal.addEventListener('click', (event) => {
    if (event.target === opcionesReservaModal) {
        closeOpcionesReservaModal();
    }
});

// LISTENERS DEL NUEVO MODAL DE RECORDATORIO
recordatorioCloseBtn.addEventListener('click', closeRecordatorioModal);
recordatorioModal.addEventListener('click', (event) => {
    if (event.target === recordatorioModal) {
        closeRecordatorioModal();
    }
});