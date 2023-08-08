"use strict"

// INDEXEDDB : Es una api que maneja una base de datos indexada no relacional
// MongoDB por ejemplo trabaja con la api IndexedDB

/* La api IndexedDBB:
    - almacena informacion en el navegador de forma similar a LocalStorage (al igual que este se muestra en consola > aplicacion)
    - es orientada a objetos
    - es asincrona y no debemos recargar la pagina para obtener los resultados
    - trabaja con eventos del DOM
*/

const peticionADBB = indexedDB.open("jorgedbb",2.2); // open () recibe el nombre de la base y el versionado y retorna la SOLICITUD a la dbb
// click derecho en console > aplication > IndexedDB > Actualizar IndexDBB

peticionADBB.addEventListener("upgradeneeded",()=>{
    console.log("La DBB no existia, pero se creo correctamente")
    const dbb = peticionADBB.result // obtenemos la dbb en si
    dbb.createObjectStore("contenedor",{
        // creamos un contenedor de objetos dentro de la dbb con nombre "contenedor" similar a una tabla de dbb 
        // con una clave autoincrementable
        autoIncrement : false
    })
})

peticionADBB.addEventListener("success",()=>{
    console.log("DBB existente abierta correctamente")
    leer(); // leer sirve para el ejercicio final
})

peticionADBB.addEventListener("error",()=>{
    console.log("Error al abrir la DB")
})

const escribir = (objetoAAñadir) => { // funcion que recibe un objeto y lo agrega a el contenedor de objetos "contenedor"
    const dbb = peticionADBB.result // abrimos el resultado de la solicitud declarado en la linea 13
    const transaccion = dbb.transaction("contenedor","readwrite") // creamos una transaccion 
    // los argumentos son el nombre del contenedor de objetos y el modo (readwrite,readonly) 
    const almacenobjetivo = transaccion.objectStore("contenedor") // con el metodo objectStore concedemos el permiso final
    almacenobjetivo.add(objetoAAñadir,increment_id); // ya podemos añadir el objeto al contenedor
    transaccion.addEventListener("complete",()=> showMsg("object added correctly")) // al completarse nos muestra un msj
}

// la estructura en el contenedor queda asi:
// #(indice) | clave | valor
// el indice no tiene nada que ver con la clave, indice es la posicion dentro de la bdd de esa entrada y la clave es su identificador unico

// estas funciones las ejecutamos en consola, agregamos varias entradas al registro y probamos leerlas: 

const leer = () => {
    flexres.innerHTML = ``;
    const dbb = peticionADBB.result // resultado de la solicitud declarado en la linea 13
    const transaccion = dbb.transaction("contenedor","readonly") // creamos una transaccion al contenedor en modo solo lectura
    const almacenobjetivo = transaccion.objectStore("contenedor") // permiso final
    const cursor = almacenobjetivo.openCursor(); // el objeto Cursor es un elemento que nos permite leer
    cursor.addEventListener("success",()=>{
        // console.log(cursor) // cuando la creacion es exitosa, mostramos el resultado, un IDBRequest con propiedades como result.
        if(cursor.result){ // si el resultado de la peticion existe (en el else se ve el motivo de esto)
        // console.log(cursor.result.value); // esto nos devolveria solamente el primer elemento del contenedor, para que sigue leyendo hay que usar continue
        crearEntrada(cursor.result.value)
        cursor.result.continue() // mueve el cursor al siguiente elemento
        } else showMsg("all data showed correctly")
        // cursor siempre se va a ejecutar una vez en null (al final del recorrido del contenedor) capturamos ese caso con el else, y lo aprovechamos para mostrar un mensaje de confirmacion
    })
}

// ASIMISMO DEBEMOS REPETIR LO ANTERIOR PARA USAR PUT() Y DELETE() Y REEMPLAZAMOS EN CADA CASO. EN TODOS SE USA TRANSACTION

