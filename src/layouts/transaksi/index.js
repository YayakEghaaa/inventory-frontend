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
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import { transaksiAPI, customerAPI, produkAPI } from "services/api";
import { useMaterialUIController } from "context";

function Transaksi() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [transaksiList, setTransaksiList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [currentTransaksi, setCurrentTransaksi] = useState(null);

  const [formData, setFormData] = useState({
    jenis_transaksi: "PENJUALAN",
    customer: null,
    status_pembayaran: "LUNAS",
    metode_pembayaran: "TUNAI",
    keterangan: "",
    items: [],
  });

  const [currentItem, setCurrentItem] = useState({
    produk: null,
    jumlah: 1,
    harga_satuan: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transaksiRes, customerRes, produkRes] = await Promise.all([
        transaksiAPI.getAll(),
        customerAPI.getAll(),
        produkAPI.getAll(),
      ]);
      setTransaksiList(transaksiRes.data.results || []);
      setCustomerList(customerRes.data.results || []);
      setProdukList(produkRes.data.results || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      jenis_transaksi: "PENJUALAN",
      customer: null,
      status_pembayaran: "LUNAS",
      metode_pembayaran: "TUNAI",
      keterangan: "",
      items: [],
    });
    setCurrentItem({ produk: null, jumlah: 1, harga_satuan: 0 });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleItemChange = (field, value) => {
    const newItem = { ...currentItem, [field]: value };
    if (field === "produk" && value) {
      newItem.harga_satuan =
        formData.jenis_transaksi === "PEMBELIAN" ? value.harga_beli : value.harga_jual;
    }
    setCurrentItem(newItem);
  };

  const handleAddItem = () => {
    if (!currentItem.produk) {
      alert("Pilih produk terlebih dahulu!");
      return;
    }
    if (currentItem.jumlah <= 0) {
      alert("Jumlah harus lebih dari 0!");
      return;
    }
    if (formData.jenis_transaksi === "PENJUALAN" && currentItem.produk.stok < currentItem.jumlah) {
      alert(
        `Stok ${currentItem.produk.nama_produk} tidak cukup! Tersedia: ${currentItem.produk.stok}`
      );
      return;
    }

    const newItems = [
      ...formData.items,
      {
        produk: currentItem.produk.id,
        produk_nama: currentItem.produk.nama_produk,
        produk_kode: currentItem.produk.kode_produk,
        jumlah: parseInt(currentItem.jumlah),
        harga_satuan: parseFloat(currentItem.harga_satuan),
        subtotal: parseInt(currentItem.jumlah) * parseFloat(currentItem.harga_satuan),
      },
    ];

    setFormData({ ...formData, items: newItems });
    setCurrentItem({ produk: null, jumlah: 1, harga_satuan: 0 });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => formData.items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = async () => {
    try {
      if (formData.items.length === 0) {
        alert("Tambahkan minimal 1 item produk!");
        return;
      }
      if (formData.jenis_transaksi === "PENJUALAN" && !formData.customer) {
        alert("Customer wajib dipilih untuk transaksi penjualan!");
        return;
      }

      const payload = {
        jenis_transaksi: formData.jenis_transaksi,
        customer: formData.customer, // Bisa null untuk PEMBELIAN
        status_pembayaran: formData.status_pembayaran,
        metode_pembayaran: formData.metode_pembayaran,
        keterangan: formData.keterangan,
        items: formData.items.map((item) => ({
          produk: item.produk,
          jumlah: item.jumlah,
        })),
      };

      console.log("Payload yang dikirim:", payload); // ✅ Debug

      await transaksiAPI.create(payload);
      alert("Transaksi berhasil ditambahkan!");
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error("Error saving transaksi:", error);
      console.error("Error response:", error.response?.data); // ✅ Lihat detail error

      // Tampilkan error yang lebih detail
      const errorMsg =
        error.response?.data?.detail || JSON.stringify(error.response?.data) || error.message;

      alert("Gagal menyimpan transaksi: " + errorMsg);
    }
  };

  const handleViewDetail = async (transaksi) => {
    try {
      const response = await transaksiAPI.getById(transaksi.id);
      setCurrentTransaksi(response.data);
      setOpenDetailDialog(true);
    } catch (error) {
      console.error("Error fetching detail:", error);
      alert("Gagal memuat detail transaksi");
    }
  };

  const handleDelete = async (id, nomor) => {
    if (window.confirm(`Yakin ingin menghapus transaksi "${nomor}"?`)) {
      try {
        await transaksiAPI.delete(id);
        alert("Transaksi berhasil dihapus!");
        fetchData();
      } catch (error) {
        console.error("Error deleting transaksi:", error);
        alert("Gagal menghapus transaksi.");
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const inputStyles = {
    "& .MuiInputBase-input": { color: darkMode ? "#fff" : "#000" },
    "& .MuiInputLabel-root": { color: darkMode ? "#adb5bd" : "#000" },
    "& .MuiInputLabel-root.Mui-focused": { color: darkMode ? "#fff" : "#1a73e8" },
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: darkMode ? "#4a5568" : "#d2d6da" },
      "&:hover fieldset": { borderColor: darkMode ? "#fff" : "#000" },
      "&.Mui-focused fieldset": { borderColor: "#1a73e8" },
    },
  };

  const selectStyles = {
    height: "45px",
    color: darkMode ? "#fff" : "#000",
    "& .MuiSelect-select": { color: darkMode ? "#fff" : "#000" },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: darkMode ? "#4a5568" : "#d2d6da" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: darkMode ? "#fff" : "#000" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1a73e8" },
    "& .MuiSvgIcon-root": { color: darkMode ? "#fff" : "#000" },
  };

  const menuProps = {
    PaperProps: {
      sx: {
        backgroundColor: darkMode ? "#1a2035" : "#fff",
        "& .MuiMenuItem-root": {
          color: darkMode ? "#fff" : "#000",
          "&:hover": { backgroundColor: darkMode ? "#2d3748" : "#f0f2f5" },
          "&.Mui-selected": {
            backgroundColor: darkMode ? "#344767" : "#e3f2fd",
            "&:hover": { backgroundColor: darkMode ? "#3d5278" : "#d1e7ff" },
          },
        },
      },
    },
  };

  const columns = [
    { Header: "No. Transaksi", accessor: "nomor_transaksi", width: "15%", align: "left" },
    { Header: "Jenis", accessor: "jenis_transaksi", width: "10%", align: "center" },
    { Header: "Customer", accessor: "customer_nama", width: "15%", align: "left" },
    { Header: "Total", accessor: "total_keseluruhan", width: "12%", align: "right" },
    { Header: "Status Bayar", accessor: "status_pembayaran", width: "12%", align: "center" },
    { Header: "Metode", accessor: "metode_pembayaran", width: "10%", align: "center" },
    { Header: "Tanggal", accessor: "tanggal_transaksi", width: "18%", align: "left" },
    { Header: "Action", accessor: "action", width: "8%", align: "center" },
  ];

  const rows = transaksiList.map((transaksi) => ({
    nomor_transaksi: transaksi.nomor_transaksi,
    jenis_transaksi: (
      <MDTypography
        variant="caption"
        color={transaksi.jenis_transaksi === "PENJUALAN" ? "success" : "info"}
        fontWeight="medium"
      >
        {transaksi.jenis_transaksi}
      </MDTypography>
    ),
    customer_nama: transaksi.customer_nama || "-",
    total_keseluruhan: formatRupiah(transaksi.total_keseluruhan),
    status_pembayaran: (
      <MDTypography
        variant="caption"
        color={transaksi.status_pembayaran === "LUNAS" ? "success" : "warning"}
        fontWeight="medium"
      >
        {transaksi.status_pembayaran.replace("_", " ")}
      </MDTypography>
    ),
    metode_pembayaran: transaksi.metode_pembayaran.replace("_", " "),
    tanggal_transaksi: formatDate(transaksi.tanggal_transaksi),
    action: (
      <MDBox display="flex" gap={1}>
        <MDButton variant="text" color="dark" iconOnly onClick={() => handleViewDetail(transaksi)}>
          <Icon>visibility</Icon>
        </MDButton>
        <MDButton
          variant="text"
          color="error"
          iconOnly
          onClick={() => handleDelete(transaksi.id, transaksi.nomor_transaksi)}
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
                  Data Transaksi
                </MDTypography>
                <MDButton variant="gradient" color="dark" onClick={handleOpenDialog}>
                  <Icon sx={{ fontWeight: "bold" }}>add</Icon>&nbsp;Tambah Transaksi
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

      {/* Dialog Form Tambah Transaksi */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: darkMode ? "#1a2035" : "#fff", backgroundImage: "none" },
        }}
      >
        <DialogTitle sx={{ pb: 1, color: darkMode ? "#fff" : "#000" }}>
          Tambah Transaksi Baru
        </DialogTitle>
        <DialogContent>
          <MDBox component="form" p={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel
                    sx={{
                      color: darkMode ? "#adb5bd" : "#000",
                      "&.Mui-focused": { color: darkMode ? "#fff" : "#1a73e8" },
                    }}
                  >
                    Jenis Transaksi
                  </InputLabel>
                  <Select
                    name="jenis_transaksi"
                    value={formData.jenis_transaksi}
                    onChange={handleInputChange}
                    label="Jenis Transaksi"
                    MenuProps={menuProps}
                    sx={selectStyles}
                  >
                    <MenuItem value="PENJUALAN">Penjualan</MenuItem>
                    <MenuItem value="PEMBELIAN">Pembelian</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={customerList}
                  getOptionLabel={(opt) => opt.nama_customer || ""}
                  value={
                    formData.customer ? customerList.find((c) => c.id === formData.customer) : null
                  }
                  onChange={(e, val) => setFormData({ ...formData, customer: val?.id || null })}
                  disabled={formData.jenis_transaksi !== "PENJUALAN"}
                  renderInput={(params) => (
                    <TextField {...params} label="Customer" sx={inputStyles} />
                  )}
                  ListboxProps={{
                    sx: {
                      backgroundColor: darkMode ? "#1a2035" : "#fff",
                      "& .MuiAutocomplete-option": {
                        color: darkMode ? "#fff" : "#000",
                        "&:hover": { backgroundColor: darkMode ? "#2d3748" : "#f0f2f5" },
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel
                    sx={{
                      color: darkMode ? "#adb5bd" : "#000",
                      "&.Mui-focused": { color: darkMode ? "#fff" : "#1a73e8" },
                    }}
                  >
                    Status Pembayaran
                  </InputLabel>
                  <Select
                    name="status_pembayaran"
                    value={formData.status_pembayaran}
                    onChange={handleInputChange}
                    label="Status Pembayaran"
                    MenuProps={menuProps}
                    sx={selectStyles}
                  >
                    <MenuItem value="LUNAS">Lunas</MenuItem>
                    <MenuItem value="BELUM_LUNAS">Belum Lunas</MenuItem>
                    <MenuItem value="CICILAN">Cicilan</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel
                    sx={{
                      color: darkMode ? "#adb5bd" : "#000",
                      "&.Mui-focused": { color: darkMode ? "#fff" : "#1a73e8" },
                    }}
                  >
                    Metode Pembayaran
                  </InputLabel>
                  <Select
                    name="metode_pembayaran"
                    value={formData.metode_pembayaran}
                    onChange={handleInputChange}
                    label="Metode Pembayaran"
                    MenuProps={menuProps}
                    sx={selectStyles}
                  >
                    <MenuItem value="TUNAI">Tunai</MenuItem>
                    <MenuItem value="TRANSFER">Transfer Bank</MenuItem>
                    <MenuItem value="E_WALLET">E-Wallet</MenuItem>
                    <MenuItem value="KARTU_DEBIT">Kartu Debit</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <MDInput
                  type="text"
                  label="Keterangan (Opsional)"
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleInputChange}
                  fullWidth
                  sx={inputStyles}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            <MDTypography variant="h6" mb={2} sx={{ color: darkMode ? "#fff" : "#000" }}>
              Item Produk
            </MDTypography>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={produkList.filter((p) => p.status === "AKTIF")}
                  getOptionLabel={(opt) => `${opt.kode_produk} - ${opt.nama_produk}` || ""}
                  value={currentItem.produk}
                  onChange={(e, val) => handleItemChange("produk", val)}
                  renderInput={(params) => (
                    <TextField {...params} label="Pilih Produk" sx={inputStyles} />
                  )}
                  ListboxProps={{
                    sx: {
                      backgroundColor: darkMode ? "#1a2035" : "#fff",
                      "& .MuiAutocomplete-option": {
                        color: darkMode ? "#fff" : "#000",
                        "&:hover": { backgroundColor: darkMode ? "#2d3748" : "#f0f2f5" },
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <MDInput
                  type="number"
                  label="Jumlah"
                  value={currentItem.jumlah}
                  onChange={(e) => handleItemChange("jumlah", e.target.value)}
                  fullWidth
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <MDInput
                  type="number"
                  label="Harga Satuan"
                  value={currentItem.harga_satuan}
                  onChange={(e) => handleItemChange("harga_satuan", e.target.value)}
                  fullWidth
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <MDButton
                  variant="gradient"
                  color="success"
                  fullWidth
                  onClick={handleAddItem}
                  sx={{ height: "45px" }}
                >
                  <Icon>add</Icon>&nbsp;Tambah
                </MDButton>
              </Grid>
            </Grid>

            {formData.items.length > 0 && (
              <MDBox mt={3}>
                <Card
                  sx={{
                    backgroundColor: darkMode ? "#0f1535" : "#f8f9fa",
                    backgroundImage: "none",
                  }}
                >
                  <MDBox p={2}>
                    {formData.items.map((item, idx) => (
                      <MDBox
                        key={idx}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        p={2}
                        mb={1}
                        sx={{ backgroundColor: darkMode ? "#1a2035" : "#fff", borderRadius: "8px" }}
                      >
                        <MDBox>
                          <MDTypography
                            variant="button"
                            fontWeight="medium"
                            sx={{ color: darkMode ? "#fff" : "#000" }}
                          >
                            {item.produk_kode} - {item.produk_nama}
                          </MDTypography>
                          <MDTypography
                            variant="caption"
                            display="block"
                            sx={{ color: darkMode ? "#adb5bd" : "#7b809a" }}
                          >
                            {item.jumlah} x {formatRupiah(item.harga_satuan)}
                          </MDTypography>
                        </MDBox>
                        <MDBox display="flex" alignItems="center" gap={2}>
                          <MDTypography variant="h6" color="success">
                            {formatRupiah(item.subtotal)}
                          </MDTypography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(idx)}
                          >
                            <Icon>delete</Icon>
                          </IconButton>
                        </MDBox>
                      </MDBox>
                    ))}
                    <Divider sx={{ my: 2 }} />
                    <MDBox display="flex" justifyContent="space-between" alignItems="center">
                      <MDTypography variant="h5" sx={{ color: darkMode ? "#fff" : "#000" }}>
                        Total Keseluruhan:
                      </MDTypography>
                      <MDTypography variant="h4" color="success" fontWeight="bold">
                        {formatRupiah(calculateTotal())}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Card>
              </MDBox>
            )}
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleCloseDialog} color="secondary">
            Batal
          </MDButton>
          <MDButton onClick={handleSubmit} color="success" variant="gradient">
            Simpan Transaksi
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Dialog Detail Transaksi - FIXED */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: darkMode ? "#1a2035" : "#fff", backgroundImage: "none" },
        }}
      >
        <DialogTitle sx={{ color: darkMode ? "#fff" : "#000" }}>Detail Transaksi</DialogTitle>
        <DialogContent>
          {currentTransaksi && (
            <MDBox p={2}>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={6}>
                  <MDTypography variant="caption" sx={{ color: darkMode ? "#adb5bd" : "#7b809a" }}>
                    No. Transaksi
                  </MDTypography>
                  <MDTypography
                    variant="button"
                    fontWeight="medium"
                    display="block"
                    sx={{ color: darkMode ? "#fff" : "#000" }}
                  >
                    {currentTransaksi.nomor_transaksi}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" sx={{ color: darkMode ? "#adb5bd" : "#7b809a" }}>
                    Tanggal
                  </MDTypography>
                  <MDTypography
                    variant="button"
                    fontWeight="medium"
                    display="block"
                    sx={{ color: darkMode ? "#fff" : "#000" }}
                  >
                    {formatDate(currentTransaksi.tanggal_transaksi)}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" sx={{ color: darkMode ? "#adb5bd" : "#7b809a" }}>
                    Jenis Transaksi
                  </MDTypography>
                  <MDTypography
                    variant="button"
                    fontWeight="medium"
                    display="block"
                    sx={{ color: darkMode ? "#fff" : "#000" }}
                  >
                    {currentTransaksi.jenis_transaksi}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" sx={{ color: darkMode ? "#adb5bd" : "#7b809a" }}>
                    Customer
                  </MDTypography>
                  <MDTypography
                    variant="button"
                    fontWeight="medium"
                    display="block"
                    sx={{ color: darkMode ? "#fff" : "#000" }}
                  >
                    {currentTransaksi.customer_nama || "-"}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" sx={{ color: darkMode ? "#adb5bd" : "#7b809a" }}>
                    Status Pembayaran
                  </MDTypography>
                  <MDTypography
                    variant="button"
                    fontWeight="medium"
                    display="block"
                    color={currentTransaksi.status_pembayaran === "LUNAS" ? "success" : "warning"}
                  >
                    {currentTransaksi.status_pembayaran.replace("_", " ")}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" sx={{ color: darkMode ? "#adb5bd" : "#7b809a" }}>
                    Metode Pembayaran
                  </MDTypography>
                  <MDTypography
                    variant="button"
                    fontWeight="medium"
                    display="block"
                    sx={{ color: darkMode ? "#fff" : "#000" }}
                  >
                    {currentTransaksi.metode_pembayaran.replace("_", " ")}
                  </MDTypography>
                </Grid>
                <Grid item xs={12}>
                  <MDTypography variant="caption" sx={{ color: darkMode ? "#adb5bd" : "#7b809a" }}>
                    Keterangan
                  </MDTypography>
                  <MDTypography
                    variant="button"
                    fontWeight="medium"
                    display="block"
                    sx={{ color: darkMode ? "#fff" : "#000" }}
                  >
                    {currentTransaksi.keterangan || "-"}
                  </MDTypography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 2 }} />
              <MDTypography variant="h6" mb={2} sx={{ color: darkMode ? "#fff" : "#000" }}>
                Detail Item
              </MDTypography>

              {currentTransaksi.items &&
                currentTransaksi.items.map((item, idx) => (
                  <MDBox
                    key={idx}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    p={2}
                    mb={1}
                    sx={{
                      backgroundColor: darkMode ? "#0f1535" : "#f8f9fa",
                      borderRadius: "8px",
                      border: "1px solid",
                      borderColor: darkMode ? "#344767" : "#e3f2fd",
                    }}
                  >
                    <MDBox>
                      <MDTypography
                        variant="button"
                        fontWeight="medium"
                        sx={{ color: darkMode ? "#fff" : "#000" }}
                      >
                        {item.produk_kode} - {item.produk_nama}
                      </MDTypography>
                      <MDTypography
                        variant="caption"
                        display="block"
                        sx={{ color: darkMode ? "#adb5bd" : "#7b809a" }}
                      >
                        {item.jumlah} x {formatRupiah(item.harga_satuan)}
                      </MDTypography>
                    </MDBox>
                    <MDTypography variant="h6" color="success">
                      {formatRupiah(item.subtotal)}
                    </MDTypography>
                  </MDBox>
                ))}

              <Divider sx={{ my: 2 }} />
              <MDBox display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h5" sx={{ color: darkMode ? "#fff" : "#000" }}>
                  Total Keseluruhan:
                </MDTypography>
                <MDTypography variant="h4" color="success" fontWeight="bold">
                  {formatRupiah(currentTransaksi.total_keseluruhan)}
                </MDTypography>
              </MDBox>
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setOpenDetailDialog(false)} color="secondary">
            Tutup
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default Transaksi;
