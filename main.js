const initRender = () => {
  let $ = go.GraphObject.make;
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
        let diagram = node.diagram;
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
        let shape = node.findObject("SHAPE");
        shape.stroke = "black";
      },
      mouseLeave: (e, node) => {
        let shape = node.findObject("SHAPE");
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
    $(go.TextBlock, { margin: 10, font: "bold 18px Verdana" }, new go.Binding("text", "t"))
    );
  myDiagram.linkTemplate =
    $(go.Link,
      { routing: go.Link.AvoidsNodes, corner: 20, curve: go.Link.JumpOver },
      $(go.Shape,
        new go.Binding("strokeWidth", "isHighlighted", (h) => h ? 5 : 3).ofObject(),
        new go.Binding("stroke", "isHighlighted", (h) => h ? "red" : "black").ofObject(),
        { strokeWidth: 5 }
      ),
      $(go.Shape, { toArrow: "Standard", fill: "black", stroke: "black", strokeWidth: 5 }),
    );
  myDiagram.addDiagramListener("ObjectSingleClicked",
    function (e) {
      let part = e.subject.part;
      if (!(part instanceof go.Link)) focusNode(part.data.key);
    });
  return myDiagram;
}

const setEventListeners = () => {
  getDOMElement("#boton").addEventListener("click", () => {
    let selected = getDOMElement("#programas").value;
    if(selected != "none"){
      console.log(selected);
      sentRequest(`https://pruebabd-7538a-default-rtdb.firebaseio.com/${selected}.json`, buildModel);
      getId(selected);
    } else {
      getDOMElement("#programas").classList.add("shake");
      getDOMElement("#programas").classList.add("animated");
    }
  });
  getDOMElement("#find").addEventListener("input", (x) => {
    findNodes();
  });
}

const removeDuplicates = (arr) => {
  let unique = [];
  let newList = [];
  arr.forEach((element) => {
    if (!unique.includes(element.key)){
      newList.push(element);
    }
    unique.push(element.key);
  });
  return newList;
}

const setModel = (graph) => {
  let adjacencies = [];
  let nodes = removeDuplicates(graph.map(n => { return { t: `${n.nombre}`, key: n.id, color: "lightgreen" } }));
  for (let n of graph) {
    if ('requisitos' in n) {
      for (let c of n.requisitos) {
        adjacencies.push({ from: c, to: n.id });
      }
    }
  }
  myDiagram.model = new go.GraphLinksModel(nodes, adjacencies);
}

const focusNode = (id) => {
  let node = graph.find((x) => x.id === id);
  getDOMElement("#find").value = "";
  getDOMElement("#texto").textContent = `Código: ${node.id}, Créditos: ${node.creditos} (${node.nombre})`;
}

const findNodes = () => {
  let nombre = getDOMElement("#find").value;
  myDiagram.clearHighlighteds();
  myDiagram.clearSelection();
  if (nombre != "") {
    let encontrados = graph.filter((x) => x.nombre.toLowerCase().includes(nombre.toLowerCase()));
    for (let encontrado of encontrados) {
      myDiagram.findNodeForKey(encontrado.id).isHighlighted = true;
    }
  }
}

const changeNames = () => {
  showPopUp();
  setEventListeners();
  sentRequest('https://bdethos-default-rtdb.firebaseio.com/programs.json', (fullNames) => {
    const selectElement = getDOMElement("#programas");
    const nombres = Object.keys(fullNames);
    const orderedNames = Object.values(fullNames).sort(orderByNames);
    orderedNames.forEach((nombre) => {
      const optionElement = document.createElement("option");
      optionElement.text = nombre;
      optionElement.value = nombres.find((x) => fullNames[x] === nombre);
      selectElement.add(optionElement);
    });
    getDOMElement("#form").classList.add("is-show");
    initRender();
  });
}

const orderByNames = (a, b) => {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

const sentRequest = (url, callback) => {
  axios.get(url).then(response => {
    callback(response.data);
  }).catch(error => {
    console.log(error);
  });
}

const buildModel = (data) => {
  graph = Object.values(data);
  getDOMElement("#divDiagram").classList.add("is-show");
  setModel(graph);
}

const getId = async (programa) => {
  let data = {};
  data.ID = navigator.userAgent;
  data.programa = programa;
  data.fecha = new Date().toLocaleString();
  axios.post("https://datacovidcaldas.firebaseio.com/users.json", data, {headers: {"Content-Type": "application/json"}})
};

const showPopUp = () => {
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
}

const getDOMElement = (id) => {
  return document.querySelector(id);
}

let myDiagram = undefined;
let graph = undefined;
changeNames();
