import React from "react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";

const columns = ["Bear Case", "Base Case", "Bull Case"];

function AccordionBodyPenman({ data }) {
  const symbolicFormula = String.raw`
    V = B_0 + \frac{(\text{RNOA}_1 - r )\cdot \text{NOA}_0}{1 + r} 
      + \frac{(\text{RNOA}_2 - r ) \cdot \text{NOA}_1}{(1 + r)(r - g)}
  `;

  return (
    <div style={{ padding: "0px 16px" }}>
      <div className="title-mid-size">Valuation Model</div>
      <BlockMath math={symbolicFormula} />
      <div className="title-mid-size">Valuation Inputs</div>
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: "transparent",
          boxShadow: "none",
          borderRadius: "16px",
          marginTop: "12px",
        }}
        className="custom-mui-table">
        <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
          <TableHead className="custom-table-head">
            <TableRow>
              <TableCell></TableCell>
              {columns.map((column) => {
                return <TableCell align="right">{column}</TableCell>;
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((row) => {
              const metricName = Object.keys(row)[0];
              var [bear, base, bull] = row[metricName];
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default AccordionBodyPenman;
