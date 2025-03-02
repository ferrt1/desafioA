document.addEventListener("DOMContentLoaded", async () => {
    try {
        let response = await fetch("/get_levels");
        let data = await response.json();
        window.niveles = data;  
        iniciarNivel(1);
    } catch (error) {
        console.error("Error al cargar los niveles:", error);
    }
});

let nivelActual = 1;
let cantidadErrores = 0;
let pistaIndex = 0;

function iniciarNivel(nivel) {
    nivelActual = nivel;
    let data = niveles[nivel];

    document.getElementById("nivel-titulo").innerText = data.titulo;
    let itemsContainer = document.getElementById("items-container");
    let boxContainer = document.getElementById("box-container");
    
    const hintBox = document.getElementById("hint-box");
    hintBox.classList.remove("show");

    cantidadErrores = 0;
    document.getElementById("error-message").innerText = ""; 

    itemsContainer.innerHTML = "";
    boxContainer.innerHTML = "";
    
    if(nivelActual === 1){
        document.getElementById("back-level").classList.add("hidden");
    }

    data.items.sort(() => Math.random() - 0.5);
    
    data.items.forEach(item => {
        let div = document.createElement("div");
        div.classList.add("item");
        div.id = item.id;
        div.innerText = item.texto;
        div.setAttribute("draggable", "true");
        itemsContainer.appendChild(div);

        div.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text", e.target.id);
        });
    });

    data.boxes.forEach(box => {
        let wrapper = document.createElement("div");
        wrapper.classList.add("box-wrapper");

        let titulo = document.createElement("h3");
        titulo.classList.add("box-title");
        titulo.innerText = box.texto;
        wrapper.appendChild(titulo);

        let div = document.createElement("div");
        div.classList.add("box");
        div.id = box.id;
        wrapper.appendChild(div);

        boxContainer.appendChild(wrapper);

        div.addEventListener("dragover", (e) => e.preventDefault());

        div.addEventListener("drop", (e) => {
            e.preventDefault();
            let id = e.dataTransfer.getData("text");
            let draggedElement = document.getElementById(id);
        
            let categoria = data.items.find(item => item.id === id)?.categoria;
            if (categoria === box.id) {
                div.appendChild(draggedElement);
                draggedElement.style.background = "#b8daba";
                draggedElement.style.border = "1px solid #70b578";
                draggedElement.style.color = "#103b14"; 
                draggedElement.setAttribute("draggable", "false");
                verificarNivelCompletado();
            } else {
                cantidadErrores++;
                document.getElementById("error-message").innerText = `Errores: ${cantidadErrores}`;
                document.body.classList.add("error");
                document.body.classList.add("shake");
                document.getElementById("error-message").style.color = "black";
                setTimeout(() => {
                    document.body.classList.remove("shake");
                    document.body.classList.remove("error");
                    document.getElementById("error-message").style.color = "#d61b1b";
                }, 1000); 
            }
        });
    });

    document.getElementById("next-level").classList.add("hidden");
}

function mostrarFelicitaciones() {
    const congratulations = document.getElementById("congratulations");
    congratulations.classList.add("show");

    const jsConfetti = new JSConfetti();

    function lanzarConfetti() {
        jsConfetti.addConfetti({
            confettiRadius: 6,
            confettiNumber: 500,
            colors: ["#ff0", "#0f0", "#00f", "#f00"],
        });
    }

    lanzarConfetti();
    let intervalo = setInterval(lanzarConfetti, 1500); 

    setTimeout(() => {
        clearInterval(intervalo);
    }, 6000);

    document.getElementById("back-to-home").addEventListener("click", () => {
        location.reload();
    });
}

function verificarNivelCompletado() {
    let totalItems = document.querySelectorAll(".item").length;
    let itemsClasificados = document.querySelectorAll(".box .item").length;

    if (itemsClasificados === totalItems) {
        document.getElementById("next-level").classList.remove("hidden");
        if(nivelActual > 1){
            document.getElementById("back-level").classList.remove("hidden");
        }
    }
}

document.getElementById("back-level").addEventListener("click", () => {
    let nivelAnterior = nivelActual - 1;
    if (niveles[nivelAnterior]) {
        iniciarNivel(nivelAnterior);
    } 
});

document.getElementById("next-level").addEventListener("click", () => {
    let siguienteNivel = nivelActual + 1;
    if (niveles[siguienteNivel]) {
        iniciarNivel(siguienteNivel);
    } else {
        mostrarFelicitaciones();
    }
});

document.getElementById("hint-button").addEventListener("click", () => {
    const hintBox = document.getElementById("hint-box");
    const hintText = document.getElementById("hint-text");
    const data = niveles[nivelActual];

    if (data.hints) {
        if (pistaIndex < data.hints.length) {
            hintText.textContent = data.hints[pistaIndex++];
            hintBox.classList.add("show"); 
        } else {
            pistaIndex = 0; 
            hintText.textContent = data.hints[pistaIndex++];
            hintBox.classList.add("show"); 
        }
    }
});

document.getElementById("close-hint").addEventListener("click", () => {
    const hintBox = document.getElementById("hint-box");
    hintBox.classList.remove("show"); 
});