// las primeras lineas se repiten en ambas funciones, asi que podemos resumirlo con una funcion que aplicaremos para las funciones put y delete que nos faltan

const obtenerDatosDeDBB = modo => { // funcion auxiliar
    const dbb = peticionADBB.result 
    const transaccion = dbb.transaction("contenedor",modo) 
    const almacenobjetivo = transaccion.objectStore("contenedor") 
    return [almacenobjetivo, transaccion] 
}

const modificar = (dato,clave) => {
    let IDBres = obtenerDatosDeDBB("readwrite")
    IDBres[0].put(dato,clave) // el objeto almacenamientoobjetivo llama al metodo put()
    // put (`datos nuevos`,`clave de la entrada a modificar`)
    IDBres[1].addEventListener("complete",()=> showMsg(`the entry with key=${clave} has been replaced succesfully`))
    // el objeto transaccion al completarse la misma nos imprime un msj de exito
}

const eliminar = (clave) => {
    let IBDres = obtenerDatosDeDBB("readwrite");
    IBDres[0].delete(clave); // elimina el valor dentro de la clave pasada por parametros
    IBDres[1].addEventListener("complete",()=> showMsg(`the entry with key=${clave} has been deleted successfully`))
}

// ESCRIBIR: TRANSACTION() OBJECTSTORE() ADD()
// LEER: TRANSACTION() OBJECTSTORE() OPENCURSOR() CONTINUE()
// MODIFICAR: TRANSACTION() OBJECTSTORE() PUT()
// ELIMINAR: TRANSTACTION() OBJECTSTORE() DELETE()


// INDEXED DB CON DRAG&DROP borramos la dbb primero, la reutilizamos asi como las funciones leer escribir modificar eliminar
 
// seleccion de elementos del DOM y variables auxiliares
const input_nombre = document.querySelector(".name-input");
const enviar = document.querySelector(".name-send");
const flexres = document.querySelector(".flex-dbbdata")
const helper = document.querySelector(".helper")
const message = document.querySelector(".message")
const texto = document.querySelector(".texto")
var valorEntrada = "";
var increment_id = 0; // variable que asigna claves unicas a las entradas

// contiene solo espacios?
function containsOnlySpaces(chain){
    let pairchain = "";
    for(let i=0;i<chain.length;i++) pairchain += " ";
    if(chain.includes(pairchain)) return true;
    else return false; 
}

// crea la representacion de las entradas de la DBB en el DOM y agrega los eventos a sus botones.
// investigar sobre la delegacion de Eventos para no crear tantos eventos como entradas.
function crearEntrada(valor){
    let entry = document.createElement("DIV");
    entry.classList.add("entry")
    flexres.appendChild(entry);
    entry.style.animationTimingFunction = "cubic-bezier(.03,.91,.12,1.01)"
    let mostrarvalor = document.createElement("INPUT")
    mostrarvalor.classList.add("entry-name");
    mostrarvalor.setAttribute("value",valor.nombre)
    mostrarvalor.setAttribute("spellcheck",false) // esto elimina la linea roja de las palabras con errores ortograficos
    entry.appendChild(mostrarvalor)
    mostrarvalor.setAttribute("key",increment_id);
    increment_id++
    let savebutton = document.createElement("DIV")
    savebutton.classList.add("entry-save");
    savebutton.classList.add("toolbutton")
    savebutton.classList.add("notavailable");
    savebutton.textContent = "SAVE"
    entry.appendChild(savebutton)
    let deletebutton = document.createElement("DIV")
    deletebutton.classList.add("entry-delete");
    deletebutton.classList.add("toolbutton")
    deletebutton.textContent = "DELETE"
    entry.appendChild(deletebutton)
    var inputmodif;
    entry.style.animationName = "aparecer"
    mostrarvalor.addEventListener("input",(inputevent)=>{
        inputevent.preventDefault();
        savebutton.classList.remove("notavailable")
        inputmodif = inputevent.target.value;
        mostrarvalor.setAttribute("value",inputevent.target.value)

    })
    savebutton.addEventListener("click",(clickevent)=>{
        clickevent.preventDefault();
        if(inputmodif.length != 0 && !containsOnlySpaces(inputmodif)){
            modificar({nombre: `${inputmodif.trim()}`},parseInt(mostrarvalor.getAttribute("key")))
            savebutton.classList.add("notavailable")
        }
    }) 
    deletebutton.addEventListener("click",(clickevent)=>{
        clickevent.preventDefault();
        eliminar(parseInt(mostrarvalor.getAttribute("key")))
        entry.style.animationTimingFunction = "cubic-bezier(.68,.18,.34,1.01)"
        entry.style.animationName = "desaparecer";
        setTimeout(()=>{flexres.removeChild(entry)},400)
    })
}

