const initRender = () => {
  var $ = go.GraphObject.make;
  myDiagram = $(go.Diagram,
    "myDiagramDiv",
    {
      layout: $(go.TreeLayout, { layerSpacing: 300, rowSpacing: 10 }),
      initialAutoScale: go.Diagram.Uniform
    }
  );

  myDiagram.isModified = false;
  myDiagram.isModelReadOnly = true;
  myDiagram.isReadOnly = true;

  myDiagram.nodeTemplate =
    $(go.Node, "Auto", {
      click: (e, node) => {
        var diagram = node.diagram;
        diagram.clearSelection();
        diagram.startTransaction("highlight");
        diagram.clearHighlighteds();
        node.findLinksOutOf().each((l) => l.isSelected = true);
        node.findNodesOutOf().each((n) => n.isSelected = true);
        node.findLinksInto().each((l) => l.isHighlighted = true);
        node.findNodesInto().each((n) => n.isHighlighted = true);
        diagram.commitTransaction("highlight");
      },
      mouseEnter: (e, node) => {
        var shape = node.findObject("SHAPE");
        shape.stroke = "white";
      },
      mouseLeave: (e, node) => {
        var shape = node.findObject("SHAPE");
        shape.stroke = null;
      },
    },
      $(go.Shape, "RoundedRectangle",
        { strokeWidth: 3, stroke: null, name: "SHAPE" },
        new go.Binding("fill", "isSelected", (sel) => sel ? "cyan" : "lightgreen").ofObject(),
        new go.Binding("fill", "isHighlighted", (h) => h ? "orange" : "lightgreen").ofObject(),
        new go.Binding("strokeWidth", "isHighlighted", (h) => h ? 5 : 3).ofObject(),
        new go.Binding("stroke", "isHighlighted", (h) => h ? "red" : "lightgreen").ofObject()
      ),
      $(go.TextBlock, { margin: 10, font: "bold 18px Verdana" },
        new go.Binding("text", "t"))
    );

  myDiagram.linkTemplate =
    $(go.Link,
      { routing: go.Link.AvoidsNodes, corner: 20, curve: go.Link.JumpOver },
      $(go.Shape,
        new go.Binding("strokeWidth", "isHighlighted", (h) => h ? 5 : 3).ofObject(),
        new go.Binding("stroke", "isHighlighted", (h) => h ? "red" : "white").ofObject(),
        { strokeWidth: 5 }
      ),
      $(go.Shape, { toArrow: "Standard", fill: "white", stroke: "white", strokeWidth: 5 }),
    );

  myDiagram.addDiagramListener("ObjectSingleClicked",
    function (e) {
      var part = e.subject.part;
      if (!(part instanceof go.Link)) focusNode(part.data.key);
    });
  return myDiagram;
}

const removeDuplicates = (arr) => {
  let unique = [];
  let newList = [];
  for(let element of arr){
    if (!unique.includes(element.key)){
      newList.push(element);
    }
    unique.push(element.key);
  }
  return newList;
}

const setModel = (grafo) => {
  let adyacencias = [];
  let nodos = removeDuplicates(grafo.map(n => { return { t: `${n.nombre}`, key: n.id, color: "lightgreen" } }));

  for (let n of grafo) {
    if ('requisitos' in n) {
      for (let c of n.requisitos) {
        adyacencias.push({ from: c, to: n.id });
      }
    }
  }
  console.log(adyacencias);
  myDiagram.model = new go.GraphLinksModel(nodos, adyacencias);
}

const focusNode = (id) => {
  let node = grafo.find((x) => x.id === id);
  document.querySelector("#find").value = "";
  document.querySelector("#texto").textContent = `C??digo: ${node.id}, Cr??ditos: ${node.creditos} (${node.nombre})`;
}

const findNodes = () => {
  let nombre = document.querySelector("#find").value;
  myDiagram.clearHighlighteds();
  myDiagram.clearSelection();
  if (nombre != "") {
    let encontrados = grafo.filter((x) => x.nombre.toLowerCase().includes(nombre.toLowerCase()));
    for (let encontrado of encontrados) {
      myDiagram.findNodeForKey(encontrado.id).isHighlighted = true;
    }
  }
}

