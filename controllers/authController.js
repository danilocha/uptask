const passport = require("passport");
const usuarios = require("../models/Usuarios");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const crypto = require("crypto");
const bcrypt = require("bcrypt-nodejs");
const enviarEmail = require("../handlers/email");

exports.autenticarUsuario = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/iniciar-sesion",
  failureFlash: true,
  badRequestMessage: "ambos cambios son obligatorios"
});

// funcion para revisar si el usuario esta logueado
exports.usuarioAutenticado = (req, res, next) => {
  // si el usuario esta autenticado
  if (req.isAuthenticated()) {
    return next();
  }

  // si no redirigir al formulario
  return res.redirect("/iniciar-sesion");
};
// funcion para cerrar sesion
exports.cerrarSesion = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/iniciar-sesion"); // al cerrar sesion nos lleva al login
  });
};

// genera un token si el usuario es valido
exports.enviarToken = async (req, res) => {
  // verificar que el usuario existe
  const { email } = req.body;
  const usuario = await usuarios.findOne({ where: { email: email } });

  // si no existe el usuario
  if (!usuario) {
    req.flash("error", "No existe esa cuenta");
    res.redirect("/reestablecer");
  }

  // si existe el usuario
  usuario.token = crypto.randomBytes(20).toString("hex");
  usuario.expiracion = Date.now() + 3600000;

  // guardarlos en la base de datos
  await usuario.save();

  // url de reset
  const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;

  // Enviar el correo con el token
  await enviarEmail.enviar({
    usuario,
    subject: "Password Reset",
    resetUrl,
    archivo: "reestablecer-password"
  });

  // Terminar el proceso
  req.flash("correcto", "Se envio un mensaje a tu correo");
  res.redirect("/iniciar-sesion");
};
exports.validarToken = async (req, res) => {
  const usuario = await usuarios.findOne({
    where: {
      token: req.params.token
    }
  });
  //si no encuentra el usuario
  if (!usuario) {
    req.flash("error", "no es un token valido");
    res.redirect("/reestablecer");
  }

  // Formulario para generar el password
  res.render("resetPassword", {
    nombrePagina: "Reestablecer Contraseña"
  });
};

// cambia el password por uno nuevo
exports.actualizarPassword = async (req, res) => {
  // verifica el token valido y la fecha de expiracion
  const usuario = await usuarios.findOne({
    where: {
      token: req.params.token,
      expiracion: {
        [Op.gte]: Date.now()
      }
    }
  });
  // verificamos si el usuario existe
  if (!usuario) {
    req.flash("error", "No valido");
    res.redirect("/reestablecer");
  }

  // hashear el nuevo password
  usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
  usuario.token = null;
  usuario.expiracion = null;

  // guardamos el nuevo password
  await usuario.save();
  req.flash("correcto", "Tu Password se ha modificado correctamente");
  res.redirect("/iniciar-sesion");
};
