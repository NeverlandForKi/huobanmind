var access_token;
var appId;
var seq = 1;

function displayTree(treeData) {


    root = treeData;
    root.x0 = height / 2;
    root.y0 = 0;

    function collapse(d) {
        if (d.children) {
              d._children = d.children;
              d._children.forEach(collapse);
              d.children = null;
        }
    }

    root.children.forEach(collapse);
    update(root);
}

function getValue(fieldId, itemFields) {
  for (var i = itemFields.length - 1; i >= 0; i--) {
    itemField = itemFields[i];

    if (itemField.field_id != fieldId) {
      continue;
    }

    if (itemField.values.length) {
      return itemField.values[0];
    } else {
      return null;
    }
  }
}

function addNode(flare, itemFieldValue){
  if (!itemFieldValue) {
    return null;
  }

  var nodeFieldValue;
  if (itemFieldValue.type == 'user') {
    nodeFieldValue = {
      "nodeId":itemFieldValue.user_id,
      "name":itemFieldValue.name,
      "children":[
      ]
    };
  } else {
    nodeFieldValue = {
      "nodeId":itemFieldValue.id,
      "name":itemFieldValue.name,
      "children":[
      ]
    };
  }
  for (var i = flare.children.length - 1; i >= 0; i--) {
    currentNode = flare.children[i];

    if (currentNode.nodeId == nodeFieldValue.nodeId) {
      return currentNode;
    }
  }

  flare.children.push(nodeFieldValue);
  return nodeFieldValue;
}

function addItem(flare, nodeFieldValue, item){
  if (!nodeFieldValue) {
    var nodeFieldValue = {"nodeId":0};
  }

  for (var i = flare.children.length - 1; i >= 0; i--) {
    var currentNode = flare.children[i];
    if (currentNode.nodeId != nodeFieldValue.nodeId) {
      continue
    }

    currentNode.children.push({"nodeId":item.item_id, "name":item.title});
  }
}

function getNodeField(app) {
  var allowed_types = ["category", "user"];
  for (var i = app.fields.length - 1; i >= 0; i--) {
    var field = app.fields[i];
    if (!allowed_types.includes(field.type)) {
      continue;
    }

    if (field.config.type != "single") {
      continue;
    }

    if (field.is_attach_field) {
      continue;
    }

    return field;
  }
}

function buildTreeData(app, filterResult) {

    var nodeField = getNodeField(app);
    // var flare = {"name": "item", "children": [{"name": "analytics", "children": [{"name": "cluster", "children": [{"name": "AgglomerativeCluster", "size": 3938}, {"name": "CommunityStructure", "size": 3812}, {"name": "HierarchicalCluster", "size": 6714}, {"name": "MergeEdge", "size": 743} ] } ] } ] };

    var flare = {
      "name":nodeField.name,
      "children":[
        {"nodeId":0, "name":"未填写", "children":[]}
      ]
    };

    for (var i = 0; i < filterResult.items.length; i++) {
      var item = filterResult.items[i];

        var itemFieldValue = getValue(nodeField.field_id, item.fields);
        var nodeFieldValue = addNode(flare, itemFieldValue);
        addItem(flare, nodeFieldValue, item);
    }

    // flare = {
    //   "name":"分类",
    //   "children":[
    //     {"name":"未填写", "children":[
    //       {"name":"未填写", "children":[
    //         {"name":"item1"},
    //         {"name":"item2"}
    //       ]}
    //     ]},
    //     {"name":"红色", "children":[
    //       {"name":"未填写", "children":[
    //         {"name":"item3"},
    //         {"name":"item4"}
    //       ]}
    //     ]}
    //   ]
    // };
    // console.log(flare);
    return flare;
}

chrome.extension.getBackgroundPage().getApp(function(app) {
  chrome.extension.getBackgroundPage().listItem(function(msg) {
    displayTree(buildTreeData(app, msg));
  });
});

// document.addEventListener('DOMContentLoaded', function () {
// 	var huobanData = chrome.extension.getBackgroundPage().huobanData;
// 	$("#message").hide();
// 	$("#current_url").text('appId:' + huobanData.appId);

//     access_token = huobanData.access_token;
//     appId = huobanData.appId;

//     start();
// });