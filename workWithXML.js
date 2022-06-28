//XML
fetch("interpreter.xml")
  .then(res => res.text())
  .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
  .then(data => {
    // console.log(data);
    const node = data.querySelectorAll('[id="2428180099"]');
    //Beispielaufrufe aus xml datei
    // console.log(node[0]);
    // console.log(node[0].parentNode.parentNode.getAttribute('type'));
    // console.log(node[0].querySelectorAll("tag")[0].getAttribute('k'));

    //durch alle keys durchlaufen und key-values in objekt schreiben für new und old
    const keyvalues = { old: { meta: {}, tags: {} }, new: { meta: {}, tags: {} } };
    //set anlegen mit allen key-werten aus old und new
    const uniqueKeysSet = new Set();
    //mit old beginnen
    //erstmal relevanten meta tags ausschreiben
    keyvalues.old.meta["version"] = node[0].getAttribute("version");
    keyvalues.old.meta["timestamp"] = node[0].getAttribute("timestamp");
    keyvalues.old.meta["user"] = node[0].getAttribute("user");
    keysOld = node[0].querySelectorAll("tag");
    for (let i = 0; i < keysOld.length; i++) {
      keyvalues.old.tags[keysOld[i].getAttribute('k')] = keysOld[i].getAttribute('v');
      uniqueKeysSet.add(keysOld[i].getAttribute('k'));
    }
    //weiter mit new
    //erstmal relevanten meta tags ausschreiben
    keyvalues.new.meta["version"] = node[1].getAttribute("version");
    keyvalues.new.meta["timestamp"] = node[1].getAttribute("timestamp");
    keyvalues.new.meta["user"] = node[1].getAttribute("user");
    keysNew = node[1].querySelectorAll("tag");
    for (let i = 0; i < keysNew.length; i++) {
      keyvalues.new.tags[keysNew[i].getAttribute('k')] = keysNew[i].getAttribute('v');
      uniqueKeysSet.add(keysNew[i].getAttribute('k'));
    }
    console.log(keyvalues);
    //array erzeugen, in dem alle keys alphabetisch geordnet sind
    const uniqueKeysArr = Array.from(uniqueKeysSet).sort();
    // console.log(uniqueKeysArr);

    // tabelle erstellen
    let tableHtml = `
      <table class="table-container">
        <thead>
          <tr>
            <th>Tag</th>
            <th>Old</th>
            <th>New</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>version</td>
            <td>${keyvalues.old.meta["version"]}</td>
            <td>${keyvalues.new.meta["version"]}</td>
          </tr>
          <tr>
            <td>timestamp</td>
            <td>${keyvalues.old.meta["timestamp"]}</td>
            <td>${keyvalues.new.meta["timestamp"]}</td>
          </tr>
          <tr>
            <td>user</td>
            <td>${keyvalues.old.meta["user"]}</td>
            <td>${keyvalues.new.meta["user"]}</td>
          </tr>
    `;

    //diesen array jetzt durchlaufen und in objekt schauen, welcher wert dem key zugeordnet ist (sowohl in new als auch old)
    for (let i = 0; i < uniqueKeysArr.length; i++) {
      //Case 1: Tag deleted in new --> Background color red, change from "undefined" to ""
      //Case 2: Tag created in new --> Background color green, change from "undefined" to ""
      //Case 3: Tag different in new --> Background color yellow
      //Case 4: Tags similar --> Don't display this key-value pair
      let oldTag = keyvalues.old.tags[uniqueKeysArr[i]];
      let newTag = keyvalues.new.tags[uniqueKeysArr[i]];
      let cssClass = "";
      //Case 1
      if (!newTag) {
        cssClass = "red";
        newTag = "";
      }
      //Case 2
      else if (!oldTag) {
        cssClass = "green";
        oldTag = "";
      }
      //Case 3
      else if (oldTag !== newTag) cssClass = "yellow";

      //Case 4
      // else continue;

      tableHtml += `
      <tr class=${cssClass}>
        <td>${uniqueKeysArr[i]}</td>
        <td>${oldTag}</td>
        <td>${newTag}</td>
      </tr>
      `
    }

    tableHtml += `
        </tbody>
      </table>
    `;
    document.querySelector("#tags-comparison").innerHTML = tableHtml;
  }
  )