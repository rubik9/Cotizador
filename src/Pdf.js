import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import logo from "./LogoMejorado.png"; // Asegúrate de que la ruta sea correcta
// Registrar fuentes (opcional)
Font.register({
  family: "Helvetica",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2",
      fontWeight: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4.woff2",
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 15,
    paddingBottom: 10,
  },
  companyName: {
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    textAlign: "center",
    position: "absolute",
    width: "320px",
    height: "90px",
  },
  date: {
    textAlign: "right",
    marginBottom: 10,
  },
  clientInfo: {
    position: "relative",
    top: 1,
  },
  headCliente: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "20px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 8,
    backgroundColor: "#3988fa",
    color: "#fff",
    marginBottom: 3,
  },
  headCliente2: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "20px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 8,
    backgroundColor: "#3988fa",
    color: "#fff",
    marginBottom: 3,
  },
  infoRow: {
    padding: 2,
    marginBottom: 2,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    border: "1 solid #000",
    flexDirection: "row",
  },
  infoLabel: {
    baxkgroundColor: "#022a72",
    width: "20%",
    fontWeight: "bold",
  },
  infoValue: {
    width: "30%",
  },
  comments: {
    marginVertical: 10,
    fontStyle: "italic",
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  tableRow: {
    textAlign: "center",
    flexDirection: "row",
  },
  tableColHeader: {
    color: "#fff",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#1376f0",
    padding: 5,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCol: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  // Definición de anchos específicos para cada columna
  colCodigo: { width: "8%", textAlign: "center" },
  colProducto: { width: "25%" },
  colCantidad: { width: "6%", textAlign: "center" },
  colExpedio: { width: "8%", textAlign: "center" },
  colFlete: { width: "8%", textAlign: "center" },
  colFlete2: { width: "9%", textAlign: "center" },
  colSubtotal: { width: "10%", textAlign: "center" },
  colDesc: { width: "8%", textAlign: "center" },
  colTotal: { width: "10%", textAlign: "center", fontWeight: "bold" },
  footer: {
    position: "relative",
    width: "100%",
    height: "120px",
    top: 0,
    left: 0,
    marginTop: 10,
    fontSize: 8,
    textAlign: "center",
  },
  promotions: {
    marginVertical: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  totals: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    width: "370px",
    height: "100px",
    top: 0,
    left: 551,
    fontSize: 12,
  },
  totalRow: {
    backgroundColor: "#1376f0",
    border: "1 solid #000",
    color: "#fff",
  },
  totalRowdata: {
    border: "1 solid #000",
  },
  totalRowdatas: {
    width: "50%",
  },
  totalRows: {
    width: "50%",
  },
  grandTotal: {
    fontWeight: "bold",
    fontSize: 13,
  },
  institutionalHeader: {
    marginBottom: 5,
    paddingBottom: 10,
    height: "130px",
  },
  docTitle: {
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    position: "absolute",
    width: "250px",
    height: "90px",
    top: 55,
    left: 35,
  },
  docMetas: {
    textAlign: "center",
    position: "absolute",
    width: "500px",
    top: 75,
    left: 450,
    flexDirection: "column",
  },
  docMetas2: {
    textAlign: "center",
    position: "absolute",
    width: "500px",
    top: -7,
    left: 420,
    flexDirection: "column",
  },

  docMeta: {
    textAlign: "center",
    position: "relative",
    width: "420px",
    top: 0,
    left: 400,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  docMeta1: {
    border: "1 solid #000",
    position: "absolute",
    width: "300px",
    height: "90px",
    top: 0,
    fontSize: 10,
  },
  docMeta2: {
    border: "1 solid #000",
    position: "absolute",
    width: "300px",
    height: "90px",
    top: 15,
    fontSize: 10,
  },
  docMetaItem: {
    justifyContent: "center",
    alignItems: "center",
    border: "1 solid #000",
    width: "50%",
  },
  docMetaLabel: {
    textAlign: "center",
    fontWeight: "bold",
  },
  docMetaLabel1: {
    position: "relative",
    width: "56px",
    height: "44px",
    top: 0,
    left: 0,
    textAlign: "center",
    fontWeight: "bold",
    border: "1 solid #fffff",
  },
  docMetaLabel2: {
    position: "absolute",
    width: "56px",
    height: "44px",
    top: 0,
    left: 57,
    textAlign: "center",
    fontWeight: "bold",
    border: "1 solid #fffff",
  },
  docMetaLabel3: {
    position: "absolute",
    width: "56px",
    height: "44px",
    top: 0,
    left: 113,
    textAlign: "center",
    fontWeight: "bold",
    border: "1 solid #fffff",
  },
  docDates: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 3,
    fontStyle: "italic",
  },
  separator: {
    marginTop: "350px",
    borderTop: "1 solid #fffff",
    marginVertical: 10,
  },
});

