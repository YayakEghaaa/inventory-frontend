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

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import { supplierAPI } from "services/api";

// Import hook untuk deteksi dark mode
import { useMaterialUIController } from "context";

function Supplier() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [supplierList, setSupplierList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);

  const [formData, setFormData] = useState({
    nama_supplier: "",
    kontak: "",
    email: "",
    alamat: "",
    status: "AKTIF",
  });

  useEffect(() => {
    fetchSupplier();
  }, []);

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      const response = await supplierAPI.getAll();
      setSupplierList(response.data.results || []);
    } catch (error) {
      console.error("Error fetching supplier:", error);
      alert("Gagal memuat data supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (supplier = null) => {
    if (supplier) {
      setIsEdit(true);
      setCurrentSupplier(supplier);
      setFormData({
        nama_supplier: supplier.nama_supplier,
        kontak: supplier.kontak,
        email: supplier.email || "",
        alamat: supplier.alamat,
        status: supplier.status || "AKTIF",
      });
    } else {
      setIsEdit(false);
      setCurrentSupplier(null);
      setFormData({
        nama_supplier: "",
        kontak: "",
        email: "",
        alamat: "",
        status: "AKTIF",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      nama_supplier: "",
      kontak: "",
      email: "",
      alamat: "",
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
      if (isEdit) {
        await supplierAPI.update(currentSupplier.id, formData);
        alert("Supplier berhasil diupdate!");
      } else {
        await supplierAPI.create(formData);
        alert("Supplier berhasil ditambahkan!");
      }
      handleCloseDialog();
      fetchSupplier();
    } catch (error) {
      console.error("Error saving supplier:", error);
      alert(
        "Gagal menyimpan supplier: " + (error.response?.data?.nama_supplier?.[0] || error.message)
      );
    }
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Yakin ingin menghapus supplier "${nama}"?`)) {
      try {
        await supplierAPI.delete(id);
        alert("Supplier berhasil dihapus!");
        fetchSupplier();
      } catch (error) {
        console.error("Error deleting supplier:", error);
        alert("Gagal menghapus supplier. Mungkin masih digunakan di produk.");
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
    { Header: "ID", accessor: "id", width: "5%", align: "left" },
    { Header: "Nama Supplier", accessor: "nama_supplier", width: "20%", align: "left" },
    { Header: "Kontak", accessor: "kontak", width: "15%", align: "left" },
    { Header: "Email", accessor: "email", width: "20%", align: "left" },
    { Header: "Alamat", accessor: "alamat", width: "25%", align: "left" },
    { Header: "Status", accessor: "status", width: "10%", align: "center" },
    { Header: "Action", accessor: "action", width: "5%", align: "center" },
  ];

  const rows = supplierList.map((supplier) => ({
    id: supplier.id,
    nama_supplier: supplier.nama_supplier,
    kontak: supplier.kontak,
    email: supplier.email || "-",
    alamat: supplier.alamat,
    status: (
      <MDTypography
        variant="caption"
        color={supplier.status === "AKTIF" ? "success" : "error"}
        fontWeight="medium"
      >
        {supplier.status}
      </MDTypography>
    ),
    action: (
      <MDBox display="flex" gap={1}>
        <MDButton variant="text" color="info" iconOnly onClick={() => handleOpenDialog(supplier)}>
          <Icon>edit</Icon>
        </MDButton>
        <MDButton
          variant="text"
          color="error"
          iconOnly
          onClick={() => handleDelete(supplier.id, supplier.nama_supplier)}
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
                  Data Supplier
                </MDTypography>
                <MDButton variant="gradient" color="dark" onClick={() => handleOpenDialog()}>
                  <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                  &nbsp;Tambah Supplier
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
          {isEdit ? "Edit Supplier" : "Tambah Supplier Baru"}
        </DialogTitle>
        <DialogContent>
          <MDBox component="form" p={2}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Nama Supplier"
                name="nama_supplier"
                value={formData.nama_supplier}
                onChange={handleInputChange}
                fullWidth
                required
                sx={inputStyles}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Kontak"
                name="kontak"
                value={formData.kontak}
                onChange={handleInputChange}
                fullWidth
                required
                sx={inputStyles}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                sx={inputStyles}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Alamat"
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                required
                sx={inputStyles}
              />
            </MDBox>
            <MDBox mb={2}>
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

export default Supplier;
