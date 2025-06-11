import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image
} from "@react-pdf/renderer";
import logo from './LogoAlbapesa2.png'; // Asegúrate de que la ruta sea correcta
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
    borderBottom: "1 solid #000",
    paddingBottom: 10,
  },
  companyName: {
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    textAlign: "center",
    position: "absolute",
    width: "320px",
    height: "90px",
    border: "1 solid #000",
  },
  date: {
    textAlign: "right",
    marginBottom: 10,
  },
  clientInfo: {
    position: "relative",
    top: 1,
  },
  headCliente:{
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
   colFlete2: { width: "6%", textAlign: "center" },
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
    width: "250px",
    height: "90px",
    top: 0,
    left: 491,
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
    marginBottom: 10,
    border: "1 solid #000",
    paddingBottom: 10,
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
    top: 0,
    left: 321,
    border: "1 solid #000",
  },
  docMeta: {
    textAlign: "center",
    position: "relative",
    width: "209px",
    height: "45px",
    top: 0,
    left: 571,
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
  comentarios,
  porcentajeFormateado,
  calcularDescuentos,
  documentCode = "FO-MS19-01",
  revisionNumber = "01",
  changeDate = "25/10/2022",
  idCotizacion,
  usuario
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

const fechaVigenciaFormateada = fechaVigencia.toLocaleDateString('es-MX', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
});


  // Calcular totales
  const pesoTotal = cotizacion.reduce(
    (sum, item) => sum + item.Part_GrossWeight * item.cantidad,
    0
  );
  const subtotal = cotizacion.reduce(
    (sum, item) => sum + item.PriceLstParts_BasePrice * item.cantidad,
    0
  );
  const totalDescuentos = cotizacion.reduce(
    (sum, item) => sum + calcularDescuentos(item).totalDescuentos,
    0
  );
  //   const totalFlete = cotizacion.reduce(
  //     (sum, item) => sum + (item.flete || 0),
  //     0
  //   );
  const iva = (subtotal - totalDescuentos) * 0.16;
  const totalGeneral = subtotal - totalDescuentos + iva; //+ totalFlete

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Encabezado institucional */}
        <View style={styles.institutionalHeader}>
          <View style={styles.companyName}>
            <Image
              src={logo}
              style={{ width: "75%", height: "75%",borderRadius: "15px" }}
              alt="Logo"
              ></Image>
          </View>

          <View style={styles.docTitle}>
            <Text>SOLICITUD PEDIDOS MASCOTAS</Text>
          </View>

          <View style={styles.docMeta}>
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
          </View>

          {/* <View style={styles.separator} /> */}

          <View style={styles.docDates}>
            <Text>
              <Text style={styles.docMetaLabelDates1}>
                Fecha de Elaboración: {new Date().toISOString().slice(0, 10)}
              </Text>
            </Text>
            <Text>
              <Text style={styles.docMetaLabelDates2}>Cotización: </Text>
              {idCotizacion}
            </Text>
          </View>
        </View>

        {/* Datos del cliente */}
        <View style={styles.clientInfo}>
            <View style={styles.headCliente}>
                <Text >
                    Datos de cliente
                </Text>
            </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cliente:</Text>
            <Text style={styles.infoValue}>
              {cliente?.Customer_Name || "No especificado"}
            </Text>
            <Text style={styles.infoLabel}>ID</Text>
            <Text style={styles.infoValue}>
              {cliente?.Customer_CustNum || "N/A"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lista Precios:</Text>
            <Text style={{ ...styles.infoValue }}>
              {listaPrecios || "N/A"}
            </Text>
            <Text style={styles.infoLabel}>Classificación:</Text>
            <Text style={styles.infoValue}>
              {cliente?.Clasificacion || "N/A"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Territorio:</Text>
            <Text style={styles.infoValue}>{cliente?.Territorio || "N/A"}</Text>
            <Text style={styles.infoLabel}>Desc. Masc.:</Text>
            <Text style={styles.infoValue}>
              {cliente?.DescuentoMascotas || "0%"}
            </Text>
          </View>
        </View>

        {/* Comentarios */}
        <View style={styles.comments}>
          <Text>Comentarios: {comentarios || "Sin comentarios"}</Text>
        </View>

        {/* Tabla de productos */}
        <View style={styles.table}>
          {/* Encabezados */}
          <View style={styles.headCliente}>
                <Text >
                    Cotización
                </Text>
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
            <View style={[styles.tableColHeader, styles.colExpedio]}>
              <Text>Pronto Pago %</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colSubtotal]}>
              <Text>SubTotal</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colDesc]}>
              <Text>Desc</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colTotal]}>
              <Text>Total</Text>
            </View>
          </View>

          {/* Productos */}
          {cotizacion.map((item, index) => {
            const itemSubtotal = item.PriceLstParts_BasePrice * item.cantidad;
            const itemDescuentos = calcularDescuentos(item).totalDescuentos;
            const itemTotal = itemSubtotal - itemDescuentos + (item.flete || 0);

            return (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCol, styles.colCodigo]}>
                  <Text>{item.Part_PartNum}</Text>
                </View>
                <View style={[styles.tableCol, styles.colProducto]}>
                  <Text>{item.Part_PartDescription}</Text>
                </View>
                <View style={[styles.tableCol, styles.colCantidad]}>
                  <Text>{item.cantidad}</Text>
                </View>
                <View style={[styles.tableCol, styles.colExpedio]}>
                  <Text>{item.descuentoUnitario || "N/A"}</Text>
                </View>
                <View style={[styles.tableCol, styles.colFlete]}>
                  <Text>{item.unidadesParaRegalo || 0}</Text>
                </View>
                <View style={[styles.tableCol, styles.colFlete2]}>
                  <Text>{item.piezasRegaladas || 0}</Text>
                </View>
                <View style={[styles.tableCol, styles.colExpedio]}>
                  <Text>{item.descuentoPorcentaje || "N/A"}</Text>
                </View>
                <View style={[styles.tableCol, styles.colExpedio]}>
                  <Text>{item.descuentoFijo || "N/A"}</Text>
                </View>
                <View style={[styles.tableCol, styles.colExpedio]}>
                  <Text>{item.descuentoDescarga || "N/A"}</Text>
                </View>
                <View style={[styles.tableCol, styles.colExpedio]}>
                  <Text>{item.descuentoProntoPago || "N/A"}</Text>
                </View>

                <View style={[styles.tableCol, styles.colSubtotal]}>
                  <Text>{formatCurrency(itemSubtotal)}</Text>
                </View>
                <View style={[styles.tableCol, styles.colDesc]}>
                  <Text>{formatCurrency(itemDescuentos)}</Text>
                </View>
                <View style={[styles.tableCol, styles.colTotal]}>
                  <Text>{formatCurrency(itemTotal)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Información de pie de página */}
        <View style={styles.footer}>
          <View style={styles.docMeta1}>
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
                <Text>IVA Mascotas</Text>
              </View>

              <View style={{ ...styles.totalRow, ...styles.grandTotal }}>
                <Text>Total:</Text>
              </View>
            </View>

            <View style={styles.totalRowdatas}>
              <View style={styles.totalRowdata}>
                <Text>{pesoTotal.toLocaleString("es-MX")}</Text>
              </View>
              <View style={styles.totalRowdata}>
                <Text>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.totalRowdata}>
                <Text>-{formatCurrency(totalDescuentos)}</Text>
              </View>
              <View style={styles.totalRowdata}>
                <Text>{porcentajeFormateado}%</Text>
              </View>
              <View style={styles.totalRowdata}>
                <Text>{formatCurrency(iva)}</Text>
              </View>
              <View style={{ ...styles.totalRowdata, ...styles.grandTotal }}>
                <Text>{formatCurrency(totalGeneral)}</Text>
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
