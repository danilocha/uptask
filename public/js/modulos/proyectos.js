import Swal from "sweetalert2";
import axios from "axios";

const btnEliminar = document.querySelector("#eliminar-proyecto");
if (btnEliminar) {
  btnEliminar.addEventListener("click", e => {
    const urlProyecto = e.target.dataset.proyectoUrl;

    Swal.fire({
      title: "¿estas seguro?",
      text: "Perderas toda la informacion del proyecto",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, borrar",
      cancelButtonText: "Cancelar"
    }).then(result => {
      if (result.value) {
        // peticion a axios
        const url = `${location.origin}/proyectos/${urlProyecto}`;

        axios
          .delete(url, { params: { urlProyecto } })
          .then(function(respuesta) {
            console.log(respuesta);
            Swal.fire("Borrado", respuesta.data, "success");
            // redireccionar al inicio
            setTimeout(() => {
              window.location.href = "/";
            }, 3000);
          })
          .catch(() => {
            Swal.fire({
              type: "error",
              title: "Hubo un error"
            });
          });
      }
    });
  });
}

export default btnEliminar;
