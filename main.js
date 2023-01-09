/*
010010100101001001010010010010010010010010101001011
0             ¡HELLO  #####  WORLD!               0
1                    #.-.-.#                      1
1       _          <=#.O|0.#=>                    0
0      |C|           #.===.#                      1
0      |D|            #####                       0
1      |C|             @@@                        1
1      |B|        $$$$$-|-$$$$$                   1
0       -        $$$  @-|-@  $$$          _       0
0                $$   @-|-@   $$         |C|      1
1               &&&   @-|-@   &&&        |D|      0
1              /&&&  _@-|-@_  &&&\       |C|      0
1               \|/ $-/$-$\-$ \|/        |B|      1
0                  $-/$   $\-$            -       0
0                 $-/$     $\-$                   1
0              %%%%%%%     %%%%%%%                0
0             %%%%%%%       %%%%%%%%              1
002232013010010101000101011101010010010010100100100
*/

let initRender = ()=>{
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
	$(go.Node, "Auto",{
			click: (e, node)=> {
				var diagram = node.diagram;
				diagram.clearSelection();
				diagram.startTransaction("highlight");
				diagram.clearHighlighteds();
				node.findLinksOutOf().each((l)=> l.isSelected = true);
				node.findNodesOutOf().each((n)=> n.isSelected = true);
				node.findLinksInto().each((l)=> l.isHighlighted = true);
				node.findNodesInto().each((n)=> n.isHighlighted = true);
				diagram.commitTransaction("highlight");
			},
   			mouseEnter: (e, node)=> {
				var shape = node.findObject("SHAPE");
				shape.stroke = "white";
			},
			mouseLeave: (e, node)=> {
				var shape = node.findObject("SHAPE");
				shape.stroke = null;
			},
		},
		$(go.Shape, "RoundedRectangle",
			{ strokeWidth: 3, stroke: null, name: "SHAPE" },
			new go.Binding("fill", "isSelected", (sel)=> sel ? "cyan" : "lightgreen").ofObject(),
			new go.Binding("fill", "isHighlighted", (h)=> h ? "orange" : "lightgreen").ofObject(),
			new go.Binding("strokeWidth", "isHighlighted", (h)=> h ? 5 : 3).ofObject(),
			new go.Binding("stroke", "isHighlighted", (h)=> h ? "red" : "lightgreen").ofObject()
		),
		$(go.TextBlock,{ margin: 10, font: "bold 18px Verdana" },
		new go.Binding("text", "t"))
	);

	myDiagram.linkTemplate =
		$(go.Link,
			{ routing: go.Link.AvoidsNodes ,corner: 20,curve: go.Link.JumpOver},
			$(go.Shape,
				new go.Binding("strokeWidth", "isHighlighted", (h)=> h ? 5 : 3).ofObject(),
				new go.Binding("stroke", "isHighlighted",(h)=> h ? "red" : "white").ofObject(),
				{ strokeWidth: 5 }
			),
			$(go.Shape, { toArrow: "Standard",fill: "white",stroke:"white", strokeWidth:5  }),
		);

	myDiagram.addDiagramListener("ObjectSingleClicked",
		function(e) {
		var part = e.subject.part;
		if (!(part instanceof go.Link)) focusNode(part.data.key);
	});
	return myDiagram;
}

let setModel = (grafo)=>{
	let adyacencias = [];
	let nodos = grafo.map(n => {return {t: `${n.nombre}`,key: n.id, color: "lightgreen"}})
	for(let n of grafo){
        if('requisitos' in n){
            for(let c of n.requisitos){
                adyacencias.push({from: c, to: n.id});
            }
        }
	}
	console.log(adyacencias);
	myDiagram.model = new go.GraphLinksModel(nodos,adyacencias);
}

let focusNode = (id)=> {
	let node = grafo.find((x)=> x.id === id);
	document.querySelector("#find").value = "";
	document.querySelector("#texto").textContent  = `${node.nombre}, Código: ${node.id}, Créditos: ${node.creditos}`;
}

