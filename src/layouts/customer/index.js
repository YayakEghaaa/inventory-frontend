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

import { customerAPI } from "services/api";

// Import hook untuk deteksi dark mode
import { useMaterialUIController } from "context";

function Customer() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);

  const [formData, setFormData] = useState({
    nama_customer: "",
    no_telepon: "",
    email: "",
    alamat: "",
    tipe_customer: "RETAIL",
    status: "AKTIF",
  });

  useEffect(() => {
    fetchCustomer();
  }, []);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getAll();
      setCustomerList(response.data.results || []);
    } catch (error) {
      console.error("Error fetching customer:", error);
      alert("Gagal memuat data customer");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (customer = null) => {
    if (customer) {
      setIsEdit(true);
      setCurrentCustomer(customer);
      setFormData({
        nama_customer: customer.nama_customer,
        no_telepon: customer.no_telepon,
        email: customer.email || "",
        alamat: customer.alamat,
        tipe_customer: customer.tipe_customer,
        status: customer.status,
      });
    } else {
      setIsEdit(false);
      setCurrentCustomer(null);
      setFormData({
        nama_customer: "",
        no_telepon: "",
        email: "",
        alamat: "",
        tipe_customer: "RETAIL",
        status: "AKTIF",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      nama_customer: "",
      no_telepon: "",
      email: "",
      alamat: "",
      tipe_customer: "RETAIL",
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
        await customerAPI.update(currentCustomer.id, formData);
        alert("Customer berhasil diupdate!");
      } else {
        await customerAPI.create(formData);
        alert("Customer berhasil ditambahkan!");
      }
      handleCloseDialog();
      fetchCustomer();
    } catch (error) {
      console.error("Error saving customer:", error);
      alert("Gagal menyimpan customer: " + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Yakin ingin menghapus customer "${nama}"?`)) {
      try {
        await customerAPI.delete(id);
        alert("Customer berhasil dihapus!");
        fetchCustomer();
      } catch (error) {
        console.error("Error deleting customer:", error);
        alert("Gagal menghapus customer. Mungkin masih digunakan di transaksi.");
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

  // Styling untuk Input Field yang responsive terhadap dark mode
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

  // Styling untuk Select Field yang responsive terhadap dark mode
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
    { Header: "Nama Customer", accessor: "nama_customer", width: "20%", align: "left" },
    { Header: "No. Telepon", accessor: "no_telepon", width: "12%", align: "left" },
    { Header: "Email", accessor: "email", width: "18%", align: "left" },
    { Header: "Alamat", accessor: "alamat", width: "20%", align: "left" },
    { Header: "Tipe", accessor: "tipe_customer", width: "10%", align: "center" },
    { Header: "Total Transaksi", accessor: "jumlah_transaksi", width: "10%", align: "center" },
    { Header: "Status", accessor: "status", width: "8%", align: "center" },
    { Header: "Action", accessor: "action", width: "7%", align: "center" },
  ];

  const rows = customerList.map((customer) => ({
    id: customer.id,
    nama_customer: customer.nama_customer,
    no_telepon: customer.no_telepon,
    email: customer.email || "-",
    alamat: customer.alamat,
    tipe_customer: (
      <MDTypography variant="caption" fontWeight="medium">
        {customer.tipe_customer}
      </MDTypography>
    ),
    jumlah_transaksi: customer.jumlah_transaksi || 0,
    status: (
      <MDTypography
        variant="caption"
        color={customer.status === "AKTIF" ? "success" : "error"}
        fontWeight="medium"
      >
        {customer.status}
      </MDTypography>
    ),
    action: (
      <MDBox display="flex" gap={1}>
        <MDButton variant="text" color="info" iconOnly onClick={() => handleOpenDialog(customer)}>
          <Icon>edit</Icon>
        </MDButton>
        <MDButton
          variant="text"
          color="error"
          iconOnly
          onClick={() => handleDelete(customer.id, customer.nama_customer)}
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
                  Data Customer
                </MDTypography>
                <MDButton variant="gradient" color="dark" onClick={() => handleOpenDialog()}>
                  <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                  &nbsp;Tambah Customer
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
          {isEdit ? "Edit Customer" : "Tambah Customer Baru"}
        </DialogTitle>
        <DialogContent>
          <MDBox component="form" p={2}>
            <Grid container spacing={2}>
              {/* Nama Customer */}
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="Nama Customer"
                  name="nama_customer"
                  value={formData.nama_customer}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  sx={inputStyles}
                />
              </Grid>

              {/* No Telepon */}
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="No. Telepon"
                  name="no_telepon"
                  value={formData.no_telepon}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  sx={inputStyles}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <MDInput
                  type="email"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth
                  sx={inputStyles}
                />
              </Grid>

              {/* Alamat */}
              <Grid item xs={12}>
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
              </Grid>

              {/* Tipe Customer */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel
                    id="tipe-label"
                    sx={{
                      color: darkMode ? "#adb5bd" : "#000",
                      "&.Mui-focused": {
                        color: darkMode ? "#fff" : "#1a73e8",
                      },
                    }}
                  >
                    Tipe Customer
                  </InputLabel>
                  <Select
                    labelId="tipe-label"
                    name="tipe_customer"
                    value={formData.tipe_customer}
                    onChange={handleInputChange}
                    label="Tipe Customer"
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
                    <MenuItem value="RETAIL">Retail</MenuItem>
                    <MenuItem value="GROSIR">Grosir</MenuItem>
                    <MenuItem value="MEMBER">Member</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Status */}
              <Grid item xs={12} md={6}>
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

export default Customer;
