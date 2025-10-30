import React from "react";
import "./styles.css";

function PlainTable() {
  return (
    <div class="table-card">
      <div class="table-container">
        <table class="screener-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Company Name</th>
              <th>P/E</th>
              <th>Rev. Growth</th>
              <th>Debt/Eq.</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ABC</td>
              <td>Alpha Beta Corp</td>
              <td>15.5</td>
              <td class="positive">12.3%</td>
              <td>0.4</td>
            </tr>
            <tr>
              <td>XYZ</td>
              <td>Xenon Yttrium Zeta Inc</td>
              <td>18.2</td>
              <td class="positive">15.1%</td>
              <td>0.3</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PlainTable;
