//XML
fetch("interpreter.xml")
  .then(res => res.text())
  .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
  .then(data => {
    // console.log(data);
    // const node = data.querySelectorAll('[id="1072310203"]');//create example
    const node = data.querySelectorAll('[id="3611264529"]');//modify example
    // const node = data.querySelectorAll('[id="1501"]');//delete example

    //Example calls from xml file
    // console.log(node[0]);
    // console.log(node[0].parentNode.parentNode.getAttribute('type'));
    // console.log(node[0].querySelectorAll("tag")[0].getAttribute('k'));

    //1. Traverse all "action" nodes of xml file
    //2. If "Create":
    //deltaInNodesWays++
    //deltaInTags += nTags
    //3. If "Modify":
    //deltaInNodesWays = unchanged
    //deltaInTags += nTagsNew - nTagsOld
    //4. If "Delete":
    //deltaInNodesWays--
    //deltaInTags -= nTags

    //Vandalism Checker
    const vandalismCheckResult = {};
    let actions = data.querySelectorAll("action");
    // console.log(actions);
    for (let i = 0; i < actions.length; i++) {
      //Get type, i.e. "create", "modify" or "delete"
      const type = actions[i].getAttribute("type");
      // console.log(type);

      //Get changeset number
      let changesetNumber
      if (type === "create") changesetNumber = actions[i].lastElementChild.getAttribute("changeset");
      else changesetNumber = actions[i].lastElementChild.firstElementChild.getAttribute("changeset");
      // console.log(changesetNumber);

      //Create empty changeset object, if new.
      if (!vandalismCheckResult[changesetNumber]) vandalismCheckResult[changesetNumber] = { deltaInNodesWays: 0, deltaInTags: 0};

      //Check which action is performed
      //"Create"
      //deltaInNodesWays++
      //deltaInTags += nTagsAdded
      if (type === "create") {
        // const changesetNumber = actions[11].lastElementChild.getAttribute("changeset");
        const nTagsAdded = actions[i].lastElementChild.querySelectorAll("tag").length;
        // console.log(nTagsAdded);
          vandalismCheckResult[changesetNumber].deltaInNodesWays++;
          vandalismCheckResult[changesetNumber].deltaInTags += nTagsAdded;
      }

      // "Modify"
      //deltaInNodesWays = unchanged
      //deltaInTags += nTagsNew - nTagsOld
      if (type === "modify") {
        const nTagsNew = actions[i].lastElementChild.firstElementChild.querySelectorAll("tag").length;
        const nTagsOld = actions[i].firstElementChild.firstElementChild.querySelectorAll("tag").length;
        // console.log(nTagsNew);
        // console.log(nTagsOld);
        vandalismCheckResult[changesetNumber].deltaInTags += (nTagsNew - nTagsOld);
      }

      // "Delete"
      //deltaInNodesWays--
      //deltaInTags -= nTags
      if (type === "delete") {
        const nTagsDeleted = actions[i].firstElementChild.querySelectorAll("tag").length;
        // console.log(nTagsDeleted);
        vandalismCheckResult[changesetNumber].deltaInNodesWays--;
        vandalismCheckResult[changesetNumber].deltaInTags -= nTagsDeleted;
      }
    }

    console.log(vandalismCheckResult);

    //----------------------------------------------------------------------------------------------------------------

    //Tag comparison table creation
    //First check what type of action has been performed on the element (i.e. create, modify, delete)
    let action = node[0].parentNode.parentNode.getAttribute('type');//Check if action is "modify", "delete" or "null"
    if (!action) action = "create";//The xml data structure is different for "create" nodes, thus action will be "null" in the line above
    // console.log(action);

    //Create header with element info
    let elementInfoHtml = `<span class="${action} capitalize">${action}</span> ${node[0].nodeName} <a href="https://www.openstreetmap.org/${node[0].nodeName}/${node[0].getAttribute("id")}" target="_blank" rel="noopener noreferrer">${node[0].getAttribute("id")}</a>`;
    document.querySelector("#element-info").innerHTML = elementInfoHtml;

    //Variables
    let tableHtml = `<table class="table-container">`;

    //Object with all key-value pairs for new and old and relevant meta tags for table
    const keyvalues = { old: { meta: {}, tags: {} }, new: { meta: {}, tags: {} } };

    //1 CREATE
    if (action === "create") {
      //Copy meta tags
      const keysNew = node[0].querySelectorAll("tag");

      //Create table
      tableHtml += `
        <thead>
          <tr>
            <th>Tag</th>
            <th>New</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>version</td>
            <td>${node[0].getAttribute("version")}</td>
          </tr>
          <tr>
            <td>timestamp</td>
            <td>${node[0].getAttribute("timestamp")}</td>
          </tr>
          <tr>
            <td>user</td>
            <td>${node[0].getAttribute("user")}</td>
          </tr>
    `;

      for (let i = 0; i < keysNew.length; i++) {
        tableHtml += `
          <tr class="green">
            <td>${keysNew[i].getAttribute('k')}</td>
            <td>${keysNew[i].getAttribute('v')}</td>
          </tr>
        `
      }
    }

    //2 MODIFY/DELETE
    else {
      //Create Set with all unique key-values from old and new
      const uniqueKeysSet = new Set();
      //Start with old
      //Copy meta tags
      keyvalues.old.meta["version"] = node[0].getAttribute("version");
      keyvalues.old.meta["timestamp"] = node[0].getAttribute("timestamp");
      keyvalues.old.meta["user"] = node[0].getAttribute("user");
      const keysOld = node[0].querySelectorAll("tag");
      for (let i = 0; i < keysOld.length; i++) {
        keyvalues.old.tags[keysOld[i].getAttribute('k')] = keysOld[i].getAttribute('v');
        uniqueKeysSet.add(keysOld[i].getAttribute('k'));
      }
      //Continue with new
      //Copy meta tags
      keyvalues.new.meta["version"] = node[1].getAttribute("version");
      keyvalues.new.meta["timestamp"] = node[1].getAttribute("timestamp");
      keyvalues.new.meta["user"] = node[1].getAttribute("user");
      const keysNew = node[1].querySelectorAll("tag");
      for (let i = 0; i < keysNew.length; i++) {
        keyvalues.new.tags[keysNew[i].getAttribute('k')] = keysNew[i].getAttribute('v');
        uniqueKeysSet.add(keysNew[i].getAttribute('k'));
      }
      // console.log(keyvalues);
      //Create array in which all keys are ordered alphabetically
      const uniqueKeysArr = Array.from(uniqueKeysSet).sort();
      // console.log(uniqueKeysArr);

      //Create table
      tableHtml = `
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

      //Traverse uniqueKeysArray and check in object which value this key has in new and old
      for (let i = 0; i < uniqueKeysArr.length; i++) {
        let oldTag = keyvalues.old.tags[uniqueKeysArr[i]];
        let newTag = keyvalues.new.tags[uniqueKeysArr[i]];
        let cssClass;
        //Case 1: Tag deleted in new --> Background color red, change from "undefined" to ""
        if (!newTag) {
          cssClass = "red";
          newTag = "";
        }
        //Case 2: Tag created in new --> Background color green, change from "undefined" to ""
        else if (!oldTag) {
          cssClass = "green";
          oldTag = "";
        }
        //Case 3: Tag different in new --> Background color yellow
        else if (oldTag !== newTag) cssClass = "yellow";

        //Case 4: Tags similar --> Don't display this key-value pair
        // else continue;
        // Option: Add "unchanged-counter" and display message at the bottom of table:
        //"...and xx unchanged tags"

        tableHtml += `
      <tr ${(cssClass ? 'class=' + cssClass : '')}>
        <td>${uniqueKeysArr[i]}</td>
        <td>${oldTag}</td>
        <td>${newTag}</td>
      </tr>
      `
      }
    }

    tableHtml += `
      </tbody>
    </table>
  `;
    document.querySelector("#tags-comparison").innerHTML = tableHtml;

    //Create link to edit geometry in iD editor
    let editGeometry = `<a href="https://www.openstreetmap.org/edit?${node[0].nodeName}=${node[0].getAttribute("id")}" target="_blank" rel="noopener noreferrer">Edit</a> in iD`;
    document.querySelector("#edit-geometry").innerHTML = editGeometry;
  }
  )