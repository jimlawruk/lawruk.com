"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("race-results");
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));
    // Sort rows by date descending (column 0)
    rows.sort((a, b) => {
        var _a, _b, _c, _d;
        const dateA = (_b = (_a = a.cells[0].textContent) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : "";
        const dateB = (_d = (_c = b.cells[0].textContent) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : "";
        return dateB.localeCompare(dateA);
    });
    rows.forEach((row) => {
        tbody.appendChild(row);
    });
    // Sortable headers
    const headers = table.querySelectorAll("thead .race-header th");
    let sortCol = 0;
    let sortAsc = false;
    headers.forEach((th, index) => {
        if (index === 5)
            return; // skip Map column
        th.style.cursor = "pointer";
        th.addEventListener("click", () => {
            sortAsc = sortCol === index ? !sortAsc : true;
            sortCol = index;
            const visibleRows = rows.filter((r) => r.style.display !== "none");
            visibleRows.sort((a, b) => {
                var _a, _b, _c, _d;
                const valA = (_b = (_a = a.cells[index].textContent) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : "";
                const valB = (_d = (_c = b.cells[index].textContent) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : "";
                return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
            });
            visibleRows.forEach((row) => {
                tbody.appendChild(row);
            });
        });
    });
    // Filtering
    const filterDate = document.getElementById("filter-date");
    const filterTitle = document.getElementById("filter-title");
    const filterDistance = document.getElementById("filter-distance");
    const filterCity = document.getElementById("filter-city");
    const filterState = document.getElementById("filter-state");
    function applyFilters() {
        const fd = filterDate.value.toLowerCase();
        const ft = filterTitle.value.toLowerCase();
        const fDist = filterDistance.value;
        const fc = filterCity.value.toLowerCase();
        const fs = filterState.value.toLowerCase();
        rows.forEach((row) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            const date = (_b = (_a = row.cells[0].textContent) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : "";
            const title = (_d = (_c = row.cells[1].textContent) === null || _c === void 0 ? void 0 : _c.toLowerCase()) !== null && _d !== void 0 ? _d : "";
            const distance = (_e = row.getAttribute("data-distance")) !== null && _e !== void 0 ? _e : "";
            const city = (_g = (_f = row.cells[3].textContent) === null || _f === void 0 ? void 0 : _f.toLowerCase()) !== null && _g !== void 0 ? _g : "";
            const state = (_j = (_h = row.cells[4].textContent) === null || _h === void 0 ? void 0 : _h.toLowerCase()) !== null && _j !== void 0 ? _j : "";
            let distMatch = true;
            if (fDist) {
                if (fDist === "M") {
                    distMatch = distance === "M";
                }
                else {
                    distMatch = distance === fDist;
                }
            }
            const show = date.includes(fd) &&
                title.includes(ft) &&
                distMatch &&
                city.includes(fc) &&
                state.includes(fs);
            row.style.display = show ? "" : "none";
        });
    }
    filterDate.addEventListener("input", applyFilters);
    filterTitle.addEventListener("input", applyFilters);
    filterDistance.addEventListener("change", applyFilters);
    filterCity.addEventListener("input", applyFilters);
    filterState.addEventListener("input", applyFilters);
});
