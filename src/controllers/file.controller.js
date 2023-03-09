const fs = require("fs");
const RequestIp = require('@supercharge/request-ip')
const useragent = require("express-useragent");
const FileType = require('file-type');

const {generateId} = require("../lib/generator");

module.exports = {
    downloadFile: async (req, reply) => {
        try{
            const ID = req.params._id;
            const file = await req.app.mongoose.File.findOne({Nombre: ID});
            if (!file){
                return reply.code(404).send("Archivo no encontrado.");
            }

            const stream = fs.createReadStream(file.PathArchivo);
            reply.header(
                'Content-Disposition',
                'attachment; '+file.NombreOriginal
            );
            return reply.type(file.MimeArchivo).send(stream);

        }catch(e){
            reply.code(500).send(e);
        }
    },

    create: async (req, reply) => {
        try{
            const files= req.body;

            const root = "/home/alex/Documentos/V&G Data Consulting SAC/Scripts/sfile"; //"/var/www/sfile";
            const date = new Date();
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            
            var codes=[];
            for (let _file of files){
                const filename = _file["Nombre"]; // SANITIZE CONTENT
                const dirpath = `${root}/src/static/uploads/${year}/${month}/${day}/`;
                fs.mkdirSync(dirpath, { recursive: true });

                const currentElements = await req.app.mongoose.File.find({});
                const newFilename = generateId(currentElements.length, 16).id;

                // SAVE ON FILE SYSTEM
                const filepath = dirpath+newFilename;
                let byteContent = Buffer.from(_file["Contenido"], "base64");
                fs.writeFileSync(filepath, byteContent);
                 
                // SAVE ON DB
                const UA = useragent.parse(req.headers["user-agent"]);
                const IP = RequestIp.getClientIp(req);
                const mimetype = await FileType.fromFile(filepath);

                const file = {
                    Nombre: newFilename,
                    NombreOriginal: filename,
                    PathArchivo: filepath,
                    MimeArchivo: mimetype.mime,
                    ExtArchivo: mimetype.ext,
                    ModOrigen: _file['ModOrigen'],
                    Responsable: _file['Responsable'],
                    Maquina: {
                        browser: UA['browser'],
                        version: UA['version'],
                        os: UA['os'],
                        platform: UA['platform']
                    },
                    Ip: IP
                }

                const newFile = new req.app.mongoose.File(file);
                newFile.save();

                codes.push({
                    ID: newFilename,
                    Nombre: filename
                });
            }

            //RESPONSE
            reply.code(201).send(codes);
        }catch(e){
            reply.code(500).send(e);
        }
    },
    fetch: async (req, reply) => {
        try{
            const files = await req.app.mongoose.File.find();
            reply.code(200).send(files);
        }catch(e){
            reply.code(500).send(e);
        }
    },
    get: async (req, reply) => {
        try{
            const ID = req.params._id;
            const file = await req.app.mongoose.File.findOne({Nombre: ID});
            reply.code(200).send(file);
        }catch(e){
            reply.code(500).send(e);
        }
    },
    update: async (req, reply) => {
        try{
            const updates = req.body;
            const ID = req.params._id;
            const file = await req.app.mongoose.File.findOne({Nombre: ID});
            if (!file){
                return reply.code(404).send("Archivo no existe.");
            }
         
            await req.app.mongoose.File.findOneAndUpdate({Nombre: ID}, updates);
            reply.code(202).send("Archivo Actualizado.");
        }catch(e){
            reply.code(500).send(e);
        }
    },
    delete: async (req, reply) => {
        try{
            const ID = req.params._id;
            const file = await req.app.mongoose.File.findOne({Nombre: ID});
            if (!file){
                return reply.code(404).send("Archivo no existe.");
            }

            await req.app.mongoose.File.findOneAndDelete({Nombre: ID});
            reply.code(202).send("Archivo Eliminado.");
        }catch(e){
            reply.code(500).send(e);
        }
    }
}