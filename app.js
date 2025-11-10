/* === app.js (CÓDIGO FINAL CON TODAS LAS MODIFICACIONES) === */

// --- 1. CONFIGURACIÓN DE SUPABASE ---
const SUPABASE_URL = 'https://rfetptbdzkmghvyhulje.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZXRwdGJkemttZ2h2eWh1bGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTg2NDYsImV4cCI6MjA3ODE5NDY0Nn0.hPnuVcVMkfuDJK32a701pQ0msf0qJat9asnHnuAhkGM';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 2. DATOS DE LA FUNDACIÓN (¡ACTUALIZA ESTOS DATOS!) ---
const CLAVE_ADMIN = "Geneluchi06102025"; 
const FUNDACION_TELEFONO = "04142629169"; // 👈 COLOCA AQUÍ EL NÚMERO REAL
const FUNDACION_BANCO = "Banco de Venezuela"; // 👈 COLOCA AQUÍ EL BANCO REAL
const FUNDACION_CEDULA = "J-501657513"; // 👈 COLOCA AQUÍ EL RIF/CÉDULA REAL

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
            <strong>📱 Pago Móvil:</strong> ${FUNDACION_TELEFONO}
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

// Formulario
const inputNombre = document.getElementById('nombre_apellido');
const inputTelefono = document.getElementById('telefono');
const inputCorreo = document.getElementById('correo_electronico');
const inputEdad = document.getElementById('edad');
const radioPagado = document.getElementById('estado-pagado');
const radioReservado = document.getElementById('estado-reservado');

// Pago Móvil
const datosPagoMovilBox = document.getElementById('datos-pago-movil');
const inputReferenciaPago = document.getElementById('referencia-pago');

// Referencias del Modal de Administración 
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

// Referencias del Modal de Notificación de Éxito
const successModal = document.getElementById('success-modal');
const successModalTitle = document.getElementById('success-modal-title');
const successModalIcon = document.getElementById('success-modal-icon');
const successModalMessage = document.getElementById('success-modal-message');
const successCloseBtn = document.getElementById('success-close-btn');


// --- FUNCIONES AUXILIARES DE MODALES Y ADMIN ---

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
        estadoTexto = 'VERIFICAR PAGO';
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
        showAdminInfo("❌ Clave de administrador incorrecta. Acceso denegado.");
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
        showAdminInfo('Error de Supabase al verificar. Verifica las políticas RLS.');
        return;
    }

    const numeroDiv = document.querySelector(`.numero-item[data-id="${id}"]`);
    if (numeroDiv) {
        numeroDiv.classList.remove('reservado', 'por-verificar');
        numeroDiv.classList.add('pagado');
        numeroDiv.dataset.estado = 'pagado';
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
            edad: null,
            referencia_pago: null
        })
        .eq('id', id);

    closeAdminModal();

    if (error) {
        console.error('❌ Error al liberar:', error);
        showAdminInfo('Error de Supabase al liberar el número. Verifica las políticas RLS.');
        return;
    }

    const numeroDiv = document.querySelector(`.numero-item[data-id="${id}"]`);
    if (numeroDiv) {
        numeroDiv.classList.remove('reservado', 'pagado', 'por-verificar');
        numeroDiv.classList.add('disponible');
        numeroDiv.dataset.estado = 'disponible';
        showAdminInfo(`🎉 El número ${String(id).padStart(3, '0')} ha sido liberado y está DISPONIBLE.`);
    }
}

