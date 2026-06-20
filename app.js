// MediTurno - app.js


// Objeto donde guardo lo que el usuario va eligiendo en cada paso
let seleccion = {
  especialidad: null,
  medico: null,
  dia: null,
  horario: null,
  paciente: null
};

// Para simular que algunos turnos están ocupados
const CHANCE_OCUPADO = 0.3;

// Nombres de días y meses para mostrar las fechas en español
const nombresDias  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Arranco la app cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  cargarDatos();
  asignarEventos();
});


// FETCH: cargo los datos desde el JSON


async function cargarDatos() {
  try {
    const respuesta = await fetch('data.json');

    if (!respuesta.ok) {
      throw new Error('No se pudo cargar el archivo');
    }

    const especialidades = await respuesta.json();
    mostrarEspecialidades(especialidades);

  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error al cargar los datos',
      text: 'No pudimos obtener la información. Por favor recargá la página.',
      confirmButtonColor: '#4f46e5'
    });
  }
}
// paso 1
// Función para mostrar las especialidades en el primer paso

function mostrarEspecialidades(especialidades) {
  const contenedor = document.getElementById('grillaespecialidades');

  contenedor.innerHTML = especialidades.map(esp => `
    <div class="card-especialidad"
         data-info='${JSON.stringify(esp)}'
         onmouseover="this.style.borderColor='${esp.colorAcento}'"
         onmouseout="this.style.borderColor='#e2e8f0'">
      <div class="esp-icono" style="background: ${esp.gradiente}">
        <i class="fa-solid ${esp.icono}"></i>
      </div>
      <p class="esp-nombre">${esp.especialidad}</p>
      <p class="esp-descripcion">${esp.descripcion}</p>
      <span class="esp-cantidad" style="color: ${esp.colorAcento}; background: ${esp.colorAcento}22">
        <i class="fa-solid fa-user-doctor"></i>
        ${esp.medicos.length} ${esp.medicos.length === 1 ? 'especialista' : 'especialistas'}
      </span>
    </div>
  `).join('');
}

// paso 2
// Función para mostrar los médicos de la especialidad elegida en el segundo paso

function mostrarMedicos(especialidad) {
  const contenedor = document.getElementById('grillamedicos');

  contenedor.innerHTML = especialidad.medicos.map(medico => `
    <div class="card-medico" data-info='${JSON.stringify(medico)}'>
      <div class="avatar-medico" style="background: ${especialidad.gradiente}">
        <i class="fa-solid fa-user-doctor"></i>
      </div>
      <div>
        <p class="medico-nombre">${medico.nombre}</p>
        <p class="medico-matricula">${medico.matricula}</p>
        <p class="medico-dato">
          <i class="fa-solid fa-briefcase-medical" style="color: ${especialidad.colorAcento}"></i>
          ${medico.experiencia}
        </p>
        <p class="medico-dato">
          <i class="fa-solid fa-calendar-days" style="color: ${especialidad.colorAcento}"></i>
          ${medico.atencion}
        </p>
        <p class="medico-dato">
          <i class="fa-solid fa-clock" style="color: ${especialidad.colorAcento}"></i>
          ${medico.turnos.length} horarios disponibles
        </p>
      </div>
      <i class="fa-solid fa-chevron-right medico-flecha"></i>
    </div>
  `).join('');
}

// Paso 3
// Función para generar los próximos 7 días hábiles a partir de mañana
function generarDiasHabiles() {
  const dias = [];
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 1);

  while (dias.length < 7) {
    const diaSemana = fecha.getDay();
    if (diaSemana >= 1 && diaSemana <= 5) {
      dias.push(new Date(fecha));
    }
    fecha.setDate(fecha.getDate() + 1);
  }

  return dias;
}

function mostrarDias() {
  const dias = generarDiasHabiles();
  const contenedor = document.getElementById('grillaDias');

  contenedor.innerHTML = dias.map(fecha => `
    <div class="card-dia" data-fecha="${fecha.toISOString()}">
      <p class="dia-nombre">${nombresDias[fecha.getDay()]}</p>
      <p class="dia-numero">${fecha.getDate()}</p>
      <p class="dia-mes">${nombresMeses[fecha.getMonth()].slice(0, 3)}</p>
    </div>
  `).join('');
}