let findNodes = () => {
	let nombre = document.querySelector("#find").value;
	myDiagram.clearHighlighteds();
	myDiagram.clearSelection();
	if(nombre != ""){
		let encontrados = grafo.filter((x)=> x.nombre.toLowerCase().includes(nombre.toLowerCase()));
		for(let encontrado of encontrados){
			myDiagram.findNodeForKey(encontrado.id).isHighlighted = true;
		}
	}
}

let getRequest = (url)=>{
	axios.get(url).then(response => {
		grafo = Object.values(response.data);
		console.log(grafo);
        setModel(grafo);
	}).catch(error => {
		console.log(error);
	});
}

let getRequest2 = (url)=>{
	axios.get(url).then(response => {
		let nombres = Object.values(response.data);
		console.log(nombres);
		let x = document.querySelector("#programas");
		let option = document.createElement("option");
		for(let nombre of nombres){
			option = document.createElement("option");
			option.text = changeNames(nombre);
			option.value = nombre;
			x.add(option);
		}
	}).catch(error => {
		console.log(error);
	});
}

let changeNames = (internalName) => {
	let names = {
		"ingenieria-de-sistemas-y-computacion": "Ingeniería de sistemas y computación",
		"ingenieria-de-alimentos": "Ingeniería de alimentos",
		"ingenieria-en-informatica": "Ingeniería en informatica",
		"enfermeria": "Enfermería",
		"medicina": "Medicina",
		"licenciatura-en-educacion-fisica-recreacion-y-deporte": "Licenciatura en educación física",
		"pregrado-trabajo-social": "Trabajo social",
		"pregrado-sociologia": "Sociología",
		"licenciatura-en-ciencias-sociales": "Licenciatura en ciencias sociales",
		"historia": "Historia",
		"pregrado-desarrollo-familiar": "Desarrollo familiar",
		"pregrado-programa-de-derecho": "Derecho",
		"pregrado-antropologia": "Antropología",
		"pregrado-administracion-financiera": "Administración financiera",
		"licenciatura-en-ciencias-naturales": "Licenciatura en ciencias naturales",
		"programa-de-geologia": "Geología",
		"biologia": "Biología",
		"medicina-veterinaria-y-zootecnia": "Medicina veterinaria y zootecnia",
		"ingenieria-agronomica": "Ingeniería agronomica",
		"administracion-de-empresas-agropecuarias": "Administración de empresas agropecuarias",
		"licenciatura-en-musica": "Licenciatura en música",
		"maestro-en-artes-plasticas": "Maestro en artes plasticas",
		"profesional-en-filosofia": "Profesional en filosofía",
		"maestro-en-musica": "Maestro en música",
		"diseno-visual": "Diseño visual",
		"licenciatura-en-lenguas-modernas": "Licenciatura en lenguas modernas",
		"licenciatura-en-filosofia": "Licenciatura en filosofía",
		"licenciatura-en-artes-escenicas": "Licenciatura en artes escénicas"
	}
	return names[internalName];
}

document.querySelector("#boton").addEventListener("click", () => {
    let seleccionado = document.querySelector("#programas").value;
	getRequest(`https://pruebabd-7538a-default-rtdb.firebaseio.com/${seleccionado}.json`);
});

document.querySelector("#find").addEventListener("input", (x) => {
	findNodes();
});

let myDiagram = undefined;
let grafo = undefined;
initRender();
getRequest2('https://pruebabd-7538a-default-rtdb.firebaseio.com/nombres-programas.json');


/*
// Modelo inicial del grafo como ejemplo
myDiagram.model = new go.GraphLinksModel(
	[
		{ t:"NOT", key:"Alpha", color: "lightblue" },
		{ t:"AND", key: "Beta", color: "orange" },
		{ t:"OR", key: "Gamma", color: "lightgreen" },
		{ t:"XOR", key: "Delta", color: "pink" }
	],
	[
		{ from: "Alpha", to: "Beta", text: "2" },
		{ from: "Beta", to: "Alpha", text: "3" },
		{ from: "Alpha", to: "Gamma", text: "5" },
		{ from: "Beta", to: "Beta", text: "10" },
		{ from: "Gamma", to: "Delta", text: "20" },
		{ from: "Delta", to: "Alpha", text: "50" }
	]);
*/
