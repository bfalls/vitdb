var vitdat = {};
vitdat.webdb = {};

function showError(title, txt) {
    let divAlert = $('<div class="alert alert-warning alert-dismissible" role="alert"></div>');
    divAlert.append($('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'));
    divAlert.append($('<strong>' + title + '</strong> ' + txt));
    divError.append(divAlert);
}

vitdat.webdb.open = function() {
    let dbSize = 5 * 1024 * 1024; // 5MB
    try {
        vitdat.webdb.db = openDatabase("Vitamins", "1", "Vitamins Manager", dbSize);
        return true;
    } catch (e) {
        setTimeout(() => {
            vitdat.webdb.onError(null, e);
        });
    }
    return false;
}
  
vitdat.webdb.onError = function(tx, e) {
    let divAlert = $('<div class="alert alert-warning alert-dismissible" role="alert"></div>');
    divAlert.append($('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'));
    divAlert.append($('<span><strong>' + e.name + '</strong>: ' + e.message + '</span>'));
    $('#error').append(divAlert);

    // alert("DB Error: " + e.message);
}

vitdat.webdb.onSuccess = function(tx, r) {
    // re-render the data.
    // loadTodoItems is defined in Step 4a
    // vitdat.webdb.getAllTodoItems(loadTodoItems);
}
function nullDataHandler(transaction, results) { }

vitdat.webdb.dropTable = function() {
    let db = vitdat.webdb.db;
    db.transaction(function(tx) {
        tx.executeSql("DROP TABLE IF EXISTS vitamins", [], nullDataHandler, vitdat.webdb.onError);
    });
}

vitdat.webdb.createTable = function() {
    let db = vitdat.webdb.db;
    db.transaction(function(tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS " +
            "vitamins(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, " +
            "upc TEXT, " +
            "orig_upc TEXT, " +
            "section TEXT, " +
            "shelf TEXT, " +
            "position TEXT, " +
            "facing TEXT, " +
            "brand TEXT, " +
            "description TEXT, " +
            "size TEXT, " +
            "units TEXT)", [], nullDataHandler, vitdat.webdb.onError);
    });
    db.transaction(function(tx) {
        tx.executeSql("CREATE INDEX idx_upc ON vitamins (upc)", [], nullDataHandler, vitdat.webdb.onError);
    });
}

vitdat.webdb.addVitamin = function(vitArr, tx) {
    tx.executeSql("INSERT INTO vitamins(upc, orig_upc, section, shelf, position, facing, brand, description, size, units) " +
    "VALUES (?,?,?,?,?,?,?,?,?,?)",
        [vitArr[0],vitArr[1],vitArr[2],vitArr[3],vitArr[4],vitArr[5],vitArr[6],vitArr[7],vitArr[8],vitArr[9]],
        vitdat.webdb.onSuccess,
        vitdat.webdb.onError);
}

/**
 * getVitamin
 * @param upc The upc to search for.
 * @param renderFunc The callback function to call on success.
 */
vitdat.webdb.getVitamin = function(upc, renderFunc) {
    var db = vitdat.webdb.db;
    db.transaction(function(tx) {
      tx.executeSql("SELECT * FROM vitamins WHERE upc = ?", [upc], renderFunc,
      vitdat.webdb.onError);
    });
  }

if (vitdat.webdb.open()) {
    vitdat.webdb.dropTable();
    vitdat.webdb.createTable();

    // Add vitamins data to WebSQL
    vitdat.webdb.db.transaction(function(tx) {
        for (var i=0; i < vitdb.length; i++) {
            vitdat.webdb.addVitamin(vitdb[i], tx);
        }
    });
}