import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import { kategoriAPI } from "services/api";

// Import hook untuk deteksi dark mode
import { useMaterialUIController } from "context";

function Kategori() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentKategori, setCurrentKategori] = useState(null);

  const [formData, setFormData] = useState({
    nama_kategori: "",
    deskripsi: "",
  });

  useEffect(() => {
    fetchKategori();
  }, []);

  const fetchKategori = async () => {
    try {
      setLoading(true);
      const response = await kategoriAPI.getAll();
      setKategoriList(response.data.results || []);
    } catch (error) {
      console.error("Error fetching kategori:", error);
      alert("Gagal memuat data kategori");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (kategori = null) => {
    if (kategori) {
      setIsEdit(true);
      setCurrentKategori(kategori);
      setFormData({
        nama_kategori: kategori.nama_kategori,
        deskripsi: kategori.deskripsi || "",
      });
    } else {
      setIsEdit(false);
      setCurrentKategori(null);
      setFormData({
        nama_kategori: "",
        deskripsi: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ nama_kategori: "", deskripsi: "" });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await kategoriAPI.update(currentKategori.id, formData);
        alert("Kategori berhasil diupdate!");
      } else {
        await kategoriAPI.create(formData);
        alert("Kategori berhasil ditambahkan!");
      }
      handleCloseDialog();
      fetchKategori();
    } catch (error) {
      console.error("Error saving kategori:", error);
      alert(
        "Gagal menyimpan kategori: " + (error.response?.data?.nama_kategori?.[0] || error.message)
      );
    }
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Yakin ingin menghapus kategori "${nama}"?`)) {
      try {
        await kategoriAPI.delete(id);
        alert("Kategori berhasil dihapus!");
        fetchKategori();
      } catch (error) {
        console.error("Error deleting kategori:", error);
        alert("Gagal menghapus kategori. Mungkin masih digunakan di produk.");
      }
    }
  };

  // Styling untuk Input Field
  const inputStyles = {
    "& .MuiInputBase-input": {
      color: darkMode ? "#fff" : "#000",
    },
    "& .MuiInputLabel-root": {
      color: darkMode ? "#adb5bd" : "#000",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: darkMode ? "#fff" : "#1a73e8",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: darkMode ? "#4a5568" : "#d2d6da",
      },
      "&:hover fieldset": {
        borderColor: darkMode ? "#fff" : "#000",
      },
      "&.Mui-focused fieldset": {
        borderColor: darkMode ? "#1a73e8" : "#1a73e8",
      },
    },
  };

  const columns = [
    { Header: "ID", accessor: "id", width: "10%", align: "left" },
    { Header: "Nama Kategori", accessor: "nama_kategori", width: "30%", align: "left" },
    { Header: "Deskripsi", accessor: "deskripsi", width: "40%", align: "left" },
    { Header: "Jumlah Produk", accessor: "jumlah_produk", width: "10%", align: "center" },
    { Header: "Action", accessor: "action", width: "10%", align: "center" },
  ];

  const rows = kategoriList.map((kategori) => ({
    id: kategori.id,
    nama_kategori: kategori.nama_kategori,
    deskripsi: kategori.deskripsi || "-",
    jumlah_produk: kategori.jumlah_produk || 0,
    action: (
      <MDBox display="flex" gap={1}>
        <MDButton variant="text" color="info" iconOnly onClick={() => handleOpenDialog(kategori)}>
          <Icon>edit</Icon>
        </MDButton>
        <MDButton
          variant="text"
          color="error"
          iconOnly
          onClick={() => handleDelete(kategori.id, kategori.nama_kategori)}
        >
          <Icon>delete</Icon>
        </MDButton>
      </MDBox>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Data Kategori
                </MDTypography>
                <MDButton variant="gradient" color="dark" onClick={() => handleOpenDialog()}>
                  <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                  &nbsp;Tambah Kategori
                </MDButton>
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6">Loading...</MDTypography>
                  </MDBox>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Dialog Form */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: darkMode ? "#1a2035" : "#fff",
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, color: darkMode ? "#fff" : "#000" }}>
          {isEdit ? "Edit Kategori" : "Tambah Kategori Baru"}
        </DialogTitle>
        <DialogContent>
          <MDBox component="form" p={2}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Nama Kategori"
                name="nama_kategori"
                value={formData.nama_kategori}
                onChange={handleInputChange}
                fullWidth
                required
                sx={inputStyles}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Deskripsi"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                sx={inputStyles}
              />
            </MDBox>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleCloseDialog} color="secondary">
            Batal
          </MDButton>
          <MDButton onClick={handleSubmit} color="info" variant="gradient">
            {isEdit ? "Update" : "Simpan"}
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default Kategori;
