const Usuarios = require("../models/Usuarios");
const enviarEmail = require("../handlers/email");
exports.formCrearCuenta = (req, res) => {
  res.render("crearCuenta", {
    nombrePagina: "Crear cuenta en Uptask"
  });
};
exports.formIniciarSesion = (req, res) => {
  const { error } = res.locals.mensajes;
  res.render("iniciarSesion", {
    nombrePagina: "Iniciar sesión en upTask",
    error
  });
};

exports.crearCuenta = async (req, res) => {
  // leer los datos
  const { email, password } = req.body;

  try {
    // Crear el usuario
    await Usuarios.create({
      email,
      password
    });

    // crear una URL de confirmar
    const confirmarUrl = `http://${req.headers.host}/confirmar/${email}`;

    // crear el objeto de usuario
    const usuario = {
      email
    };

    // Enviar email
    await enviarEmail.enviar({
      usuario,
      subject: "Confirma tu cuenta Uptask",
      confirmarUrl,
      archivo: "confirmar-cuenta"
    });

    // redirigir al usuario
    req.flash("correcto", "enviamos un correo, confirma tu cuenta");
    res.redirect("iniciar-sesion");
  } catch (error) {
    req.flash(error, error.errors.map(error => error.message));
    res.render("crearCuenta", {
      mensajes: req.flash(),
      nombrePagina: "Crear cuenta en Uptask",
      email,
      password
    });
  }
};

exports.formRestablecerPassword = (req, res) => {
  res.render("reestablecer", {
    nombrePagina: "Reestablecer tu contraseña"
  });
};

exports.confirmarCuenta = async (req, res) => {
  const usuario = await Usuarios.findOne({
    where: {
      email: req.params.correo
    }
  });
  // si no existe el usuario
  if (!usuario) {
    req.flash("error", "No valido");
    res.redirect("/crear-cuenta");
  }

  usuario.activo = 1;
  await usuario.save();

  req.flash("correcto", "cuenta activada correctamente");
  res.redirect("/iniciar-sesion");
};