const PdfDocument = ({
  cotizacion,
  cliente,
  listaPrecios,
  kilogramos,
  porcentajeFormateado,
  porcentajeDesc,
  descuentos,
  idCotizacion,
  iva,
  total,
  usuario,
  subtotal,
  totalSubtotalConDescuento,
  totalDescUnitario,
  totalDescRegalo,
  totalDescPorcentaje,
  totalDescFijo,
  totalDescDescarga,
  descuentoProntoPagoGlobal
}) => {
  // Función para formatear números
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };
  const fechaActual = new Date();
  const fechaVigencia = new Date(fechaActual);
  fechaVigencia.setDate(fechaVigencia.getDate() + 2);

  // Calcular totales
  //
  // const subtotal = cotizacion.reduce(
  //   (sum, item) => sum + item.PriceLstParts_BasePrice * item.cantidad,
  //   0
  // );

  //   const totalFlete = cotizacion.reduce(
  //     (sum, item) => sum + (item.flete || 0),
  //     0
  
  const ivatotalSinProntoPago = (totalSubtotalConDescuento+descuentoProntoPagoGlobal) * 0.16;
  const totalGeneralSinProntoPago = (totalSubtotalConDescuento+descuentoProntoPagoGlobal) + ivatotalSinProntoPago;

  return (
    <Document>
      <Page size={[612, 1000]} orientation="landscape" style={styles.page} wrap>
        {/* Encabezado institucional */}
        <View style={styles.institutionalHeader}>
          <View style={styles.companyName}>
            <Image
              src={logo}
              style={{ width: "85%", height: "85%", borderRadius: "15px" }}
              alt="Logo"
            ></Image>
          </View>

          <View style={styles.docTitle}>
            <Text>SOLICITUD PEDIDOS MASCOTAS</Text>
          </View>

          {/* <View style={styles.docMeta}>
            <View style={styles.docMetaItem}>
              <Text>
                <Text style={styles.docMetaLabel}>Código: </Text>
                {documentCode}
              </Text>
            </View>
            <View style={styles.docMetaItem}>
              <Text>
                <Text style={styles.docMetaLabel}>No. de Revisión: </Text>
                {revisionNumber}
              </Text>
            </View>
          </View>

          <View style={styles.docMeta}>
            <View style={styles.docMetaItem}>
              <Text>
                <Text style={styles.docMetaLabel}>Vigencia: </Text>
                {fechaVigenciaFormateada}
              </Text>
            </View>
            <View style={styles.docMetaItem}>
              <Text>
                <Text style={styles.docMetaLabel}>Fecha de Cambio: </Text>
                {changeDate}
              </Text>
            </View>
            <View style={styles.docMetaItem}>
              <Text>
                <Text style={styles.docMetaLabel}>Hoja 1 de 1</Text>
              </Text>
            </View>
          </View> */}

          {/* <View style={styles.separator} /> */}

          <View style={styles.docMetas2}>
            <View style={styles.headCliente}>
              <Text>Folio</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{idCotizacion}</Text>
            </View>
          </View>
        </View>

        {/* Datos del cliente */}
        <View style={styles.docMetas}>
          <View style={styles.headCliente}>
            <Text>Datos de cliente</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cliente:</Text>
            <Text style={styles.infoLabel}>
              {cliente?.Customer_Name || "No especificado"}
            </Text>
            <Text style={styles.infoLabel}>ID</Text>
            <Text style={styles.infoValue}>
              {cliente?.Customer_CustNum || "0"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lista Precios:</Text>
            <Text style={{ ...styles.infoValue }}>{listaPrecios || "0"}</Text>
            <Text style={styles.infoLabel}>Classificación:</Text>
            <Text style={styles.infoValue}>
              {cliente?.Clasificacion || "0"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Territorio:</Text>
            <Text style={styles.infoValue}>{cliente?.Territorio || "0"}</Text>
            <Text style={styles.infoLabel}>Desc. Prontopago</Text>
            <Text style={styles.infoValue}>
              {porcentajeDesc || "0"}%
            </Text>
          </View>
        </View>

        {/* Comentarios */}
        <View style={styles.comments}>
          <Text>
            Fecha de Elaboración: {new Date().toISOString().slice(0, 10)}
          </Text>
        </View>

        {/* Tabla de productos */}
        <View style={styles.table} wrap>
          {/* Encabezados */}
          <View style={styles.headCliente2}>
            <Text>Cotización</Text>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, styles.colCodigo]}>
              <Text>Código</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colProducto]}>
              <Text>Producto</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colCantidad]}>
              <Text>Cantidad</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colExpedio]}>
              <Text>PushMoney</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colFlete]}>
              <Text>Sacos 1 en ...</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colFlete2]}>
              <Text>Pz de regalo</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colExpedio]}>
              <Text>Apoyo Extra %</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colExpedio]}>
              <Text>Otro $</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colExpedio]}>
              <Text>Descarga $</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colSubtotal]}>
              <Text>$ x saco</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colSubtotal]}>
              <Text>$ saco con des</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colDesc]}>
              <Text>Desc</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colTotal]}>
              <Text>subtotal</Text>
            </View>
          </View>

          {/* Productos */}
          {cotizacion.map((item, index) => {
            const precioSacodesc =
              item.subtotalConDescuento / item.cantidadTotal;

            return (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCol, styles.colCodigo]}>
                  <Text>{item.Part_PartNum}</Text>
                </View>
                <View style={[styles.tableCol, styles.colProducto]}>
                  <Text>{item.Part_PartDescription}</Text>
                </View>
                <View style={[styles.tableCol, styles.colCantidad]}>
                  <Text>{item.cantidadTotal}</Text>
                </View>
                <View style={[styles.tableCol, styles.colExpedio]}>
                  <Text>{item.descuentoUnitario || "0"}</Text>
                </View>
                <View style={[styles.tableCol, styles.colFlete]}>
                  <Text>{item.unidadesParaRegalo || 0}</Text>
                </View>
                <View style={[styles.tableCol, styles.colFlete2]}>
                  <Text>{item.piezasRegaladas || 0}</Text>
                </View>
                <View style={[styles.tableCol, styles.colExpedio]}>
                  <Text>{item.descuentoPorcentaje || "0"}</Text>
                </View>
                <View style={[styles.tableCol, styles.colExpedio]}>
                  <Text>{item.descuentoFijo || "0"}</Text>
                </View>
                <View style={[styles.tableCol, styles.colExpedio]}>
                  <Text>{item.descuentoDescarga || "0"}</Text>
                </View>

                <View style={[styles.tableCol, styles.colSubtotal]}>
                  <Text>{formatCurrency(item.PriceLstParts_BasePrice)}</Text>
                </View>
                <View style={[styles.tableCol, styles.colSubtotal]}>
                  <Text>{formatCurrency(precioSacodesc)}</Text>
                </View>
                <View style={[styles.tableCol, styles.colDesc]}>
                  <Text>{formatCurrency(item.totalDescuentos)}</Text>
                </View>
                <View style={[styles.tableCol, styles.colTotal]}>
                  <Text>{formatCurrency(item.subtotalConDescuento)}</Text>
                </View>
              </View>
            );
          })}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, styles.colCodigo]}>
              <Text></Text>
            </View>
            <View style={[styles.tableColHeader, styles.colProducto]}>
              <Text>Desglose de Descuentos</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colCantidad]}>
              <Text></Text>
            </View>
            <View style={[styles.tableColHeader, styles.colExpedio]}>
              <Text>${totalDescUnitario.toFixed(2)} </Text>
            </View>
            <View style={[styles.tableColHeader, styles.colFlete]}>
              <Text></Text>
            </View>
            <View style={[styles.tableColHeader, styles.colFlete2]}>
              <Text>${totalDescRegalo.toFixed(2)}</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colExpedio]}>
              <Text>${totalDescPorcentaje.toFixed(2)}</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colExpedio]}>
              <Text>${totalDescFijo.toFixed(2)} </Text>
            </View>
            <View style={[styles.tableColHeader, styles.colExpedio]}>
              <Text>${totalDescDescarga.toFixed(2)}</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colSubtotal]}>
              <Text></Text>
            </View>
            <View style={[styles.tableColHeader, styles.colSubtotal]}>
              <Text></Text>
            </View>
            <View style={[styles.tableColHeader, styles.colDesc]}>
              <Text></Text>
            </View>
            <View style={[styles.tableColHeader, styles.colTotal]}>
              <Text>
                {formatCurrency(totalSubtotalConDescuento.toFixed(2))}
              </Text>
            </View>
          </View>
        </View>

        {/* Información de pie de página */}
        <View style={styles.footer}>
          <View style={styles.docMeta2}>
            <Text>
              Lista de precios vigente: {new Date().toISOString().slice(0, 10)}
            </Text>
            <Text>Cotización elaborada por: {usuario || "No definido"}</Text>
            <Text>Los precios expresados están en Pesos Mexicanos.</Text>
            <Text>Precios sujetos a cambio sin previo aviso.</Text>
            <Text>La disponibilidad de los productos puede variar.</Text>
          </View>
          <View style={styles.totals}>
            <View style={styles.totalRows}>
              <View style={styles.totalRow}>
                <Text>Peso Total KG</Text>
              </View>

              <View style={styles.totalRow}>
                <Text>Subtotal:</Text>
              </View>

              <View style={styles.totalRow}>
                <Text>Descuento:</Text>
              </View>
              <View style={styles.totalRow}>
                <Text>Descuento (%): </Text>
              </View>
              <View style={styles.totalRow}>
                <Text>IVA</Text>
              </View>

              <View style={{ ...styles.totalRow, ...styles.grandTotal }}>
                <Text>Total pronto pago</Text>
              </View>
              <View style={{ ...styles.totalRow, ...styles.grandTotal }}>
                <Text>Total sin pronto pago</Text>
              </View>
            </View>

            <View style={styles.totalRowdatas}>
              <View style={styles.totalRowdata}>
                <Text>{kilogramos.toLocaleString("es-MX")}</Text>
              </View>
              <View style={styles.totalRowdata}>
                <Text>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.totalRowdata}>
                <Text>-{formatCurrency(descuentos)}</Text>
              </View>
              <View style={styles.totalRowdata}>
                <Text>{porcentajeFormateado}%</Text>
              </View>
              <View style={styles.totalRowdata}>
                <Text>{formatCurrency(iva)}</Text>
              </View>
              <View style={{ ...styles.totalRowdata, ...styles.grandTotal }}>
                <Text>{formatCurrency(total)}</Text>
              </View>
              <View style={{ ...styles.totalRowdata, ...styles.grandTotal }}>
                <Text>{formatCurrency( totalGeneralSinProntoPago)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Promociones */}

        {/* Totales */}
      </Page>
    </Document>
  );
};

export default PdfDocument;
