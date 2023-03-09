const FileController = require("../controllers/file.controller");

module.exports = async (app) =>{
    app.get("/api/v1/download/:_id", FileController.downloadFile);
    app.get("/api/v1/files", FileController.fetch);
    app.get("/api/v1/files/:_id", FileController.get);
    app.post("/api/v1/files", FileController.create);
    app.put("/api/v1/files", FileController.update);
    app.delete("/api/v1/files/:_id", FileController.delete);
}