function mostrarTurnos(turnos) {
  const contenedor = document.getElementById('grillaTurnos');

  // Genero los turnos y marco algunos como ocupados aleatoriamente
  contenedor.innerHTML = turnos.map(horario => {
    const ocupado = Math.random() < CHANCE_OCUPADO;
    return `
      <button class="chip-turno ${ocupado ? 'ocupado' : ''}"
              data-horario="${horario}"
              ${ocupado ? 'disabled' : ''}>
        ${horario}
      </button>
    `;
  }).join('');

  document.getElementById('contenedorTurnos').classList.remove('oculto');
  document.getElementById('btnContinuar').classList.add('oculto');
}

// Uso Sweetalert para formulario de paciente
async function pedirDatosPaciente() {
  const { value: datos } = await Swal.fire({
    title: 'Datos del paciente',
    html: `
      <div class="swal-form">
        <div class="swal-campo">
          <label>Nombre y apellido</label>
          <input id="inp-nombre" type="text" placeholder="Ej: María González">
        </div>
        <div class="swal-campo">
          <label>DNI</label>
          <input id="inp-dni" type="text" placeholder="Ej: 38.450.123" maxlength="12">
        </div>
        <div class="swal-campo">
          <label>Teléfono</label>
          <input id="inp-telefono" type="tel" placeholder="Ej: 351 412-3456">
        </div>
        <div class="swal-campo">
          <label>Obra Social</label>
          <input id="inp-obrasocial" type="text" placeholder="Ej: OSDE, Galeno, Particular">
        </div>
        <div class="swal-resumen">
          Turno con <strong>${seleccion.medico.nombre}</strong><br>
          ${formatearFecha(seleccion.dia)} · <strong>${seleccion.horario} hs</strong>
        </div>
      </div>
    `,
    confirmButtonText: 'Confirmar turno',
    showCancelButton: true,
    cancelButtonText: 'Volver',
    confirmButtonColor: '#4f46e5',
    cancelButtonColor: '#94a3b8',
    focusConfirm: false,
    preConfirm: () => {
      const nombre     = document.getElementById('inp-nombre').value.trim();
      const dni        = document.getElementById('inp-dni').value.trim();
      const telefono   = document.getElementById('inp-telefono').value.trim();
      const obraSocial = document.getElementById('inp-obrasocial').value.trim();

      if (!nombre || !dni || !telefono || !obraSocial) {
        Swal.showValidationMessage('Por favor completá todos los campos');
        return false;
      }

      return { nombre, dni, telefono, obraSocial };
    }
  });

  if (!datos) return;

  seleccion.paciente = datos;

  Swal.fire({
    title: 'Procesando tu turno...',
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading()
  });

  await new Promise(resolve => setTimeout(resolve, 1500));
  Swal.close();

  mostrarComprobante();
  irAPaso(4);
}

// Paso 4
// Función para mostrar el resumen del turno antes de confirmar
function mostrarComprobante() {
  const numeroTurno = `MT-${Date.now().toString().slice(-7)}`;
  const contenedor = document.getElementById('contenedorComprobante');

  contenedor.innerHTML = `
    <div class="comprobante">
      <div class="comprobante-cabecera">
        <div class="icono-exito">
          <i class="fa-solid fa-check"></i>
        </div>
        <h2 class="comprobante-titulo">¡Turno confirmado!</h2>
        <p class="comprobante-subtitulo">Guardá este comprobante</p>
        <span class="numero-turno"># ${numeroTurno}</span>
      </div>
      <diyv class="comprobante-cuerpo">
        <p><strong>Especialidad:</strong> ${seleccion.especialidad.especialidad}</p>
        <p><strong>Médico:</strong> ${seleccion.medico.nombre}</p>
        <p><strong>Fecha:</strong> ${formatearFecha(seleccion.dia)} · ${seleccion.horario} hs</p>
        <p><strong>Paciente:</strong> ${seleccion.paciente.nombre}</p>
        <p><strong>DNI:</strong> ${seleccion.paciente.dni}</p>
        <p><strong>Obra Social:</strong> ${seleccion.paciente.obraSocial}</p>
      </div>
      <div class="comprobante-pie">
        <div class="aviso">Presentate 10 minutos antes con DNI y carnet de obra social.</div>
        <button class="btn-nuevo-turno" id="btnNuevoTurno">Pedir otro turno</button>
      </div>
    </div>
  `;

  document.getElementById('btnNuevoTurno').addEventListener('click', reiniciar);
}

