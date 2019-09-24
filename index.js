require("dotenv").config({ path: "variables.env" });
const express = require("express");
const routes = require("./routes");
const path = require("path");
const bodyParser = require("body-parser");
const helpers = require("./helpers");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const passport = require("./config/passport");

// Crear la conexion a la BD

const db = require("./config/db");

// importar el modelo
require("./models/Proyectos");
require("./models/Tareas");
require("./models/Usuarios");

db.sync()
  .then(() => console.log("conectado al servidor"))
  .catch(error => console.log(error));

// Crear una app de express
const app = express();

// Donde cargar los archivos estaticos

app.use(express.static("public"));

// Habilitar bodyParser para leer datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));

// Habilitar pug

app.set("view engine", "pug");

// añadir carpeta vistas
app.set("views", path.join(__dirname, "./views"));

// agregar flash messages

app.use(flash());

// sessiones para navegar entre distintas paginas
app.use(
  session({
    secret: "supersecreto",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Pasar var dump a la aplicacion
app.use((req, res, next) => {
  res.locals.vardump = helpers.varDump;
  res.locals.mensajes = req.flash();
  res.locals.usuario = { ...req.user } || null;
  next();
});

app.use("/", routes());

require("./handlers/email");

const host = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || "3000";

app.listen(port, host, () => {
  console.log("El servidor esta funcionando");
});
