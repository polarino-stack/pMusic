let listaCanciones = []; // Variable global para almacenar la lista de canciones
let indiceActual = 0; // Variable global para almacenar el índice de la canción actual
const cantidadBarrasEcualizador = 32;
const barrasEcualizador = [];
let analizadorEcualizador = null;
let datosFrecuenciaEcualizador = null;
let animacionEcualizador = null;

function crearBarrasEcualizador() {
    const contenedor = document.getElementById("eqBars");

    for (let indice = 0; indice < cantidadBarrasEcualizador; indice++) {
        const barra = document.createElement("span");
        barra.setAttribute("aria-hidden", "true");
        barra.style.height = "3px";
        contenedor.appendChild(barra);
        barrasEcualizador.push(barra);
    }
}

function prepararAnalizadorEcualizador() {
    if (analizadorEcualizador) {
        return true;
    }

    if (!Howler.usingWebAudio || !Howler.ctx || !Howler.masterGain) {
        console.error("El ecualizador necesita la reproducción Web Audio de Howler.");
        return false;
    }

    const contexto = Howler.ctx;
    analizadorEcualizador = contexto.createAnalyser();
    analizadorEcualizador.fftSize = 128;
    analizadorEcualizador.smoothingTimeConstant = 0.78;
    datosFrecuenciaEcualizador = new Uint8Array(analizadorEcualizador.frequencyBinCount);

    const salidaSilenciosa = contexto.createGain();
    salidaSilenciosa.gain.value = 0;
    Howler.masterGain.connect(analizadorEcualizador);
    analizadorEcualizador.connect(salidaSilenciosa);
    salidaSilenciosa.connect(contexto.destination);

    return true;
}

function actualizarEcualizador() {
    analizadorEcualizador.getByteFrequencyData(datosFrecuenciaEcualizador);

    barrasEcualizador.forEach((barra, indice) => {
        const proporcion = indice / cantidadBarrasEcualizador;
        const frecuencia = Math.floor(Math.pow(proporcion, 1.7) * (datosFrecuenciaEcualizador.length - 1));
        const altura = Math.max(3, Math.round((datosFrecuenciaEcualizador[frecuencia] / 255) * 100));
        barra.style.height = `${altura}%`;
    });

    animacionEcualizador = requestAnimationFrame(actualizarEcualizador);
}

function iniciarEcualizador() {
    if (!prepararAnalizadorEcualizador() || animacionEcualizador !== null) {
        return;
    }

    animacionEcualizador = requestAnimationFrame(actualizarEcualizador);
}

function detenerEcualizador() {
    if (animacionEcualizador !== null) {
        cancelAnimationFrame(animacionEcualizador);
        animacionEcualizador = null;
    }

    barrasEcualizador.forEach(barra => {
        barra.style.height = "3px";
    });
}

crearBarrasEcualizador();

