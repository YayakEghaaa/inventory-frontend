// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import Kategori from "layouts/kategori";
import Supplier from "layouts/supplier";
import Produk from "layouts/produk";
import Customer from "layouts/customer";
import Transaksi from "layouts/transaksi";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "divider",
    key: "divider-master",
  },
  {
    type: "title",
    title: "Master Data",
    key: "master-data-title",
  },
  {
    type: "collapse",
    name: "Supplier",
    key: "supplier",
    icon: <Icon fontSize="small">local_shipping</Icon>,
    route: "/supplier",
    component: <Supplier />,
  },
  {
    type: "collapse",
    name: "Kategori",
    key: "kategori",
    icon: <Icon fontSize="small">category</Icon>,
    route: "/kategori",
    component: <Kategori />,
  },
  {
    type: "collapse",
    name: "Produk",
    key: "produk",
    icon: <Icon fontSize="small">inventory_2</Icon>,
    route: "/produk",
    component: <Produk />,
  },
  {
    type: "collapse",
    name: "Customer",
    key: "customer",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/customer",
    component: <Customer />,
  },
  {
    type: "divider",
    key: "divider-transaksi",
  },
  {
    type: "title",
    title: "Transaksi",
    key: "transaksi-title",
  },
  {
    type: "collapse",
    name: "Transaksi",
    key: "transaksi",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/transaksi",
    component: <Transaksi />,
  },
  {
    type: "collapse",
    name: "Tables",
    key: "tables",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables",
    component: <Tables />,
  },
  {
    type: "collapse",
    name: "Billing",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/billing",
    component: <Billing />,
  },
  {
    type: "collapse",
    name: "Notifications",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
];

export default routes;
