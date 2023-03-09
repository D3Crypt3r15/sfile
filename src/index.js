const app= require("fastify")({
    logger: true,
    trustProxy: true
});

//
const fileRoutes = require("./routes/file.routes");

fileRoutes(app);

app.decorateRequest('fastify', null); 
app.addHook("onRequest", async (req, reply) => {
    if (req.headers['token'] !== process.env.JWT_SECRET){
        reply.code(403).send("Sin autorizacion para acceder a este recurso.");
    }
    req.app = app;
}); 
//
const initialize = async ()=>{
    app.register(require("@fastify/env"), {
        
        confKey: 'config',
        dotenv: {
            path: "/var/www/sfile/src/.env"
        },
        data: process.env,

        schema: {
            type: "object",
            required: ["PORT", "MONGODB_URI", "JWT_SECRET"],
            properties: {
                PORT: {
                    type: 'number'
                },
                MONGODB_URI: {
                    type: 'string'
                },
                JWT_SECRET: {
                    type: "string"
                }
            }
        }
    });
    await app.after(); 

    app.register(require("@fastify/cors"), {exposedHeaders: 'Content-Disposition'} ,(instance) => {
        return (req, callback) => {
            const corsOptions = {
                // This is NOT recommended for production as it enables reflection exploits
                origin: true
            };
        
            // do not include CORS headers for requests from localhost
            if (/^localhost$/m.test(req.headers.origin)) {
                corsOptions.origin = false
            }
        
            // callback expects two parameters: error and options
            callback(null, corsOptions)
        }
    });
    app.register(require('fastify-mongoose-driver').plugin, {
        uri: process.env.MONGODB_URI,
        settings: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            config: {
                autoIndex: true
            }
        },
        models: [
            {
                name: "files",
                alias: "File",
                schema: {
                    Nombre: {
                        type: String
                    },
                    NombreOriginal: {
                        type: String,
                        required: [true, "Nombre de archivo requerido."]
                    },
                    PathArchivo: {
                        type: String
                    },
                    MimeArchivo: {
                        type: String
                    },
                    ExtArchivo:{
                        type: String
                    },

                    ModOrigen: {
                        type: String,
                        required: [true, "Modulo de origen requerido."]
                    },
                    Estado: {
                        type: String
                    },
                    Responsable: {
                        type: String,
                        required: [true, "Nombre del Personal responsable requerido."]
                    },
                    FecRegistro: {
                        type: String,
                        default: Date.now
                    },
                    Maquina: {
                        browser: {
                            type: String
                        },
                        version: {
                            type: String
                        },
                        os: {
                            type: String
                        },
                        platform: {
                            type: String
                        }
                      
                    },
                    Ip: {
                        type: String
                    },
                }
            }
        ],
        useNameAndAlias: true
        
    }, (err) => {
        if (err) throw err;
    });
};
initialize();

(async ()=>{
    await app.ready();
    app.listen({host: "0.0.0.0", port: process.env.PORT},(err, address) => { 
        if (err) { 
          fastify.log.error(err) 
          process.exit(1) 
        } 
      });

})();