// --- FUNCIÓN DE NOTIFICACIÓN DE ÉXITO (MEJORADA) ---

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
                🚨 No olvides cancelar a los siguientes datos:
            </p>
            ${DATOS_PAGO_FUNDACION}
            <p style="font-size: 0.9em; color: #333; margin-top: 15px;">
                Luego de realizar el pago, reenvía tu comprobante de pago al ${FUNDACION_TELEFONO} para que marquemos tu número como pagado.
            </p>
        `;
        successCloseBtn.textContent = '¡Entendido, haré el pago!';
        successCloseBtn.classList.remove('primary-btn', 'success-btn');
        successCloseBtn.classList.add('danger-btn');

    } else if (estado === 'por-verificar') {
        title = '¡Pago Registrado! 🔵';
        iconHTML = '⏳';
        message = `¡Gracias! El Número ${numeroFormateado} fue registrado como pagado. Revisaremos tu referencia en breve. ¡Mucha suerte!`;
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


// --- LÓGICA DE INTERACCIÓN Y FORMULARIO ---

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
    spanNumeroSeleccionado.textContent = String(id).padStart(3, '0');
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
    openAdminModal(id, estado);
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
        edad: inputEdad.value,
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
        alert('Hubo un error al guardar. Revisa la Consola (F12) para detalles y verifica tu RLS.');
        return;
    }

    if (data) {
        const numeroDiv = document.querySelector(`.numero-item[data-id="${idNumero}"]`);
        numeroDiv.classList.remove('disponible', 'reservado', 'pagado', 'por-verificar');
        numeroDiv.classList.add(data.estado);
        numeroDiv.dataset.estado = data.estado;

        cerrarModal();
        
        showSuccessModal(data.id, data.estado);
    }
}


// --- 6. FUNCIÓN PRINCIPAL DE CARGA DE NÚMEROS (MODIFICADA PARA TOOLTIP) ---

async function cargarNumeros() {
    const MIN_LOAD_TIME = 1000; // 1 segundo de duración mínima para el preloader
    const startTime = Date.now();

    const { data: numeros, error } = await supabase
        .from('numeros_rifa')
        .select('*')
        .order('id', { ascending: true })
        .limit(1001); 

    if (error) {
        console.error("❌ Error de Conexión o RLS:", error);
        mensajeCargando.textContent = "Error al conectar con Supabase. Revisa tus credenciales y políticas de RLS.";
        setTimeout(() => { preloaderOverlay.classList.add('loaded'); }, MIN_LOAD_TIME);
        return;
    }

    mensajeCargando.style.display = 'none';
    talonarioContainer.innerHTML = '';

    numeros.forEach(numero => {
        const numeroDiv = document.createElement('div');
        numeroDiv.classList.add('numero-item');
        numeroDiv.classList.add(numero.estado);
        numeroDiv.textContent = String(numero.id).padStart(3, '0');
        numeroDiv.dataset.id = numero.id;
        numeroDiv.dataset.estado = numero.estado;
        
        // --- NUEVA LÓGICA DE TOOLTIP ---
        let tooltipText = '';
        if (numero.estado === 'reservado') {
            tooltipText = 'Reservado';
        } else if (numero.estado === 'por-verificar') {
            tooltipText = 'Verificando pago';
        } else if (numero.estado === 'pagado') {
            tooltipText = '¡Pagado y Asegurado!';
        }
        
        if (tooltipText) {
            numeroDiv.setAttribute('data-tooltip', tooltipText);
        }
        // --- FIN LÓGICA DE TOOLTIP ---

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
    
    // Calcula el tiempo restante y oculta el preloader
    const elapsedTime = Date.now() - startTime;
    const timeToWait = Math.max(0, MIN_LOAD_TIME - elapsedTime);

    setTimeout(() => {
        preloaderOverlay.classList.add('loaded');
    }, timeToWait);
}

// --- 8. INICIO DEL PROGRAMA Y LISTENERS ---
document.addEventListener('DOMContentLoaded', cargarNumeros);
closeModalBtn.addEventListener('click', cerrarModal);
formulario.addEventListener('submit', handleFormSubmit);

// LISTENERS para la reactividad del formulario de pago
radioPagado.addEventListener('change', handleEstadoChange);
radioReservado.addEventListener('change', handleEstadoChange);

modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        cerrarModal();
    }
});

// LISTENERS del Modal de Administración 
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

// Botones de Acción
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

// LISTENERS del Modal de Notificación de Éxito
successCloseBtn.addEventListener('click', closeSuccessModal);
successModal.addEventListener('click', (event) => {
    if (event.target === successModal) {
        closeSuccessModal();
    }
});