function dissapear(message,text){
    message.style.opacity = "0"
    text.style.opacity = "0"
}

// funcion que crea una animacion para un elemento y la reproduce al momento (sin usar el archivo CSS)
function showMsg(chain){
    dissapear(message,texto)
    texto.textContent = chain.toUpperCase();
    const effectAnimation = [{transform : `scale(.5) translate(-30px,20px)`}, {transform: `scale(1)`}] // el primer objeto en el array representa el "from" y el segundo el "to"
    const durationAnimation = {duration: 350, iterations: 1} // opciones como la duracion, iteraciones, timingfunction etc
    message.animate(effectAnimation,durationAnimation) // se aplica la animacion y se ejecuta
    texto.animate(effectAnimation,durationAnimation) // lo mismo
    let effectDissapear = [{opacity : `1`, animationTimingFunction : `cubic-bezier(1,0,1,0.15)`},{opacity : `0`}]
    let durationDissapear = {duration : 5000, iterations: 1}
    message.animate(effectDissapear,durationDissapear)
    texto.animate(effectDissapear,durationDissapear)
}

function mainFunction(){
    (input_nombre.value != "" && !containsOnlySpaces(input_nombre.value)) 
    ?   (valorEntrada = {nombre: `${input_nombre.value.trim()}`}, 
        escribir(valorEntrada),
        crearEntrada(valorEntrada))            
    : alert("(!) Can't send a empty value")
    input_nombre.value = "";
}

// eventos para insertar nombre 
enviar.addEventListener("click",(event)=>{
    event.preventDefault()
    saveChanges()
    mainFunction()
})
input_nombre.addEventListener("keypress", (event) => {
    if(event.key=="Enter") {
        saveChanges()
        mainFunction()
    }
});

addEventListener("scroll",()=>{ 
    // helper.style.top = `${visualViewport.height - window.scrollY}px`  este efecto queda re flashero
    helper.style.top = `${(visualViewport.height-67) + window.scrollY}px` 
    // usando el tamaño del viewport y el valor de scroll mas el evento scroll posicionamos el ayudante siempre debajo en la pantalla
})

function saveChanges(){
    let elements = document.getElementsByClassName("entry-save")
    let notsavedelements = [];
    for(let i=0;i<elements.length;i++){
        if(!elements[i].classList.contains("notavailable")) notsavedelements.push(elements[i])  
    }
    if(notsavedelements.length>0){
        if(confirm("(!) Desea guardar los cambios?")){
            for(let i=0;i<notsavedelements.length;i++){
                modificar({nombre: `${notsavedelements[i].previousElementSibling.getAttribute("value")}`},parseInt(notsavedelements[i].previousElementSibling.getAttribute("key")))
                notsavedelements[i].classList.add("notavailable")
            }
            setTimeout(()=>{ showMsg(`all changes saved`) },2500)
        }
        //
        else {
            flexres.innerHTML = "";
            setTimeout(()=>{ leer() },100)
            setTimeout(()=>{ showMsg(`changes in fields not saved`) },2500)
        }
    }
}











