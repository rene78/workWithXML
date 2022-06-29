//XML
fetch("interpreter.xml")
  .then(res => res.text())
  .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
  .then(data => {
    // console.log(data);
    const node = data.querySelectorAll('[id="1072310202"]');
    //Beispielaufrufe aus xml datei
    // console.log(node[0]);
    // console.log(node[0].parentNode.parentNode.getAttribute('type'));
    // console.log(node[0].querySelectorAll("tag")[0].getAttribute('k'));

    //First check what type of action has been performed on the element (i.e. create, modify, delete)
    let action = node[0].parentNode.parentNode.getAttribute('type');//Check if action is "modify", "delete" or "null"
    if (!action) action = "create";//The xml data structure is different for "create" nodes, thus action will be "null" in the line above
    console.log(action);

    //durch alle keys durchlaufen und key-values in objekt schreiben für new und old

  }
  )