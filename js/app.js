let listaCanciones = []; // Variable global para almacenar la lista de canciones
let indiceActual = 0; // Variable global para almacenar el índice de la canción actual

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
    const indiceActual = indice; // Actualizamos el índice actual con el índice de la canción que se ha clicado
    const cancion = listaCanciones[indice];
    const audio = new Howl({ src: [cancion.archivo] });

    if (cancionActual !== null) {
        cancionActual.stop(); // Detenemos la canción actual si hay una reproduciéndose
    }

    cancionActual = audio; // Asignamos la canción actual a la variable global
    audio.play(); // Reproducimos la canción actual

    songName = document.getElementById("songName");
    songName.textContent = cancion.cancion; // Actualizamos el nombre de la canción en el HTML

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

const nextSong = document.getElementById("nextBtn");
nextSong.addEventListener("click", () => {
    if (indiceActual < listaCanciones.length - 1) {
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