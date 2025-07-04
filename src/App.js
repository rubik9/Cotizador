import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Table,
  Button,
  InputGroup,
  Badge,
  ListGroup,
  Alert,
  Modal,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import PdfDocument from "./Pdf";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { pdf } from "@react-pdf/renderer";

// Función helper para fetch con autenticación
const fetchConAuth = async (url) => {
  const authBasic = localStorage.getItem("authBasic");
  if (!authBasic) {
    throw new Error("No hay credenciales almacenadas");
  }

  const headers = {
    Authorization: `Basic ${authBasic}`,
    "api-key": "6m9onJyLm45dSPqgiZpo9qfHsNU4sBnDS2WVrd19IadYo",
    Accept: "application/json",
  };

  const response = await fetch(url, { headers });

  if (response.status === 401) {
    throw new Error("Credenciales inválidas o expiradas");
  }

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response;
};

function App() {
  // Estados principales
  const [productos, setProductos] = useState([]);
  const [productosMostrados, setProductosMostrados] = useState([]);
  const [cotizacion, setCotizacion] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");

  const [
    mostrarConfirmacionCambioCliente,
    setMostrarConfirmacionCambioCliente,
  ] = useState(false);
  const [clientePendientePorSeleccionar, setClientePendientePorSeleccionar] =
    useState(null);
  const [mostrarModalRevision, setMostrarModalRevision] = useState(false);

  // Estados para el modal de correo
  const [mostrarModalCorreo, setMostrarModalCorreo] = useState(false);
  const [correoDestinoManual, setCorreoDestinoManual] = useState("");

  // Estados para clientes
  const [clientesOriginales, setClientesOriginales] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [cargandoClientes, setCargandoClientes] = useState(false);

  // Estados para listas de precios
  const [listasCliente, setListasCliente] = useState([]);
  const [listaSeleccionada, setListaSeleccionada] = useState("");
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [errorProductos, setErrorProductos] = useState(null);
  const [idCotizacion, setIdCotizacion] = useState("");

  // Estados para unidades de regalo
  const [piezasRegaladas, setPiezasRegaladas] = useState({});

  const [auth, setAuth] = useState({
    usuario: "",
    password: "",
    error: "",
    isAuthenticated: false, // Inicialmente no autenticado
    isLoading: false, // Nuevo estado para carga
  });

  // Estados para descuentos globales
  const [descuentosGlobales, setDescuentosGlobales] = useState({
    porcentaje: 0,
    fijo: 0,
    descarga: 0,
    prontoPago: 0,
  });

  // Formateador de moneda
  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(valor)
      .replace("MXN", "")
      .trim();
  };

  // Función para formatear kilogramos
  const formatoKilogramos = (kg) => {
    return (
      kg.toLocaleString("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " kg"
    );
  };

  // Generar ID de cotización único
  const generarIdCotizacion = () => {
    const now = new Date();
    const fecha = `${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;
    const hora = `${now.getHours().toString().padStart(2, "0")}${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}${now.getSeconds().toString().padStart(2, "0")}`;
    const idGenerado = `COT-${fecha}-${hora}-MASC`;
    setIdCotizacion(idGenerado); // Guardar el ID generado
    return idGenerado;
  };
  //   const handleGenerarYEnviar = () => {
  //   const idGenerado = idCotizacion || generarIdCotizacion(); // Solo si no existe
  //   // Usar idGenerado en fetch, PDF, correos, etc.
  // };

  // Función para manejar el cambio de cliente
  const handleClickCambiarCliente = () => {
    if (cotizacion.length === 0) {
      setClienteSeleccionado(null);
    } else {
      setClientePendientePorSeleccionar(null); // null significa "sin cliente"
      setMostrarConfirmacionCambioCliente(true);
    }
  };

  // Función de logout mejorada
  const handleLogout = () => {
    localStorage.removeItem("authBasic");
    setAuth({
      usuario: "",
      password: "",
      error: "",
      isAuthenticated: false,
    });
    setClienteSeleccionado(null);
    setCotizacion([]);
  };
  // Función para enviar PDF por correo  https://script.google.com/a/macros/albapesa.com.mx/s/AKfycbw2wBEsdpKKFN5wU6u7jlH4AG6aHiwXJ-qxffKxWL3oE7mS8nDHyfokcGKk16AVTBvY/exec
  const enviarPDFporCorreo = async (
    blob,
    correosDestino,
    cotizacionId,
    revision,
    usuarioemail
  ) => {
    try {
      const base64 = await blobToBase64(blob);

      // Asegurarse que correosDestino es un array SIEMPRE
      const revisoresEmails = correosDestino
        ? correosDestino
        : [correosDestino]; // si es string, lo convierte en array de 1

      const response = await fetch(
        "https://back-cotizadorv2.vercel.app/api/create-cotizacion",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cotizacionId: cotizacionId,
            pdfBase64: base64.split(",")[1],
            revisoresEmails: revisoresEmails,
            usuarioNombre: auth.usuario,
            revision: revision, // nuevo campo para indicar si es revisión
            usuarioEmail: usuarioemail, // email del usuario que envía
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        console.log("✅ Correo de revisión enviado correctamente");
      } else {
        console.log("❌ Error al enviar correo: " + result.message);
      }
    } catch (err) {
      alert("⚠️ Error técnico: " + err.message);
    }
  };

  // Función auxiliar para convertir Blob a base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  //Función que decide si descargar o enviar PDF

  const generarYEnviarPDFSegunDescuento = () => {
    generarIdCotizacion(); // Generar ID de cotización
    setMostrarModalCorreo(true);
  };

  // Función de login mejorada
  const handleLogin = async () => {
    // Validación básica
    if (!auth.usuario || !auth.password) {
      setAuth({ ...auth, error: "Usuario y contraseña son requeridos" });
      return;
    }

    setAuth({ ...auth, isLoading: true, error: "" });

    try {
      const authBasic = btoa(`${auth.usuario}:${auth.password}`);

      // Primero probamos las credenciales
      const testResponse = await fetch(
        "https://albapesa.app/ERP10Live/api/v1/BaqSvc/Calculo_Admin(Albapesa)/",
        {
          headers: {
            Authorization: `Basic ${authBasic}`,
            "api-key": "6m9onJyLm45dSPqgiZpo9qfHsNU4sBnDS2WVrd19IadYo",
            Accept: "application/json",
          },
        }
      );

      if (testResponse.status === 401) {
        throw new Error("Credenciales incorrectas");
      }

      // Si la autenticación es exitosa
      localStorage.setItem("authBasic", authBasic);
      setAuth({
        usuario: auth.usuario,
        password: "", // No mantener en estado
        error: "",
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      localStorage.removeItem("authBasic");
      setAuth({
        ...auth,
        error: error.message || "Error de autenticación",
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };
  // Cargar clientes al montar el componente
  useEffect(() => {
    const cargarClientes = async () => {
      if (!auth.isAuthenticated) return;

      setCargandoClientes(true);
      try {
        const response = await fetchConAuth(
          "https://albapesa.app/ERP10Live/api/v1/BaqSvc/c_ListaPrecios_Cliente(ALBAPESA)/"
        );

        const data = await response.json();

        const clientesAgrupados = data.value.reduce((acc, current) => {
          const existingIndex = acc.findIndex(
            (c) => c.Customer_CustNum === current.Customer_CustNum
          );

          if (existingIndex === -1) {
            acc.push({
              Customer_CustNum: current.Customer_CustNum,
              Customer_Name: current.Customer_Name,
              ListasPrecio: current.CustomerPriceLst_ListCode
                ? [current.CustomerPriceLst_ListCode]
                : [],
              Territorio: current.Territorio,
              DescuentoMascotas: current.DescuentoMascotas || "0%",
            });
          } else {
            if (
              current.CustomerPriceLst_ListCode &&
              !acc[existingIndex].ListasPrecio.includes(
                current.CustomerPriceLst_ListCode
              )
            ) {
              acc[existingIndex].ListasPrecio.push(
                current.CustomerPriceLst_ListCode
              );
            }
          }
          return acc;
        }, []);

        setClientesOriginales(clientesAgrupados);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        if (error.message.includes("Credenciales inválidas")) {
          handleLogout();
        }
      } finally {
        setCargandoClientes(false);
      }
    };

    cargarClientes();
  }, [auth.isAuthenticated]);

  // Cargar productos al montar el componente
  // Ya no cargues todos los productos al iniciar sesión
  useEffect(() => {
    if (auth.isAuthenticated) {
      setProductos([]); // Limpia productos al login
    }
  }, [auth.isAuthenticated]);

  // [Resto de tus efectos y funciones permanecen iguales...]
  // Filtrar clientes localmente
  useEffect(() => {
    if (busquedaCliente.length > 2) {
      const termino = busquedaCliente.toLowerCase();
      const resultados = clientesOriginales.filter((cliente) =>
        cliente.Customer_Name.toLowerCase().includes(termino)
      );
      setClientesFiltrados(resultados);
    } else {
      setClientesFiltrados([]);
    }
  }, [busquedaCliente, clientesOriginales]);

  // Cargar listas del cliente cuando se selecciona
  useEffect(() => {
    if (clienteSeleccionado) {
      const clienteCompleto = clientesOriginales.find(
        (c) => c.Customer_CustNum === clienteSeleccionado.Customer_CustNum
      );

      if (clienteCompleto?.ListasPrecio?.length > 0) {
        setListasCliente(clienteCompleto.ListasPrecio);
        setListaSeleccionada(""); // <--- Esto es lo que te falta
        setErrorProductos(null);
      } else {
        setListasCliente([]);
        setListaSeleccionada("");
        setErrorProductos("Este cliente no tiene listas de precios asignadas");
      }
    }
  }, [clienteSeleccionado, clientesOriginales]);

  // Calcular piezas regaladas al cambiar la cotización
  // useEffect(() => {
  //   setPiezasRegaladas((prev) => {
  //     const nuevasPiezas = {};
  //     cotizacion.forEach((item) => {
  //       nuevasPiezas[item.idUnico] = calcularPiezasRegaladas(
  //         item.cantidad,
  //         item.unidadesParaRegalo
  //       );
  //     });
  //     return nuevasPiezas;
  //   });
  // }, [cotizacion]);

  // Filtrar productos cuando cambia la lista seleccionada o búsqueda
  useEffect(() => {
    if (productos.length > 0) {
      setCargandoProductos(true);
      let resultados = productos;

      if (busquedaProducto.length > 0) {
        const termino = busquedaProducto.toLowerCase();
        resultados = resultados.filter(
          (p) =>
            p.Part_PartDescription.toLowerCase().includes(termino) ||
            (p.Part_PartNum &&
              p.Part_PartNum.toString().toLowerCase().includes(termino))
        );
      }

      setProductosMostrados(resultados);
      setCargandoProductos(false);

      if (resultados.length === 0) {
        setErrorProductos(
          busquedaProducto.length > 0
            ? `No se encontraron productos con "${busquedaProducto}"`
            : `No hay productos en la lista seleccionada`
        );
      } else {
        setErrorProductos(null);
      }
    } else {
      setProductosMostrados([]); // limpiar si no hay productos
    }
  }, [productos, busquedaProducto]);

  // Seleccionar la primera lista de precios automáticamente si no hay una seleccionada
  useEffect(() => {
    if (listasCliente.length > 0 && listaSeleccionada === "") {
      const primeraLista = listasCliente[0];
      handleListaPreciosChange(primeraLista);
    }
  }, [listasCliente, listaSeleccionada]);

  // Actualizar productos cuando cambian descuentos globales
  useEffect(() => {
    if (cotizacion?.length > 0) {
      setCotizacion((prev) =>
        prev.map((item) => {
          const nuevosDescuentos = {
            descuentoPorcentaje:
              item.descuentoPorcentaje === descuentosGlobales.porcentaje
                ? descuentosGlobales.porcentaje
                : item.descuentoPorcentaje,
            descuentoFijo:
              item.descuentoFijo === descuentosGlobales.fijo
                ? descuentosGlobales.fijo
                : item.descuentoFijo,
            descuentoDescarga:
              item.descuentoDescarga === descuentosGlobales.descarga
                ? descuentosGlobales.descarga
                : item.descuentoDescarga,
          };

          return { ...item, ...nuevosDescuentos };
        })
      );
    }
  }, [descuentosGlobales]);

  // Función para calcular todos los descuentos
const calcularTodosDescuentos = useCallback((item) => {
  // ✅ Incluir piezas regaladas en el cálculo base
  const piezasTotales = item.cantidad + (item.piezasRegaladas ?? 0);
  const precioBase = item.PriceLstParts_BasePrice * piezasTotales;

  // ✅ Descuentos individuales
  const descRegalo = (item.piezasRegaladas ?? 0) * item.PriceLstParts_BasePrice;
  const descUnitario = item.descuentoUnitario * item.cantidad;
  const descPorcentaje = precioBase * (item.descuentoPorcentaje / 100);
  const descFijo = item.descuentoFijo * item.cantidad;
  const descDescarga = item.descuentoDescarga * item.cantidad;

  // ✅ Sumatoria de descuentos antes de pronto pago
  const descuentosSinProntoPago = descRegalo + descUnitario + descPorcentaje + descFijo + descDescarga;

  // ✅ Base para pronto pago
  const subtotalAntesProntoPago = precioBase - descuentosSinProntoPago;

  // ✅ Pronto pago sobre esa base
  const descProntoPago = subtotalAntesProntoPago * (descuentosGlobales.prontoPago / 100);

  // ✅ Total de descuentos del producto
  const totalDescuentos = descuentosSinProntoPago + descProntoPago;

  return {
    descRegalo,
    descUnitario,
    descPorcentaje,
    descFijo,
    descDescarga,
    descProntoPago,
    piezasReg: item.piezasRegaladas ?? 0,
    totalDescuentos,
  };
}, [descuentosGlobales.prontoPago]);


  // Funciones para manejar la cotización
  const agregarProducto = (producto) => {
    if (cotizacion.some((p) => p.Part_PartNum === producto.Part_PartNum)) {
      alert("Este producto ya ha sido agregado a la cotización.");
      return;
    }

    setCotizacion((prev) => [
      ...prev,
      {
        ...producto,
        cantidad: 1,
        descuentoUnitario: 0,
        unidadesParaRegalo: 0,
        piezasRegaladas: 0, // inicializamos en 0
        descuentoPorcentaje: descuentosGlobales.porcentaje,
        descuentoFijo: descuentosGlobales.fijo,
        descuentoDescarga: descuentosGlobales.descarga,
        idUnico: `${producto.Part_PartNum}_${Date.now()}`,
      },
    ]);
  };

  const actualizarCantidad = (partNum, nuevaCantidad) => {
    const cantidadNum = Math.max(1, Math.floor(parseInt(nuevaCantidad) || 1));

    setCotizacion((prev) =>
      prev.map((item) => {
        if (item.Part_PartNum !== partNum) return item;

        const nuevasPiezasRegaladas = calcularPiezasRegaladas(
          cantidadNum,
          item.unidadesParaRegalo
        );

        return {
          ...item,
          cantidad: cantidadNum,
          piezasRegaladas: nuevasPiezasRegaladas, // 🟢 recalcula con la nueva cantidad
        };
      })
    );
  };

  const handleListaPreciosChange = async (nuevaListaPrecios) => {
    setListaSeleccionada(nuevaListaPrecios); // ← tú ya tienes este useState bien
    setProductos([]); // Limpia productos actuales

    try {
      setCargandoProductos(true);

      const response = await fetchConAuth(
        `https://albapesa.app/ERP10Live/api/v1/BaqSvc/calculo_Admin_copy/?CodigoLista=${encodeURIComponent(
          nuevaListaPrecios
        )}`
      );

      const data = await response.json();
      setProductos(data.value || []);
      setErrorProductos(null);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setErrorProductos(error.message);
      if (error.message.includes("Credenciales inválidas")) {
        handleLogout();
      }
    } finally {
      setCargandoProductos(false);
    }
  };

  const handleClienteSeleccionado = (cliente) => {
    if (cotizacion.length === 0) {
      setClienteSeleccionado(cliente);
    } else {
      // Mostrar modal de confirmación
      setClientePendientePorSeleccionar(cliente);
      setMostrarConfirmacionCambioCliente(true);
    }
  };

  const confirmarCambioCliente = () => {
    setClienteSeleccionado(clientePendientePorSeleccionar); // cambia cliente
    setCotizacion([]); // limpiar cotización actual
    setProductos([]); // limpiar lista de productos
    setProductosMostrados([]); // limpiar productos mostrados
    setListaSeleccionada(""); // dejar vacía la lista seleccionada → para que el useEffect de listasCliente auto-seleccione la primera
    // OJO: NO poner setListasCliente([]) → se actualizará solo en useEffect(clienteSeleccionado)
    setBusquedaProducto(""); // limpiar búsqueda
    setErrorProductos(null); // limpiar error
    setClientePendientePorSeleccionar(null);
    setMostrarConfirmacionCambioCliente(false);
  };

  const cancelarCambioCliente = () => {
    setClientePendientePorSeleccionar(null);
    setMostrarConfirmacionCambioCliente(false);
  };
  const actualizarDescuento = (partNum, campo, valor) => {
    const val = parseFloat(valor);
    const valorNumerico = isNaN(val) ? 0 : val;

    setCotizacion((prev) =>
      prev.map((p) => {
        if (p.Part_PartNum !== partNum) return p;

        let valorValidado = valorNumerico;

        // 🔐 Evitar aplicar más descuentos si ya hay 100%
        if (campo !== "descuentoPorcentaje" && p.descuentoPorcentaje >= 100) {
          alert(
            "⚠️ Ya se aplicó un 100% de descuento. No se permiten más descuentos."
          );
          return p;
        }

        // 🎯 Aplica 100% y limpia los demás descuentos
        if (campo === "descuentoPorcentaje" && valorValidado === 100) {
          return {
            ...p,
            descuentoPorcentaje: 100,
            descuentoUnitario: 0,
            descuentoFijo: 0,
            descuentoDescarga: 0,
          };
        }

        // Validaciones normales por campo
        if (campo === "descuentoPorcentaje") {
          valorValidado = Math.min(100, Math.max(0, valorValidado));
        } else if (campo === "descuentoUnitario") {
          valorValidado = Math.max(0, valorValidado);
        } else if (campo === "descuentoFijo" || campo === "descuentoDescarga") {
          valorValidado = Math.max(0, valorValidado);
        } else if (campo === "unidadesParaRegalo") {
          valorValidado = Math.max(0, Math.floor(valorValidado));
          return {
            ...p,
            [campo]: valorValidado,
            piezasRegaladas: calcularPiezasRegaladas(p.cantidad, valorValidado),
          };
        }

        return {
          ...p,
          [campo]: valorValidado,
        };
      })
    );
  };

  const calcularPiezasRegaladas = (cantidad, unidadesPromo) => {
    if (!unidadesPromo || unidadesPromo <= 0) return 0;
    return Math.floor(cantidad / unidadesPromo);
  };

  const eliminarProducto = (partNum) => {
    setCotizacion((prev) => prev.filter((p) => p.Part_PartNum !== partNum));
  };

  // Cálculo de totales generales
  const totalSubtotal = useMemo(
    () =>
      cotizacion.reduce((acc, item) => {
        const piezasTotales =
          item.cantidad +
          calcularPiezasRegaladas(item.cantidad, item.unidadesParaRegalo);
        return acc + item.PriceLstParts_BasePrice * piezasTotales;
      }, 0),
    [cotizacion]
  );

  const totalDescRegalo = useMemo(
    () =>
      cotizacion.reduce(
        (acc, item) => acc + calcularTodosDescuentos(item).descRegalo,
        0
      ),
    [cotizacion, calcularTodosDescuentos]
  );

  const totalDescUnitario = useMemo(
    () =>
      cotizacion.reduce(
        (acc, item) => acc + calcularTodosDescuentos(item).descUnitario,
        0
      ),
    [cotizacion, calcularTodosDescuentos]
  );

  const totalDescPorcentaje = useMemo(
    () =>
      cotizacion.reduce(
        (acc, item) => acc + calcularTodosDescuentos(item).descPorcentaje,
        0
      ),
    [cotizacion, calcularTodosDescuentos]
  );

  const totalKilogramos = useMemo(
    () =>
      cotizacion.reduce(
        (acc, item) =>
          acc + item.Part_GrossWeight * (item.cantidad + item.piezasRegaladas),
        0
      ),
    [cotizacion]
  );

  const totalDescFijo = useMemo(
    () =>
      cotizacion.reduce(
        (acc, item) => acc + calcularTodosDescuentos(item).descFijo,
        0
      ),
    [cotizacion, calcularTodosDescuentos]
  );

  const totalDescDescarga = useMemo(
    () =>
      cotizacion.reduce(
        (acc, item) => acc + calcularTodosDescuentos(item).descDescarga,
        0
      ),
    [cotizacion, calcularTodosDescuentos]
  );
  const totalDescProntoPago = useMemo(
  () =>
    cotizacion.reduce(
      (acc, item) => acc + calcularTodosDescuentos(item).descProntoPago,
      0
    ),
  [cotizacion, calcularTodosDescuentos]
);



const totalDescuentos = useMemo(
  () =>
    totalDescRegalo +
    totalDescUnitario +
    totalDescPorcentaje +
    totalDescFijo +
    totalDescDescarga +
    totalDescProntoPago,
  [
    totalDescRegalo,
    totalDescUnitario,
    totalDescPorcentaje,
    totalDescFijo,
    totalDescDescarga,
    totalDescProntoPago,
  ]
);


// Total de descuentos ya incluye pronto pago por ítem
const totalSubtotalConDescuento = totalSubtotal - totalDescuentos;
const totalIVA = totalSubtotalConDescuento * 0.16;
const totalGeneral = totalSubtotalConDescuento + totalIVA;

const porcentajeDescuentoTotal = totalSubtotalConDescuento > 0
  ? (totalDescuentos / totalSubtotalConDescuento) * 100
  : 0;

const porcentajeFormateado = porcentajeDescuentoTotal.toFixed(2);

  return (
    <Container fluid className="py-4">
      <Modal show={!auth.isAuthenticated} backdrop="static">
        <Modal.Header>
          <Modal.Title>Acceso al Sistema</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Usuario Epicor:</Form.Label>
              <Form.Control
                type="text"
                value={auth.usuario}
                onChange={(e) =>
                  setAuth({ ...auth, usuario: e.target.value, error: "" })
                }
                disabled={auth.isLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña:</Form.Label>
              <Form.Control
                type="password"
                value={auth.password}
                onChange={(e) =>
                  setAuth({ ...auth, password: e.target.value, error: "" })
                }
                disabled={auth.isLoading}
              />
            </Form.Group>

            {auth.error && <Alert variant="danger">{auth.error}</Alert>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={handleLogin}
            disabled={!auth.usuario || !auth.password || auth.isLoading}
          >
            {auth.isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                Verificando...
              </>
            ) : (
              "Ingresar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      {auth.isAuthenticated && (
        <>
          <div className="d-flex justify-content-end mb-3">
            <Button variant="outline-danger" onClick={handleLogout}>
              Cerrar Sesión ({auth.usuario})
            </Button>
          </div>

          <h1 className="mb-4">Cotizador</h1>

          {/* Resto de tu interfaz permanece igual */}
          <Row>
            {/* Columna izquierda - Datos del cliente */}
            <Col md={4}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>Datos del Cliente</Card.Title>
                  {clienteSeleccionado ? (
                    <>
                      <h5>{clienteSeleccionado.Customer_Name}</h5>
                      <p>Código: {clienteSeleccionado.Customer_CustNum}</p>

                      <Form.Group className="mb-3">
                        <Form.Label>Lista de precios:</Form.Label>
                        {listasCliente.length > 0 ? (
                          <Form.Select
                            value={listaSeleccionada}
                            onChange={(e) => {
                              const nuevaLista = e.target.value;

                              if (cotizacion.length > 0) {
                                if (
                                  window.confirm(
                                    "Al cambiar de lista se vaciará la cotización actual. ¿Deseas continuar?"
                                  )
                                ) {
                                  setCotizacion([]);
                                  handleListaPreciosChange(nuevaLista); // AQUÍ llamas la función
                                }
                              } else {
                                handleListaPreciosChange(nuevaLista); // AQUÍ también
                              }
                            }}
                          >
                            {listasCliente.map((lista) => (
                              <option key={lista} value={lista}>
                                {lista}
                              </option>
                            ))}
                          </Form.Select>
                        ) : (
                          <p>No hay listas de precios disponibles.</p>
                        )}
                      </Form.Group>

                      <Button
                        variant="outline-danger"
                        onClick={handleClickCambiarCliente}
                      >
                        Cambiar cliente
                      </Button>
                    </>
                  ) : (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Buscar cliente:</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="text"
                            placeholder="Nombre del cliente..."
                            value={busquedaCliente}
                            onChange={(e) => setBusquedaCliente(e.target.value)}
                          />
                          {busquedaCliente && (
                            <Button
                              variant="outline-secondary"
                              onClick={() => setBusquedaCliente("")}
                            >
                              ×
                            </Button>
                          )}
                        </InputGroup>
                      </Form.Group>

                      {!cargandoClientes &&
                        busquedaCliente.length > 2 &&
                        clientesFiltrados.length > 0 && (
                          <ListGroup
                            style={{ maxHeight: "300px", overflowY: "auto" }}
                          >
                            {clientesFiltrados.map((cliente) => (
                              <ListGroup.Item
                                key={cliente.Customer_CustNum}
                                action
                                onClick={() =>
                                  handleClienteSeleccionado(cliente)
                                }
                              >
                                {cliente.Customer_Name}
                                <br />
                                <small className="text-muted">
                                  Código: {cliente.Customer_CustNum}
                                </small>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        )}
                    </>
                  )}
                </Card.Body>
              </Card>

              {/* Descuentos Globales */}
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>Descuentos Globales</Card.Title>
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Apoyo Extra % Global</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            min="0"
                            max="100"
                            value={descuentosGlobales.porcentaje}
                            onChange={(e) =>
                              setDescuentosGlobales({
                                ...descuentosGlobales,
                                porcentaje: Math.min(
                                  100,
                                  Math.max(0, parseFloat(e.target.value) || 0)
                                ),
                              })
                            }
                          />
                          <InputGroup.Text>%</InputGroup.Text>
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Desc. Otro Global ($)</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            min="0"
                            step="0.01"
                            value={descuentosGlobales.fijo}
                            onChange={(e) =>
                              setDescuentosGlobales({
                                ...descuentosGlobales,
                                fijo: Math.max(
                                  0,
                                  parseFloat(e.target.value) || 0
                                ),
                              })
                            }
                          />
                          <InputGroup.Text>$</InputGroup.Text>
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Descarga Global ($)</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            min="0"
                            step="0.01"
                            value={descuentosGlobales.descarga}
                            onChange={(e) =>
                              setDescuentosGlobales({
                                ...descuentosGlobales,
                                descarga: Math.max(
                                  0,
                                  parseFloat(e.target.value) || 0
                                ),
                              })
                            }
                          />
                          <InputGroup.Text>$</InputGroup.Text>
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Pronto Pago Global (%)</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            min="0"
                            max="3"
                            step="0.1"
                            value={descuentosGlobales.prontoPago}
                            onChange={(e) =>
                              setDescuentosGlobales({
                                ...descuentosGlobales,
                                prontoPago: Math.min(
                                  3,
                                  Math.max(0, parseFloat(e.target.value) || 0)
                                ),
                              })
                            }
                          />
                          <InputGroup.Text>%</InputGroup.Text>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-between mt-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() =>
                        setDescuentosGlobales({
                          porcentaje: 0,
                          fijo: 0,
                          descarga: 0,
                          prontoPago: 0,
                        })
                      }
                    >
                      Limpiar Descuentos
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setCotizacion((prev) =>
                          prev.map((item) => ({
                            ...item,
                            descuentoPorcentaje: descuentosGlobales.porcentaje,
                            descuentoFijo: descuentosGlobales.fijo,
                            descuentoDescarga: descuentosGlobales.descarga,
                          }))
                        );
                      }}
                    >
                      Aplicar a Todos
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Columna derecha - Productos disponibles */}
            <Col md={8}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>
                    Productos Disponibles
                    {listaSeleccionada && (
                      <Badge bg="secondary" className="ms-2">
                        {listaSeleccionada}
                      </Badge>
                    )}
                  </Card.Title>

                  <Form.Group className="mb-3">
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Buscar producto..."
                        value={busquedaProducto}
                        onChange={(e) => setBusquedaProducto(e.target.value)}
                      />
                      {busquedaProducto && (
                        <Button
                          variant="outline-secondary"
                          onClick={() => setBusquedaProducto("")}
                        >
                          ×
                        </Button>
                      )}
                    </InputGroup>
                  </Form.Group>

                  {cargandoProductos ? (
                    <div className="text-center py-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    </div>
                  ) : errorProductos ? (
                    <Alert variant="danger">{errorProductos}</Alert>
                  ) : (
                    <div
                      style={{
                        height: "calc(100vh - 450px)",
                        overflowY: "auto",
                      }}
                    >
                      {productosMostrados.map((producto) => (
                        <Card key={producto.Part_PartNum} className="mb-2">
                          <Card.Body className="py-2">
                            <Row className="align-items-center">
                              <Col xs={7}>
                                <h6 className="mb-1">
                                  {producto.Part_PartDescription}
                                </h6>
                                <small className="text-muted">
                                  Código: {producto.Part_PartNum} | Peso:{" "}
                                  {producto.Part_GrossWeight} kg
                                </small>
                              </Col>
                              <Col xs={3} className="text-end">
                                {formatoMoneda(
                                  producto.PriceLstParts_BasePrice
                                )}
                              </Col>
                              <Col xs={2} className="text-end">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => agregarProducto(producto)}
                                >
                                  Agregar
                                </Button>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Tabla de cotización en la parte inferior */}
          {cotizacion.length > 0 && (
            <Row className="mt-4">
              <Col xs={12}>
                <Card>
                  <Card.Body>
                    <Card.Title>Cotización Actual</Card.Title>
                    <div style={{ maxHeight: "550px", overflowX: "auto" }}>
                      <Table striped bordered hover responsive>
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Precio</th>
                            <th>Cant</th>
                            <th>Kilos</th>
                            <th>Push Money($)</th>
                            <th>Sacos 1 en ...</th>
                            <th>Promo</th>
                            <th>Apoyo Extra %</th>
                            <th>Otro($)</th>
                            <th>Descarga ($)</th>
                            <th>Subtotal</th>
                            <th>Total Desc.</th>
                            <th>Subtotal c/Desc.</th>
                            <th>$ saco con Desc.</th>
                            <th>IVA</th>
                            <th>Total</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cotizacion.map((item) => {
                            const descuentos = calcularTodosDescuentos(item);
                            const pztotales =
                              item.cantidad + item.piezasRegaladas;
                            const subtotal =
                              item.PriceLstParts_BasePrice * pztotales;
                            const kilosTotales =
                              item.Part_GrossWeight * pztotales;
                            const subtotalConDescuento =
                              subtotal - descuentos.totalDescuentos;
                            const preciocdescuento =
                              subtotalConDescuento / pztotales;
                            const iva = subtotalConDescuento * 0.16;
                            const total = subtotalConDescuento + iva;
                            const estaBloqueado =
                              item.descuentoPorcentaje >= 100;

                            return (
                              <tr key={item.idUnico}>
                                <td>{item.Part_PartDescription}</td>
                                <td>
                                  {formatoMoneda(item.PriceLstParts_BasePrice)}
                                </td>
                                <td>
                                  <Form.Control
                                    type="number"
                                    value={item.cantidad}
                                    min="1"
                                    onChange={(e) =>
                                      actualizarCantidad(
                                        item.Part_PartNum,
                                        e.target.value
                                      )
                                    }
                                    style={{ width: "70px" }}
                                  />
                                </td>
                                <td>{formatoKilogramos(kilosTotales)}</td>

                                {/* Descuento Unitario */}
                                <td>
                                  <InputGroup style={{ width: "90px" }}>
                                    <Form.Control
                                      type="number"
                                      value={item.descuentoUnitario}
                                      min="0"
                                      step="0.01"
                                      onChange={(e) =>
                                        actualizarDescuento(
                                          item.Part_PartNum,
                                          "descuentoUnitario",
                                          e.target.value
                                        )
                                      }
                                      disabled={estaBloqueado}
                                    />
                                    <InputGroup.Text>$</InputGroup.Text>
                                  </InputGroup>
                                </td>

                                {/* Unidades para regalo */}
                                <td>
                                  <Form.Control
                                    type="number"
                                    value={item.unidadesParaRegalo}
                                    min="0"
                                    disabled={estaBloqueado}
                                    onChange={(e) => {
                                      const promoValue =
                                        parseInt(e.target.value) || 0;
                                      actualizarDescuento(
                                        item.Part_PartNum,
                                        "unidadesParaRegalo",
                                        promoValue
                                      );
                                    }}
                                    title="Ingrese X para promoción 'X+1' (ej: 3 para 3+1)"
                                    style={{ width: "90px" }}
                                  />
                                </td>

                                {/* Unidades de Regalo*/}
                                <td>
                                  {item.unidadesParaRegalo > 0 ? (
                                    <Badge bg="success">
                                      {item.piezasRegaladas || 0} gratis
                                      <small className="d-block">
                                        (Promo 1/{item.unidadesParaRegalo})
                                      </small>
                                    </Badge>
                                  ) : (
                                    "Sin promo"
                                  )}
                                </td>

                                {/* Descuento Porcentaje */}
                                <td>
                                  <InputGroup style={{ width: "130px" }}>
                                    <Form.Control
                                      type="number"
                                      value={item.descuentoPorcentaje}
                                      min="0"
                                      max="100"
                                      onChange={(e) =>
                                        actualizarDescuento(
                                          item.Part_PartNum,
                                          "descuentoPorcentaje",
                                          e.target.value
                                        )
                                      }
                                      className={
                                        item.descuentoPorcentaje !==
                                        descuentosGlobales.porcentaje
                                          ? "bg-warning bg-opacity-25"
                                          : ""
                                      }
                                    />
                                    <InputGroup.Text>%</InputGroup.Text>
                                  </InputGroup>
                                </td>

                                {/* Descuento Fijo */}
                                <td>
                                  <InputGroup style={{ width: "110px" }}>
                                    <Form.Control
                                      type="number"
                                      value={item.descuentoFijo}
                                      min="0"
                                      step="0.01"
                                      disabled={estaBloqueado}
                                      onChange={(e) =>
                                        actualizarDescuento(
                                          item.Part_PartNum,
                                          "descuentoFijo",
                                          e.target.value
                                        )
                                      }
                                      className={
                                        item.descuentoFijo !==
                                        descuentosGlobales.fijo
                                          ? "bg-warning bg-opacity-25"
                                          : ""
                                      }
                                    />
                                    <InputGroup.Text>$</InputGroup.Text>
                                  </InputGroup>
                                </td>

                                {/* Descarga */}
                                <td>
                                  <InputGroup style={{ width: "110px" }}>
                                    <Form.Control
                                      type="number"
                                      value={item.descuentoDescarga}
                                      min="0"
                                      step="0.01"
                                      disabled={estaBloqueado}
                                      onChange={(e) =>
                                        actualizarDescuento(
                                          item.Part_PartNum,
                                          "descuentoDescarga",
                                          e.target.value
                                        )
                                      }
                                      className={
                                        item.descuentoDescarga !==
                                        descuentosGlobales.descarga
                                          ? "bg-warning bg-opacity-25"
                                          : ""
                                      }
                                    />
                                    <InputGroup.Text>$</InputGroup.Text>
                                  </InputGroup>
                                </td>

                                <td>{formatoMoneda(subtotal)}</td>
                                <td className="text-danger">
                                  -{formatoMoneda(descuentos.totalDescuentos)}
                                </td>
                                <td>{formatoMoneda(subtotalConDescuento)}</td>
                                <td>{formatoMoneda(preciocdescuento)}</td>
                                <td>{formatoMoneda(iva)}</td>
                                <td>{formatoMoneda(total)}</td>
                                <td>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() =>
                                      eliminarProducto(item.Part_PartNum)
                                    }
                                  >
                                    ×
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="fw-bold bg-light">
                            <td colSpan="3">Totales</td>
                            <td>{formatoKilogramos(totalKilogramos)}</td>
                            <td colSpan="6"></td>
                            <td>{formatoMoneda(totalSubtotal)}</td>
                            <td className="text-danger">
                              -{formatoMoneda(totalDescuentos)}
                            </td>
                            <td>{formatoMoneda(totalSubtotalConDescuento)}</td>
                            <td colSpan="1"></td>
                            <td>{formatoMoneda(totalIVA)}</td>
                            <td>{formatoMoneda(totalGeneral)}</td>
                            <td></td>
                          </tr>
                          <tr className="fw-bold bg-light">
                            <td colSpan="11"></td>
                            <td colSpan="1" className="text-danger">
                              {porcentajeFormateado}%
                            </td>
                            <td colSpan="5" className="text-end">
                              <Button
                                variant="outline-danger"
                                onClick={() => setCotizacion([])}
                              >
                                Limpiar Cotización
                              </Button>
                            </td>
                          </tr>

                          <tr className="breakdown-row">
                            <td colSpan="14" className="small">
                              <strong>Desglose de descuentos:</strong>
                              <span className="ms-2">
                                Tolal PushMoney:{" "}
                                {formatoMoneda(totalDescUnitario)}
                              </span>{" "}
                              |{" "}
                              <span>
                                Sacos: {formatoMoneda(totalDescRegalo)}
                              </span>{" "}
                              |{" "}
                              <span>
                                ApoyoExtra: {formatoMoneda(totalDescPorcentaje)}
                              </span>{" "}
                              |{" "}
                              <span>Otros: {formatoMoneda(totalDescFijo)}</span>{" "}
                              |{" "}
                              <span>
                                Descarga: {formatoMoneda(totalDescDescarga)}
                              </span>{" "}
                              |{" "}
                              <span>
                                Pronto pago:{" "}
                                {formatoMoneda(totalDescProntoPago)}
                              </span>
                            </td>
                            <td colSpan="3" className="text-end">
                              <Button
                                variant="success"
                                className="mt-3"
                                onClick={generarYEnviarPDFSegunDescuento}
                              >
                                Generar Cotizacíon
                              </Button>
                            </td>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
          <Button
            variant="secondary"
            onClick={() => {
              // Paso 1: construir cotizacionParaPDF
              const cotizacionParaPDF = cotizacion.map((item) => {
                const cantidadTotal =
                  item.cantidad + (item.piezasRegaladas ?? 0);
                const subtotal = item.PriceLstParts_BasePrice * cantidadTotal;

                const descuentos = calcularTodosDescuentos(item);
                const subtotalConDescuento =
                  subtotal - descuentos.totalDescuentos;

                return {
                  ...item,
                  cantidadTotal,
                  subtotal,
                  subtotalConDescuento,
                  totalDescuentos: descuentos.totalDescuentos,
                  piezasRegaladas: item.piezasRegaladas ?? 0,
                  ...descuentos, // Incluye descRegalo, descUnitario, etc.
                };
              });

              // Paso 2: testData limpio y sin repeticiones
              const testData = {
                cotizacion: cotizacionParaPDF,
                cliente: clienteSeleccionado,
                listaPrecios: listaSeleccionada,
                //idCotizacion: idCotizacion,
                usuario: auth.usuario,

                // Totales globales ya calculados
                subtotal: totalSubtotal,
                totalSubtotalConDescuento: totalSubtotalConDescuento,
                iva: totalIVA,
                total: totalGeneral,
                kilogramos: totalKilogramos,
                porcentajeFormateado: porcentajeFormateado,

                // Desglose de descuentos totales
                totalDescUnitario: totalDescUnitario,
                totalDescRegalo: totalDescRegalo,
                totalDescPorcentaje: totalDescPorcentaje,
                totalDescFijo: totalDescFijo,
                totalDescDescarga: totalDescDescarga,
                
                descuentoProntoPagoGlobal: totalDescProntoPago

                // Solo si lo necesitas dentro del PDF
              };

              console.log("Datos de prueba para PDF:", testData);
              console.table(testData.cotizacion);
            }}
          >
            Ver Datos PDF
          </Button>

          <Modal
            show={mostrarConfirmacionCambioCliente}
            onHide={cancelarCambioCliente}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>⚠️ Cambiar Cliente</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Si cambias el cliente, se borrará la cotización actual. ¿Deseas
                continuar?
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={cancelarCambioCliente}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={confirmarCambioCliente}>
                Sí, cambiar cliente
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal
            show={mostrarModalCorreo}
            onHide={() => setMostrarModalCorreo(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Ingrese el correo de destino</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group>
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="ejemplo@dominio.com"
                  value={correoDestinoManual}
                  onChange={(e) => setCorreoDestinoManual(e.target.value)}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setMostrarModalCorreo(false)}
              >
                Cancelar
              </Button>
              {/*
                Prepara los datos para el PDF fuera del JSX
              */}
              {(() => {
                const cotizacionParaPDF = cotizacion.map((item) => {
                  const cantidadTotal =
                    item.cantidad + (item.piezasRegaladas ?? 0);
                  const subtotal = item.PriceLstParts_BasePrice * cantidadTotal;

                  const descuentos = calcularTodosDescuentos(item);
                  const subtotalConDescuento =
                    subtotal - descuentos.totalDescuentos;

                  return {
                    ...item,
                    cantidadTotal,
                    subtotal,
                    subtotalConDescuento,
                    totalDescuentos: descuentos.totalDescuentos,
                    piezasRegaladas: item.piezasRegaladas ?? 0,
                    ...descuentos, // Incluye descRegalo, descUnitario, etc.
                  };
                });

                return (
                  <PDFDownloadLink
                    document={
                      <PdfDocument
                        cotizacion={cotizacionParaPDF}
                        cliente={clienteSeleccionado}
                        listaPrecios={listaSeleccionada}
                        subtotal={totalSubtotal}
                        porcentajeDesc ={descuentosGlobales.prontoPago }
                        descuentos={totalDescuentos}
                        iva={totalIVA}
                        total={totalGeneral}
                        totalSubtotalConDescuento={totalSubtotalConDescuento}
                        kilogramos={totalKilogramos}
                        porcentajeFormateado={porcentajeFormateado}
                        idCotizacion={idCotizacion}
                        piezasRegaladas={piezasRegaladas}
                        usuario={auth.usuario}
                        totalDescUnitario={totalDescUnitario}
                        totalDescRegalo={totalDescRegalo}
                        totalDescPorcentaje={totalDescPorcentaje}
                        totalDescFijo={totalDescFijo}
                        totalDescDescarga={totalDescDescarga}
                        descuentoProntoPagoGlobal={totalDescProntoPago}
                      />
                    }
                    fileName={`${idCotizacion || "prueba"}.pdf`}
                    style={{
                      textDecoration: "none",
                      padding: "10px 15px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      borderRadius: "5px",
                      marginTop: "10px",
                      display: "inline-block",
                    }}
                  >
                    {({ loading }) =>
                      loading ? "Generando PDF..." : "📄 Descargar PDF Actual"
                    }
                  </PDFDownloadLink>
                );
              })()}

              <Button
                variant="primary"
                onClick={async () => {
                  setMostrarModalCorreo(false);
                  const cotizacionParaPDF = cotizacion.map((item) => {
                    const cantidadTotal =
                      item.cantidad + (item.piezasRegaladas ?? 0);
                    const subtotal =
                      item.PriceLstParts_BasePrice * cantidadTotal;

                    const descuentos = calcularTodosDescuentos(item);
                    const subtotalConDescuento =
                      subtotal - descuentos.totalDescuentos;

                    return {
                      ...item,
                      cantidadTotal,
                      subtotal,
                      subtotalConDescuento,
                      totalDescuentos: descuentos.totalDescuentos,
                      piezasRegaladas: item.piezasRegaladas ?? 0,
                      ...descuentos, // Incluye descRegalo, descUnitario, etc.
                    };
                  });

                  const nuevoId = idCotizacion;

                  const doc = (
                    <PdfDocument
                      cotizacion={cotizacionParaPDF}
                      cliente={clienteSeleccionado}
                      listaPrecios={listaSeleccionada}
                      subtotal={totalSubtotal}
                      descuentos={totalDescuentos}
                      iva={totalIVA}
                      total={totalGeneral}
                      totalSubtotalConDescuento={totalSubtotalConDescuento}
                      kilogramos={totalKilogramos}
                      porcentajeFormateado={porcentajeFormateado}
                      calcularDescuentos={calcularTodosDescuentos}
                      idCotizacion={nuevoId}
                      piezasRegaladas={piezasRegaladas}
                      usuario={auth.usuario}
                      totalDescUnitario={totalDescUnitario}
                      totalDescRegalo={totalDescRegalo}
                      totalDescPorcentaje={totalDescPorcentaje}
                      totalDescFijo={totalDescFijo}
                      totalDescDescarga={totalDescDescarga}
                      descuentoProntoPagoGlobal={totalDescProntoPago}
                    />
                  );

                  const blob = await pdf(doc).toBlob();

                  // 1️⃣ Siempre se envía al correo ingresado:
                  try {
                    await enviarPDFporCorreo(
                      blob,
                      [correoDestinoManual],
                      nuevoId,
                      false,
                      [correoDestinoManual]
                    );
                  } catch (err) {
                    alert(
                      "Error al enviar PDF al correo ingresado: " + err.message
                    );
                  }

                  // 2️⃣ Si > 10.9%, también se envía a los revisores:
                  if (porcentajeDescuentoTotal > 10.9) {
                    const correosDestinoMayores = [
                      "rcontreras@albapesa.com.mx",
                      "atopete@albapesa.com.mx",
                    ];
                    try {
                      await enviarPDFporCorreo(
                        blob,
                        correosDestinoMayores,
                        nuevoId,
                        true,
                        [correoDestinoManual]
                      );
                      setMostrarModalRevision(true);
                    } catch (err) {
                      alert("Error al enviar PDF a revisores: " + err.message);
                    }
                  }
                }}
              >
                Enviar cotización
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal
            show={mostrarModalRevision}
            onHide={() => setMostrarModalRevision(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Cotización en revisión</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Tu cotización ha rebasado el 10.9% de descuento y ha sido enviada
              a los revisores para su aprobación.
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="primary"
                onClick={() => setMostrarModalRevision(false)}
              >
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
}

export default App;