const getRequest = (url) => {
  axios.get(url).then(response => {
    grafo = Object.values(response.data);
    console.log(grafo);
    document.querySelector("#divDiagram").classList.add("is-show");
    setModel(grafo);
  }).catch(error => {
    console.log(error);
  });
}

const getRequest2 = (url) => {
  axios.get(url).then(response => {
    let nombres = Object.values(response.data);
    let x = document.querySelector("#programas");
    let option = document.createElement("option");
    document.querySelector("#form").classList.add("is-show");
    console.log(nombres);
    for (let nombre of nombres) {
      option = document.createElement("option");
      option.text = changeNames(nombre);
      option.value = nombre;
      x.add(option);
    }
  }).catch(error => {
    console.log(error);
  });
}

const changeNames = (internalName) => {
  const names = {
    "ingenieria-de-sistemas-y-computacion": "Ingenier??a de sistemas y computaci??n",
    "ingenieria-de-alimentos": "Ingenier??a de alimentos",
    "ingenieria-en-informatica": "Ingenier??a en informatica",
    "enfermeria": "Enfermer??a",
    "medicina": "Medicina",
    "licenciatura-en-educacion-fisica-recreacion-y-deporte": "Licenciatura en educaci??n f??sica",
    "pregrado-trabajo-social": "Trabajo social",
    "pregrado-sociologia": "Sociolog??a",
    "licenciatura-en-ciencias-sociales": "Licenciatura en ciencias sociales",
    "historia": "Historia",
    "pregrado-desarrollo-familiar": "Desarrollo familiar",
    "pregrado-programa-de-derecho": "Derecho",
    "pregrado-antropologia": "Antropolog??a",
    "pregrado-administracion-financiera": "Administraci??n financiera",
    "licenciatura-en-ciencias-naturales": "Licenciatura en ciencias naturales",
    "programa-de-geologia": "Geolog??a",
    "biologia": "Biolog??a",
    "medicina-veterinaria-y-zootecnia": "Medicina veterinaria y zootecnia",
    "ingenieria-agronomica": "Ingenier??a agronomica",
    "administracion-de-empresas-agropecuarias": "Administraci??n de empresas agropecuarias",
    "licenciatura-en-musica": "Licenciatura en m??sica",
    "maestro-en-artes-plasticas": "Maestro en artes plasticas",
    "profesional-en-filosofia": "Profesional en filosof??a",
    "maestro-en-musica": "Maestro en m??sica",
    "diseno-visual": "Dise??o visual",
    "licenciatura-en-lenguas-modernas": "Licenciatura en lenguas modernas",
    "licenciatura-en-filosofia": "Licenciatura en filosof??a",
    "licenciatura-en-artes-escenicas": "Licenciatura en artes esc??nicas"
  }
  return names[internalName];
}

let getId = async (programa) => {
  let data = {};
  data.ID = navigator.userAgent;
  data.programa = programa;
  data.fecha = new Date().toLocaleString();
  axios.post("https://datacovidcaldas.firebaseio.com/users.json", data, {headers: {"Content-Type": "application/json"}})
};

document.querySelector("#boton").addEventListener("click", () => {
  let seleccionado = document.querySelector("#programas").value;
  getId(seleccionado);
  if(seleccionado == "none"){
    document.querySelector("#programas").classList.add("shake");
    document.querySelector("#programas").classList.add("animated");
  }
  getRequest(`https://pruebabd-7538a-default-rtdb.firebaseio.com/${seleccionado}.json`);
});

document.querySelector("#find").addEventListener("input", (x) => {
  findNodes();
});

let myDiagram = undefined;
let grafo = undefined;
initRender();
getRequest2('https://pruebabd-7538a-default-rtdb.firebaseio.com/nombres-programas.json');


if (isMobile.apple.phone || isMobile.android.phone) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = "<h3>Para un mejor uso se recomienda usar este sitio web desde un computador o una tablet.</h3>";
  swal({
    title: "Espera",
    content: wrapper,
    icon: "warning",
    dangerMode: true,
  });
}