// Creamos una función para cargar las canciones del archivo JSON
function cargarCanciones() {
    // Usamos fetch para obtener el archivo JSON
    fetch('canciones.json')
        // Convertimos la respuesta a JSON
        .then(respuesta => respuesta.json())
        // Obtenemos la lista de canciones del JSON
        .then(canciones => {
            // Las mostramos en la consola para verificar que se cargaron correctamente
            console.table(canciones);
            // Asignamos la lista de canciones a la variable global que se encuentra fuera de la función
            listaCanciones = canciones;

            // Creamos una función para poder renderizar las canciones en el HTML
            function mostrarCanciones() {   
                // Recorremos toda la lista de canciones con un forEach
                listaCanciones.forEach(cancion => {
                    //Creamos un elemento "li"
                    const liMusica = document.createElement('li');
                    //Le asignamos la clase "track-item" al elemento "li" para el CSS
                    liMusica.className = 'track-item';
                    //Le asignamos el atributo "data-id" al elemento "li" para poder identificarlo
                    liMusica.setAttribute('data-id', cancion.id);
                    //A la constante li le asignamos el contenido HTML que desearemos que vaya a ir dentro de la etiqueta "li"
                    liMusica.innerHTML = `
                        <div class="track-cover" style="background-image: url('${cancion.caratula}')"></div>
                        <div class="track-info">
                            <span class="track-name">${cancion.cancion}</span>
                            <span class="track-artist">${cancion.artista}</span>
                        </div>
                        <span class="track-duration">${cancion.tiempo}</span>
                    `;
                    //Agregamos el elemento "li" al elemento "ul" que se encuentra en el HTML
                    document.getElementById('trackList').appendChild(liMusica);
                })
            }
            // Llamamos a la función mostrarCanciones para que se ejecute y muestre las canciones en el HTML
            mostrarCanciones();

            //Declaramos una constantes que va a recoger todos los elementos
            const elementos = document.querySelectorAll('.track-item');

            //Hacemos un forEach para todos los elementos para poder añadir un evento "CLick"
            elementos.forEach((elemento, indice) => {
                elemento.addEventListener('click', () => {
                    //llamamos a la funcion reproducir y le pasamos indica
                    reproducir(indice, elemento);
                })
            })
        })
}

//Llamamos a la funcion que carga las funciones
cargarCanciones();

// Creamos una variable global para almacenar la canción actual
let cancionActual = null; // Variable global para almacenar la canción actual

// Creamos una funcion para reproducir la cancion. Recibimos el indice de la cancion y el elemento que se ha clicado
function reproducir(indice, elemento){


    //Intento acceder a una canción de la lista de canciones usando el índice proporcionado. Si el índice es válido, se obtiene la canción correspondiente y se crea un objeto Howl para reproducirla. Luego, se reproduce la canción y se actualiza el nombre de la canción en el HTML.
    indiceActual = indice;    const cancion = listaCanciones[indice];
    const audio = new Howl({
        src: [cancion.archivo],
        onplay: iniciarEcualizador,
        onpause: detenerEcualizador,
        onstop: detenerEcualizador,
        onend: finalizarCancion
    });

    if (cancionActual !== null) {
        cancionActual.stop(); // Detenemos la canción actual si hay una reproduciéndose
    }

    cancionActual = audio; // Asignamos la canción actual a la variable global
    audio.play(); // Reproducimos la canción actual

    songName = document.getElementById("songName");
    artistName = document.getElementById("artistName");
    playerCover = document.getElementById("playerCover");
    playerCover.src = cancion.caratula; // Actualizamos la carátula de la canción en el HTML
    songName.textContent = cancion.cancion; // Actualizamos el nombre de la canción en el HTML
    artistName.textContent = cancion.artista; // Actualizamos el nombre del artista en el HTML


    nowPlayingCover = document.getElementById("nowPlayingCover");
    nowPlayingCover.src = cancion.caratula;
    nowTitle = document.getElementById("nowTitle");
    nowTitle.textContent = cancion.cancion;
    nowArtist = document.getElementById("nowArtist");
    nowArtist.textContent = cancion.artista;
}


function pararMusica() {
    cancionActual.pause(); // Detenemos la canción actual
}

function reanudarMusica() {
    cancionActual.play(); // Reanudamos la canción actual
}

function reanudarParar() {

   console.log("Botón de play/pausa clicado"); // Mostramos un mensaje en la consola para verificar que se ha clicado el botón

    if (cancionActual === null) {
        return; // Si no hay canción actual, no hacemos nada
    }

    if (cancionActual.playing()) {
        pararMusica(); // Si la canción está reproduciéndose, la detenemos
        const playIcon = document.querySelector("#playBtn svg");
        playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        
    } else {
        reanudarMusica(); // Si la canción está detenida, la reanudamos
        const pauseIcon = document.querySelector("#playBtn svg");
        pauseIcon.innerHTML = '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>';
    }
}  

