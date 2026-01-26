import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import { produkAPI, supplierAPI, kategoriAPI } from "services/api";

// Import hook untuk deteksi dark mode
import { useMaterialUIController } from "context";

function Produk() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [produkList, setProdukList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentProduk, setCurrentProduk] = useState(null);

  const [formData, setFormData] = useState({
    kode_produk: "",
    nama_produk: "",
    kategori: "",
    supplier: "",
    harga_beli: "",
    harga_jual: "",
    stok: 0,
    stok_minimum: 5,
    status: "AKTIF",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [produkRes, supplierRes, kategoriRes] = await Promise.all([
        produkAPI.getAll(),
        supplierAPI.getAll(),
        kategoriAPI.getAll(),
      ]);
      setProdukList(produkRes.data.results || []);
      setSupplierList(supplierRes.data.results || []);
      setKategoriList(kategoriRes.data.results || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (produk = null) => {
    if (produk) {
      setIsEdit(true);
      setCurrentProduk(produk);
      setFormData({
        kode_produk: produk.kode_produk,
        nama_produk: produk.nama_produk,
        kategori: produk.kategori,
        supplier: produk.supplier,
        harga_beli: produk.harga_beli,
        harga_jual: produk.harga_jual,
        stok: produk.stok,
        stok_minimum: produk.stok_minimum,
        status: produk.status,
      });
    } else {
      setIsEdit(false);
      setCurrentProduk(null);
      setFormData({
        kode_produk: "",
        nama_produk: "",
        kategori: "",
        supplier: "",
        harga_beli: "",
        harga_jual: "",
        stok: 0,
        stok_minimum: 5,
        status: "AKTIF",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      kode_produk: "",
      nama_produk: "",
      kategori: "",
      supplier: "",
      harga_beli: "",
      harga_jual: "",
      stok: 0,
      stok_minimum: 5,
      status: "AKTIF",
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        kategori: Number(formData.kategori),
        supplier: Number(formData.supplier),
        harga_beli: Number(formData.harga_beli),
        harga_jual: Number(formData.harga_jual),
        stok: Number(formData.stok),
        stok_minimum: Number(formData.stok_minimum),
      };

      if (isEdit) {
        await produkAPI.update(currentProduk.id, payload);
        alert("Produk berhasil diupdate!");
      } else {
        await produkAPI.create(payload);
        alert("Produk berhasil ditambahkan!");
      }

      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error("Backend error:", error.response?.data);
      alert("Gagal menyimpan produk");
    }
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Yakin ingin menghapus produk "${nama}"?`)) {
      try {
        await produkAPI.delete(id);
        alert("Produk berhasil dihapus!");
        fetchData();
      } catch (error) {
        console.error("Error deleting produk:", error);
        alert("Gagal menghapus produk. Mungkin masih digunakan di transaksi.");
      }
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
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

  // Styling untuk Select Field
  const selectStyles = {
    height: "45px",
    color: darkMode ? "#fff" : "#000",
    backgroundColor: "transparent",
    "& .MuiSelect-select": {
      color: darkMode ? "#fff" : "#000",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: darkMode ? "#4a5568" : "#d2d6da",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: darkMode ? "#fff" : "#000",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: darkMode ? "#1a73e8" : "#1a73e8",
    },
    "& .MuiSvgIcon-root": {
      color: darkMode ? "#fff" : "#000",
    },
  };

  const columns = [
    { Header: "Kode", accessor: "kode_produk", width: "10%", align: "left" },
    { Header: "Nama Produk", accessor: "nama_produk", width: "20%", align: "left" },
    { Header: "Kategori", accessor: "kategori_nama", width: "12%", align: "left" },
    { Header: "Supplier", accessor: "supplier_nama", width: "15%", align: "left" },
    { Header: "Harga Beli", accessor: "harga_beli", width: "12%", align: "right" },
    { Header: "Harga Jual", accessor: "harga_jual", width: "12%", align: "right" },
    { Header: "Stok", accessor: "stok", width: "8%", align: "center" },
    { Header: "Status", accessor: "status", width: "8%", align: "center" },
    { Header: "Action", accessor: "action", width: "8%", align: "center" },
  ];

  const rows = produkList.map((produk) => ({
    kode_produk: produk.kode_produk,
    nama_produk: produk.nama_produk,
    kategori_nama: produk.kategori_nama || "-",
    supplier_nama: produk.supplier_nama || "-",
    harga_beli: formatRupiah(produk.harga_beli),
    harga_jual: formatRupiah(produk.harga_jual),
    stok: produk.is_stok_menipis ? (
      <Chip label={produk.stok} color="error" size="small" />
    ) : (
      <Chip label={produk.stok} color="success" size="small" />
    ),
    status: (
      <MDTypography
        variant="caption"
        color={produk.status === "AKTIF" ? "success" : "error"}
        fontWeight="medium"
      >
        {produk.status}
      </MDTypography>
    ),
    action: (
      <MDBox display="flex" gap={1}>
        <MDButton variant="text" color="info" iconOnly onClick={() => handleOpenDialog(produk)}>
          <Icon>edit</Icon>
        </MDButton>
        <MDButton
          variant="text"
          color="error"
          iconOnly
          onClick={() => handleDelete(produk.id, produk.nama_produk)}
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
                  Data Produk
                </MDTypography>
                <MDButton variant="gradient" color="dark" onClick={() => handleOpenDialog()}>
                  <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                  &nbsp;Tambah Produk
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
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: darkMode ? "#1a2035" : "#fff",
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, color: darkMode ? "#fff" : "#000" }}>
          {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
        </DialogTitle>
        <DialogContent>
          <MDBox component="form" p={2}>
            <Grid container spacing={2}>
              {/* Kode Produk */}
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="Kode Produk"
                  name="kode_produk"
                  value={formData.kode_produk}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  disabled={isEdit}
                  sx={inputStyles}
                />
              </Grid>

              {/* Nama Produk */}
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="Nama Produk"
                  name="nama_produk"
                  value={formData.nama_produk}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  sx={inputStyles}
                />
              </Grid>

              {/* Kategori */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel
                    id="kategori-label"
                    sx={{
                      color: darkMode ? "#adb5bd" : "#000",
                      "&.Mui-focused": {
                        color: darkMode ? "#fff" : "#1a73e8",
                      },
                    }}
                  >
                    Kategori
                  </InputLabel>
                  <Select
                    labelId="kategori-label"
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleInputChange}
                    label="Kategori"
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: darkMode ? "#1a2035" : "#fff",
                          "& .MuiMenuItem-root": {
                            color: darkMode ? "#fff" : "#000",
                            "&:hover": {
                              backgroundColor: darkMode ? "#2d3748" : "#f0f2f5",
                            },
                            "&.Mui-selected": {
                              backgroundColor: darkMode ? "#344767" : "#e3f2fd",
                              "&:hover": {
                                backgroundColor: darkMode ? "#3d5278" : "#d1e7ff",
                              },
                            },
                          },
                        },
                      },
                    }}
                    sx={selectStyles}
                  >
                    {kategoriList.map((kat) => (
                      <MenuItem key={kat.id} value={kat.id}>
                        {kat.nama_kategori}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Supplier */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel
                    id="supplier-label"
                    sx={{
                      color: darkMode ? "#adb5bd" : "#000",
                      "&.Mui-focused": {
                        color: darkMode ? "#fff" : "#1a73e8",
                      },
                    }}
                  >
                    Supplier
                  </InputLabel>
                  <Select
                    labelId="supplier-label"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    label="Supplier"
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: darkMode ? "#1a2035" : "#fff",
                          "& .MuiMenuItem-root": {
                            color: darkMode ? "#fff" : "#000",
                            "&:hover": {
                              backgroundColor: darkMode ? "#2d3748" : "#f0f2f5",
                            },
                            "&.Mui-selected": {
                              backgroundColor: darkMode ? "#344767" : "#e3f2fd",
                              "&:hover": {
                                backgroundColor: darkMode ? "#3d5278" : "#d1e7ff",
                              },
                            },
                          },
                        },
                      },
                    }}
                    sx={selectStyles}
                  >
                    {supplierList.map((sup) => (
                      <MenuItem key={sup.id} value={sup.id}>
                        {sup.nama_supplier}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Harga Beli */}
              <Grid item xs={12} md={6}>
                <MDInput
                  type="number"
                  label="Harga Beli"
                  name="harga_beli"
                  value={formData.harga_beli}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  sx={inputStyles}
                />
              </Grid>

              {/* Harga Jual */}
              <Grid item xs={12} md={6}>
                <MDInput
                  type="number"
                  label="Harga Jual"
                  name="harga_jual"
                  value={formData.harga_jual}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  sx={inputStyles}
                />
              </Grid>

              {/* Stok */}
              <Grid item xs={12} md={4}>
                <MDInput
                  type="number"
                  label="Stok"
                  name="stok"
                  value={formData.stok}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  sx={inputStyles}
                />
              </Grid>

              {/* Stok Minimum */}
              <Grid item xs={12} md={4}>
                <MDInput
                  type="number"
                  label="Stok Minimum"
                  name="stok_minimum"
                  value={formData.stok_minimum}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  sx={inputStyles}
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel
                    id="status-label"
                    sx={{
                      color: darkMode ? "#adb5bd" : "#000",
                      "&.Mui-focused": {
                        color: darkMode ? "#fff" : "#1a73e8",
                      },
                    }}
                  >
                    Status
                  </InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    label="Status"
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: darkMode ? "#1a2035" : "#fff",
                          "& .MuiMenuItem-root": {
                            color: darkMode ? "#fff" : "#000",
                            "&:hover": {
                              backgroundColor: darkMode ? "#2d3748" : "#f0f2f5",
                            },
                            "&.Mui-selected": {
                              backgroundColor: darkMode ? "#344767" : "#e3f2fd",
                              "&:hover": {
                                backgroundColor: darkMode ? "#3d5278" : "#d1e7ff",
                              },
                            },
                          },
                        },
                      },
                    }}
                    sx={selectStyles}
                  >
                    <MenuItem value="AKTIF">Aktif</MenuItem>
                    <MenuItem value="NON_AKTIF">Non-Aktif</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
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

export default Produk;
