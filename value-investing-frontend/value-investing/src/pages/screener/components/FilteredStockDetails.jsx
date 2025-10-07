import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

function FilteredStockDetails(props) {
  return (
    <TableContainer
      sx={{ maxHeight: 440 }}
      className="table-container-filtered-stock-details">
      <Table stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            {props.data.map((growthVariable) => {
              return (
                <TableCell
                  align="center"
                  colSpan={4}
                  style={{
                    fontWeight: "600",
                    fontSize: "16px",
                    borderBottom: "2px solid black",
                    borderRight: "1px dashed black",
                  }}>
                  {growthVariable.name}
                </TableCell>
              );
            })}
          </TableRow>
          <TableRow>
            {props.data.map((growthVariable) => {
              return (
                <>
                  <TableCell style={{ fontWeight: "600" }}>10 Y</TableCell>
                  <TableCell style={{ fontWeight: "600" }}>5 Y</TableCell>
                  <TableCell style={{ fontWeight: "600" }}>1 Y</TableCell>

                  <TableCell
                    style={{
                      fontWeight: "600",
                      borderRight: "1px dashed black",
                    }}>
                    TTM
                  </TableCell>
                </>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {props.data.map((growthVariable) => {
              return (
                <>
                  <TableCell>{`${growthVariable.cagr10y} %`}</TableCell>
                  <TableCell>{`${growthVariable.cagr5y} %`}</TableCell>
                  <TableCell>{`${growthVariable.cagr1y} %`}</TableCell>
                  <TableCell>{`${growthVariable.cagrTTM} %`}</TableCell>
                </>
              );
            })}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default FilteredStockDetails;
