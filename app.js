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