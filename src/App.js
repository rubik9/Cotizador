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
import { PDFDownloadLink } from "@react-pdf/renderer";
import PdfDocument from "./Pdf";
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
    return `COT-${fecha}-${hora}-MASC`;
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
  const enviarPDFporCorreo = async (blob, correosDestino, cotizacionId) => {
    try {
      const base64 = await blobToBase64(blob);

      // Asegurarse que correosDestino es un array SIEMPRE
      const revisoresEmails = correosDestino
        ? correosDestino
        : [correosDestino]; // si es string, lo convierte en array de 1
      console.log("Enviando a backend:", {
        cotizacionId: cotizacionId,
        pdfBase64: base64.split(",")[1].substring(0, 100) + "...", // solo mostramos 1ro 100 caracteres para no saturar
        revisoresEmails: revisoresEmails,
      });
      const response = await fetch(
        "http://localhost:3001/api/create-cotizacion",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cotizacionId: cotizacionId,
            pdfBase64: base64.split(",")[1],
            revisoresEmails: revisoresEmails,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("✅ Correo de revisión enviado correctamente");
      } else {
        alert("❌ Error al enviar correo: " + result.message);
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

  const generarYEnviarPDFSegunDescuento = async () => {
    const nuevoId = generarIdCotizacion();
    const doc = (
      <PdfDocument
        cotizacion={cotizacion}
        cliente={clienteSeleccionado}
        listaPrecios={listaSeleccionada}
        subtotal={totalSubtotal}
        descuentos={totalDescuentos}
        iva={totalIVA}
        total={totalGeneral}
        kilogramos={totalKilogramos}
        porcentajeFormateado={porcentajeFormateado}
        calcularDescuentos={calcularTodosDescuentos}
        idCotizacion={nuevoId}
        piezasRegaladas={piezasRegaladas}
      />
    );

    const blob = await pdf(doc).toBlob();

    if (porcentajeDescuentoTotal <= 10.9) {
      // Descargar directamente
      const correo = ["jvazquez@albapesa.com.mx"];
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Cotización_${clienteSeleccionado.Customer_Name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      try {
        await enviarPDFporCorreo(blob, correo, nuevoId);
        console.log("PDF enviado por correo" + correo);
      } catch (err) {
        alert("Error al enviar PDF: " + err.message);
      }
    } else {
      const correosDestino = ["mlopez@albapesa.com.mx"];
      const correosDestinoMayores = [
        "rcontreras@albapesa.com.mx",
        "mlopez@albapesa.com.mx",
      ];

      const correo =
        porcentajeDescuentoTotal <= 10.9
          ? ["jvazquez@albapesa.com.mx"] // array SIEMPRE
          : porcentajeDescuentoTotal <= 19.9
          ? correosDestino
          : correosDestinoMayores;

      try {
        await enviarPDFporCorreo(blob, correo, nuevoId);
      } catch (err) {
        alert("Error al enviar PDF: " + err.message);
      }
    }
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
  useEffect(() => {
    const cargarProductos = async () => {
      setCargandoProductos(true);
      try {
        const response = await fetchConAuth(
          "https://albapesa.app/ERP10Live/api/v1/BaqSvc/Calculo_Admin(Albapesa)/"
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

    if (auth.isAuthenticated) {
      cargarProductos();
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
        setListaSeleccionada(clienteCompleto.ListasPrecio[0]);
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
    if (listaSeleccionada) {
      setCargandoProductos(true);
      let resultados = productos.filter(
        (p) => p.PriceLst_ListCode === listaSeleccionada
      );

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
            : `No hay productos en la lista ${listaSeleccionada}`
        );
      } else {
        setErrorProductos(null);
      }
    }
  }, [listaSeleccionada, productos, busquedaProducto]);

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
            descuentoProntoPago:
              item.descuentoProntoPago === descuentosGlobales.prontoPago
                ? descuentosGlobales.prontoPago
                : item.descuentoProntoPago,
          };

          return { ...item, ...nuevosDescuentos };
        })
      );
    }
  }, [descuentosGlobales]);

  // Función para calcular todos los descuentos
  const calcularTodosDescuentos = useCallback(
    (item) => {
      const precioBase = item.PriceLstParts_BasePrice * item.cantidad;
      const piezasReg =
        piezasRegaladas[item.idUnico] ??
        calcularPiezasRegaladas(item.cantidad, item.unidadesParaRegalo);
      const descRegalo = piezasReg * item.PriceLstParts_BasePrice;
      const descUnitario = item.descuentoUnitario * item.cantidad;
      const descPorcentaje = precioBase * (item.descuentoPorcentaje / 100);
      const descProntoPago = precioBase * (item.descuentoProntoPago / 100);
      const descFijo = item.descuentoFijo * item.cantidad;
      const descDescarga = item.descuentoDescarga * item.cantidad;

      return {
        descRegalo,
        descUnitario,
        descPorcentaje,
        descFijo,
        descDescarga,
        descProntoPago,
        piezasReg,
        totalDescuentos:
          descRegalo +
          descUnitario +
          descPorcentaje +
          descFijo +
          descDescarga +
          descProntoPago,
      };
    },
    [piezasRegaladas]
  );

  // Funciones para manejar la cotización
  const agregarProducto = (producto) => {
    setCotizacion((prev) => {
      const existeIndex = prev.findIndex(
        (p) => p.Part_PartNum === producto.Part_PartNum
      );

      if (existeIndex >= 0) {
        const nuevaCotizacion = [...prev];
        nuevaCotizacion[existeIndex].cantidad += 1;
        return nuevaCotizacion;
      }

      return [
        ...prev,
        {
          ...producto,
          cantidad: 1,
          descuentoUnitario: 0,
          unidadesParaRegalo: 0,
          piezasRegaladas: 0,
          descuentoPorcentaje: descuentosGlobales.porcentaje,
          descuentoFijo: descuentosGlobales.fijo,
          descuentoDescarga: descuentosGlobales.descarga,
          descuentoProntoPago: descuentosGlobales.prontoPago,
          idUnico: `${producto.Part_PartNum}_${Date.now()}`,
        },
      ];
    });
  };

  const actualizarCantidad = (partNum, cantidad) => {
    setCotizacion((prev) =>
      prev.map((p) =>
        p.Part_PartNum === partNum
          ? {
              ...p,
              cantidad: Math.max(1, parseInt(cantidad) || 1),
              piezasRegaladas: calcularPiezasRegaladas(
                Math.max(1, parseInt(cantidad) || 1),
                p.unidadesParaRegalo
              ),
            }
          : p
      )
    );
  };

  const actualizarDescuento = (partNum, campo, valor) => {
    setCotizacion((prev) =>
      prev.map((p) => {
        if (p.Part_PartNum === partNum) {
          let valorValidado = parseFloat(valor) || 0;

          if (campo === "descuentoPorcentaje") {
            valorValidado = Math.min(100, Math.max(0, valorValidado));
          } else if (campo === "descuentoProntoPago") {
            valorValidado = Math.min(3, Math.max(0, valorValidado));
          } else if (campo === "unidadesParaRegalo") {
            valorValidado = Math.max(0, Math.floor(valorValidado));
            return {
              ...p,
              [campo]: valorValidado,
              piezasRegaladas: calcularPiezasRegaladas(
                p.cantidad,
                valorValidado
              ),
            };
          }

          return { ...p, [campo]: valorValidado };
        }
        return p;
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
      cotizacion.reduce(
        (acc, item) => acc + item.PriceLstParts_BasePrice * item.cantidad,
        0
      ),
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
        (acc, item) => acc + item.Part_GrossWeight * item.cantidad,
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

  const totalSubtotalConDescuento = totalSubtotal - totalDescuentos;
  const totalIVA = totalSubtotalConDescuento * 0.16;
  const totalGeneral = totalSubtotalConDescuento + totalIVA;
  const porcentajeDescuentoTotal =
    totalSubtotal > 0 ? (totalDescuentos / totalSubtotal) * 100 : 0;
  const porcentajeFormateado = porcentajeDescuentoTotal.toFixed(2);

  return (
    <Container fluid className="py-4">
      // Modal de login modificado
      <Modal show={!auth.isAuthenticated} backdrop="static">
        <Modal.Header>
          <Modal.Title>Acceso al Sistema</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Usuario ERP:</Form.Label>
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
                              if (cotizacion.length > 0) {
                                if (
                                  window.confirm(
                                    "Al cambiar de lista se vaciará la cotización actual. ¿Deseas continuar?"
                                  )
                                ) {
                                  setCotizacion([]);
                                  setListaSeleccionada(e.target.value);
                                }
                              } else {
                                setListaSeleccionada(e.target.value);
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
                          <Alert variant="warning">Sin listas asignadas</Alert>
                        )}
                      </Form.Group>

                      <Button
                        variant="outline-danger"
                        onClick={() => {
                          setClienteSeleccionado(null);
                          setListaSeleccionada("");
                          setCotizacion([]);
                        }}
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
                                onClick={() => setClienteSeleccionado(cliente)}
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
                            descuentoProntoPago: descuentosGlobales.prontoPago,
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
                    <div style={{ maxHeight: "500px", overflowX: "auto" }}>
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
                            <th>Pronto Pago (%)</th>
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
                            const subtotal =
                              item.PriceLstParts_BasePrice * item.cantidad;
                            const kilosTotales =
                              item.Part_GrossWeight * item.cantidad;
                            const subtotalConDescuento =
                              subtotal - descuentos.totalDescuentos;
                            const preciocdescuento =
                              subtotalConDescuento / item.cantidad;
                            const iva = subtotalConDescuento * 0.16;
                            const total = subtotalConDescuento + iva;

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
                                    onChange={(e) => {
                                      const promoValue =
                                        parseInt(e.target.value) || 0;
                                      actualizarDescuento(
                                        item.Part_PartNum,
                                        "unidadesParaRegalo",
                                        promoValue
                                      );

                                      // Calcular y actualizar piezas regaladas inmediatamente
                                      const regaladas = calcularPiezasRegaladas(
                                        item.cantidad,
                                        promoValue
                                      );
                                      setPiezasRegaladas((prev) => ({
                                        ...prev,
                                        [item.idUnico]: regaladas,
                                      }));
                                    }}
                                    title="Ingrese X para promoción 'X+1' (ej: 3 para 3+1)"
                                    style={{ width: "60px" }}
                                  />
                                </td>

                                {/* Unidades de Regalo*/}
                                <td>
                                  {item.unidadesParaRegalo > 0 ? (
                                    <Badge bg="success">
                                      {piezasRegaladas[item.idUnico] || 0}{" "}
                                      gratis
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
                                  <InputGroup style={{ width: "90px" }}>
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
                                  <InputGroup size="s">
                                    <Form.Control
                                      type="number"
                                      value={item.descuentoFijo}
                                      min="0"
                                      step="0.01"
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
                                  <InputGroup size="s">
                                    <Form.Control
                                      type="number"
                                      value={item.descuentoDescarga}
                                      min="0"
                                      step="0.01"
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

                                {/* Pronto Pago */}
                                <td>
                                  <InputGroup size="s">
                                    <Form.Control
                                      type="number"
                                      value={item.descuentoProntoPago}
                                      min="0"
                                      max="3"
                                      step="0.1"
                                      onChange={(e) =>
                                        actualizarDescuento(
                                          item.Part_PartNum,
                                          "descuentoProntoPago",
                                          e.target.value
                                        )
                                      }
                                      className={
                                        item.descuentoProntoPago !==
                                        descuentosGlobales.prontoPago
                                          ? "bg-warning bg-opacity-25"
                                          : ""
                                      }
                                    />
                                    <InputGroup.Text>%</InputGroup.Text>
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
                            <td colSpan="7"></td>
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
                            <td colSpan="12"></td>
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
                            <td colSpan="15" className="small">
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
              const testData = {
                cotizacion,
                cliente: clienteSeleccionado,
                listaPrecios: listaSeleccionada,
                subtotal: totalSubtotal,
                descuentos: totalDescuentos,
                iva: totalIVA,
                total: totalGeneral,
                kilogramos: totalKilogramos,
                porcentajeFormateado,
                piezasRegaladas,
                calcularDescuentos: calcularTodosDescuentos,
              };
              console.log("Datos de prueba para PDF:", testData);
              console.table(testData.cotizacion);
            }}
          >
            Ver Datos PDF
          </Button>
          <Button
            variant="success"
            className="mt-3"
            onClick={generarYEnviarPDFSegunDescuento}
          >
            Generar Cotizacíon
          </Button>
        </>
      )}
    </Container>
  );
}

export default App;
