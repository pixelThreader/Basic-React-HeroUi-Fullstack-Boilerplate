import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import TablesPage from "@/pages/tables";
import TableDataPage from "@/pages/table-data";
import SearchPage from "@/pages/search";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<TablesPage />} path="/tables" />
      <Route element={<TableDataPage />} path="/tables/:tableName" />
      <Route element={<SearchPage />} path="/search" />
    </Routes>
  );
}

export default App;
