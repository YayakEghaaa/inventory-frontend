import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// API
import { dashboardAPI } from "services/api";

// Icons
import Icon from "@mui/material/Icon";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProduk: 0,
    totalSupplier: 0,
    totalCustomer: 0,
    totalKategori: 0,
    totalTransaksi: 0,
    produkList: [],
    transaksiList: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hitung produk stok menipis
  const produkStokMenipis = stats.produkList.filter((p) => p.stok <= p.stok_minimum).length;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Dashboard Inventory System
          </MDTypography>
          <MDTypography variant="button" color="text">
            Overview statistik sistem inventory
          </MDTypography>
        </MDBox>

        {loading ? (
          <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <MDTypography variant="h6">Loading data...</MDTypography>
          </MDBox>
        ) : (
          <>
            {/* Statistics Cards */}
            <Grid container spacing={3} mb={3}>
              {/* Total Produk */}
              <Grid item xs={12} md={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="dark"
                    icon="inventory_2"
                    title="Total Produk"
                    count={stats.totalProduk}
                    percentage={{
                      color: produkStokMenipis > 0 ? "error" : "success",
                      amount: produkStokMenipis > 0 ? `-${produkStokMenipis}` : "0",
                      label: "stok menipis",
                    }}
                  />
                </MDBox>
              </Grid>

              {/* Total Supplier */}
              <Grid item xs={12} md={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    icon="local_shipping"
                    title="Total Supplier"
                    count={stats.totalSupplier}
                    percentage={{
                      color: "success",
                      amount: "",
                      label: "supplier aktif",
                    }}
                  />
                </MDBox>
              </Grid>

              {/* Total Customer */}
              <Grid item xs={12} md={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="success"
                    icon="people"
                    title="Total Customer"
                    count={stats.totalCustomer}
                    percentage={{
                      color: "success",
                      amount: "",
                      label: "customer terdaftar",
                    }}
                  />
                </MDBox>
              </Grid>

              {/* Total Transaksi */}
              <Grid item xs={12} md={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="primary"
                    icon="receipt_long"
                    title="Total Transaksi"
                    count={stats.totalTransaksi}
                    percentage={{
                      color: "success",
                      amount: "",
                      label: "transaksi tercatat",
                    }}
                  />
                </MDBox>
              </Grid>
            </Grid>

            {/* Produk Stok Menipis */}
            {produkStokMenipis > 0 && (
              <MDBox mb={3}>
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={3}
                  borderRadius="lg"
                  bgColor="error"
                  variant="gradient"
                >
                  <MDBox>
                    <MDTypography variant="h6" color="white" fontWeight="medium">
                      ⚠️ Peringatan Stok
                    </MDTypography>
                    <MDTypography variant="button" color="white">
                      Ada {produkStokMenipis} produk dengan stok menipis!
                    </MDTypography>
                  </MDBox>
                  <Icon fontSize="large" sx={{ color: "white" }}>
                    warning
                  </Icon>
                </MDBox>
              </MDBox>
            )}

            {/* Transaksi Terbaru */}
            <MDBox>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Transaksi Terbaru
              </MDTypography>
              <Grid container spacing={2}>
                {stats.transaksiList.slice(0, 5).map((transaksi) => (
                  <Grid item xs={12} key={transaksi.id}>
                    <MDBox
                      p={2}
                      borderRadius="lg"
                      sx={{
                        backgroundColor: ({ palette, functions: { rgba } }) =>
                          rgba(palette.grey[400], 0.1),
                        border: ({ borders, palette }) =>
                          `${borders.borderWidth[1]} solid ${palette.grey[300]}`,
                      }}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <MDBox>
                        <MDTypography variant="button" fontWeight="medium" color="text">
                          {transaksi.nomor_transaksi}
                        </MDTypography>
                        <MDTypography variant="caption" color="text" display="block">
                          {transaksi.jenis_transaksi} • {transaksi.customer_nama || "-"}
                        </MDTypography>
                      </MDBox>
                      <MDBox textAlign="right">
                        <MDTypography variant="button" fontWeight="medium" color="success">
                          Rp {transaksi.total_keseluruhan.toLocaleString("id-ID")}
                        </MDTypography>
                        <MDTypography variant="caption" color="text" display="block">
                          {new Date(transaksi.tanggal_transaksi).toLocaleDateString("id-ID")}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </Grid>
                ))}
              </Grid>
            </MDBox>
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