// Eventos y navegación entre pasos
// ============================================================
// EVENTOS
// ============================================================

function asignarEventos() {

  // cuando clickean una especialidad
  document.getElementById('grillaespecialidades').addEventListener('click', (e) => {
    const card = e.target.closest('.card-especialidad');
    if (!card) return;

    seleccion.especialidad = JSON.parse(card.dataset.info);
    mostrarMedicos(seleccion.especialidad);
    irAPaso(2);
    mostrarToast('Especialidad seleccionada ✔');
  });

  // cuando clickean un medico
  document.getElementById('grillamedicos').addEventListener('click', (e) => {
    const card = e.target.closest('.card-medico');
    if (!card) return;

    seleccion.medico = JSON.parse(card.dataset.info);
    mostrarDias();
    irAPaso(3);
    mostrarToast('Médico seleccionado ✔');
  });

  // cuando clickean un dia
  document.getElementById('grillaDias').addEventListener('click', (e) => {
    const card = e.target.closest('.card-dia');
    if (!card) return;

    // saco la clase de todos y se la pongo al que clickearon
    document.querySelectorAll('.card-dia').forEach(c => c.classList.remove('seleccionado'));
    card.classList.add('seleccionado');
    seleccion.dia = card.dataset.fecha;
    mostrarTurnos(seleccion.medico.turnos);
  });

  // cuando clickean un turno
  document.getElementById('grillaTurnos').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip-turno');
    if (!chip || chip.disabled) return;

    document.querySelectorAll('.chip-turno').forEach(c => c.classList.remove('seleccionado'));
    chip.classList.add('seleccionado');
    seleccion.horario = chip.dataset.horario;

    // muestro el boton para continuar
    document.getElementById('btnContinuar').classList.remove('oculto');
    mostrarToast('Turno seleccionado ✔');
  });

  document.getElementById('btnContinuar').addEventListener('click', pedirDatosPaciente);

  document.getElementById('btnVolverPaso1').addEventListener('click', () => {
    irAPaso(1);
  });

  document.getElementById('btnVolverPaso2').addEventListener('click', () => {
    irAPaso(2);
  });
}

// navegacion y toasts

// ============================================================
// EVENTOS
// ============================================================

function asignarEventos() {

  // cuando clickean una especialidad
  document.getElementById('grillaespecialidades').addEventListener('click', (e) => {
    const card = e.target.closest('.card-especialidad');
    if (!card) return;

    seleccion.especialidad = JSON.parse(card.dataset.info);
    mostrarMedicos(seleccion.especialidad);
    irAPaso(2);
    mostrarToast('Especialidad seleccionada ✔');
  });

  // cuando clickean un medico
  document.getElementById('grillamedicos').addEventListener('click', (e) => {
    const card = e.target.closest('.card-medico');
    if (!card) return;

    seleccion.medico = JSON.parse(card.dataset.info);
    mostrarDias();
    irAPaso(3);
    mostrarToast('Médico seleccionado ✔');
  });

  // cuando clickean un dia
  document.getElementById('grillaDias').addEventListener('click', (e) => {
    const card = e.target.closest('.card-dia');
    if (!card) return;

    // saco la clase de todos y se la pongo al que clickearon
    document.querySelectorAll('.card-dia').forEach(c => c.classList.remove('seleccionado'));
    card.classList.add('seleccionado');
    seleccion.dia = card.dataset.fecha;
    mostrarTurnos(seleccion.medico.turnos);
  });

  // cuando clickean un turno
  document.getElementById('grillaTurnos').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip-turno');
    if (!chip || chip.disabled) return;

    document.querySelectorAll('.chip-turno').forEach(c => c.classList.remove('seleccionado'));
    chip.classList.add('seleccionado');
    seleccion.horario = chip.dataset.horario;

    // muestro el boton para continuar
    document.getElementById('btnContinuar').classList.remove('oculto');
    mostrarToast('Turno seleccionado ✔');
  });

  document.getElementById('btnContinuar').addEventListener('click', pedirDatosPaciente);

  document.getElementById('btnVolverPaso1').addEventListener('click', () => {
    irAPaso(1);
  });

  document.getElementById('btnVolverPaso2').addEventListener('click', () => {
    irAPaso(2);
  });
}