const btnPlayPause = document.getElementById("playBtn");
btnPlayPause.addEventListener("click", reanudarParar); // Añadimos un evento click al botón de play/pausa

// Función que se ejecuta cuando termina una canción
function finalizarCancion() {
    detenerEcualizador();

    if (repetir) {
        reproducir(indiceActual, document.querySelector(`.track-item[data-id="${listaCanciones[indiceActual].id}"]`)); // Si el modo repetir está activo, volvemos a reproducir la misma canción
    }
}

// Función para convertir los segundos en formato "minutos:segundos"
function formatearTiempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const resto = Math.floor(segundos % 60);
    return `${minutos}:${resto < 10 ? "0" : ""}${resto}`;
}

// Cada medio segundo actualizamos la barra de progreso y los tiempos
function actualizarProgreso() {
    if (cancionActual === null || !cancionActual.playing()) {
        return; // Si no hay canción sonando, no hacemos nada
    }

    const duracion = cancionActual.duration();
    const posicion = cancionActual.seek();

    progressRange.value = (posicion / duracion) * 100;
    timeCurrent.textContent = formatearTiempo(posicion);
    timeTotal.textContent = formatearTiempo(duracion);
}

const progressRange = document.getElementById("progressRange");
const timeCurrent = document.getElementById("timeCurrent");
const timeTotal = document.getElementById("timeTotal");
setInterval(actualizarProgreso, 500);

// Al mover la barra de progreso, adelantamos o atrasamos la canción
progressRange.addEventListener("input", () => {
    if (cancionActual === null) {
        return; // Si no hay canción actual, no hacemos nada
    }

    cancionActual.seek((progressRange.value / 100) * cancionActual.duration());
    actualizarProgreso();
});

const volumeRange = document.getElementById("volumeRange");
const volumeValue = document.getElementById("volumeValue");
Howler.volume(volumeRange.value / 100); // Aplicamos el volumen inicial del HTML

// Al mover la barra de volumen, ajustamos el volumen de todas las canciones
volumeRange.addEventListener("input", () => {
    Howler.volume(volumeRange.value / 100);
    volumeValue.textContent = `${volumeRange.value}%`;
});

// Variables globales para los modos aleatorio y repetir
let aleatorio = false;
let repetir = false;

const btnAleatorio = document.getElementById("shuffleBtn");
btnAleatorio.addEventListener("click", () => {
    aleatorio = !aleatorio; // Activamos o desactivamos el modo aleatorio
    btnAleatorio.classList.toggle("is-active", aleatorio);
});

const btnRepetir = document.getElementById("repeatBtn");
btnRepetir.addEventListener("click", () => {
    repetir = !repetir; // Activamos o desactivamos el modo repetir
    btnRepetir.classList.toggle("is-active", repetir);
});

const nextSong = document.getElementById("nextBtn");
nextSong.addEventListener("click", () => {
    if (aleatorio) {
        indiceActual = Math.floor(Math.random() * listaCanciones.length); // Si el modo aleatorio está activo, elegimos una canción al azar
    } else if (indiceActual < listaCanciones.length - 1) {
        indiceActual++;
    }
    reproducir(indiceActual, document.querySelector(`.track-item[data-id="${listaCanciones[indiceActual].id}"]`));
});

const prevSong = document.getElementById("prevBtn");
prevSong.addEventListener("click", () => {
    if (indiceActual > 0) {
        indiceActual--;
    }
    // Llamamos a la función reproducir con el índice actual y el elemento correspondiente
    // El track-item se selecciona usando el atributo data-id que coincide con el id de la canción actual
    // El "${listaCanciones[indiceActual].id}" es una plantilla de cadena que permite insertar el valor del id de la canción actual en la cadena
    reproducir(indiceActual, document.querySelector(`.track-item[data-id="${listaCanciones[indiceActual].id}"]`)); 
});