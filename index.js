let countryDetails = [],
    copyData = [],
    rowsPerPage = 5,
    currentPage = 1,
    startingIndex = 0,
    endingIndex = 4,
    totalPages = 0,
    remainingNumbers = 0,
    buttonProperties = {}

const fetchDetails = () => {        //Make api call to fetch data
    fetch('https://restcountries.eu/rest/v2/all')
        .then(data => data.json())
        .then(data => {
            countryDetails = data;
            copyData = data;
            changeButtonProperties(data.length);
            totalPages = Math.ceil(data.length / rowsPerPage);
            renderTable(data, startingIndex, endingIndex);
        })
}
const changeButtonProperties = (dataLength) => { // config to display the data while pagination
    for (let i = 0; i < dataLength; i++) {
        buttonProperties['button_' + i] = {};
        if (i == 0) {
            buttonProperties['button_' + i].startIndex = i;
            buttonProperties['button_' + i].endIndex = rowsPerPage - 1;
        } else {
            buttonProperties['button_' + i].startIndex = (i * rowsPerPage);
            buttonProperties['button_' + i].endIndex = ((i + 1) * rowsPerPage) - 1;
        }
    }
}
const renderTable = (data, startIndex = 0, endIndex = 5) => {   //Geenrate the table data
    document.getElementById('content-body').innerHTML = '';
    if (!data.length) {
        let trEle = generateTr('tr');
        append(trEle, generateTr('td', 'No Countries Found', 6, 'no-data'));
        document.getElementById('content-body').appendChild(trEle);
    } else {
        for (let i = startIndex; i <= endIndex; i++) {
            const { name = '', capital = '', region = '', demonym = '', currencies = [], population = 0, flag = '' } = data[i] || {};
            const { code = '' } = currencies[0] || {};
            name && generateElement({ name, capital, region, demonym, code, population, flag });
        }
    }
    document.getElementsByClassName('show-container')[0].innerText = `Showing ${startIndex + 1} to ${Number(endIndex) + 1} of ${copyData.length} entries`;
}

const append = (parent, child) => { // append child ti=o its parent
    parent.appendChild(child);
    return parent;
};

const generateImg = (flag) => {
    let imageEle = document.createElement('img');
    imageEle.src = flag;
    imageEle.className = 'flag';
    return imageEle
}
const generateElement = (data) => { //generate tr element
    let trEle = generateTr('tr');
    append(trEle, generateTr('td', data.name));
    append(trEle, generateTr('td', data.capital));
    append(trEle, generateTr('td', amountConversion(data.population)));
    append(trEle, generateTr('td', data.region));
    append(trEle, generateTr('td', data.demonym));
    append(trEle, generateTr('td', data.code));
    let tdEle = document.createElement('td');
    tdEle.appendChild(generateImg(data.flag));
    append(trEle, tdEle);
    document.getElementById('content-body').appendChild(trEle);
}

const generateTr = (tag, text, colSpan, className) => {
    let tdEle = document.createElement(tag);
    if (text) tdEle.innerText = text;
    if (colSpan) tdEle.colSpan = colSpan;
    if (className) tdEle.className = className;
    return tdEle;
}

const amountConversion = (amount, denomination = 1, precision = 2, placeholder = ' - ') => { // convert population to format
    if (amount || amount === 0) {
        let val = +(amount / denomination).toFixed(precision);
        val = `${val.toLocaleString('en-IN')}`;
        let amt = val;
        return amt;
    }
    return placeholder;
};

// sorting function
const sortAsc = (sortKey) => {
    return copyData.sort((a, b) => {
        if (a[sortKey] < b[sortKey])
            return -1;
        if (a[sortKey] > b[sortKey])
            return 1;
        return 0;
    })
}

const sortDesc = (sortKey) => {
    return copyData.sort((a, b) => {
        if (a[sortKey] > b[sortKey])
            return -1;
        if (a[sortKey] < b[sortKey])
            return 1;
        return 0;
    })
}

// handle prev and next button click
const handlePagination = (e) => {
    rowsPerPage = Number(rowsPerPage);
    changeButtonProperties();
    if (e.currentTarget.id === 'next') {
        if (currentPage < totalPages) {
            currentPage++;
            startingIndex += rowsPerPage;
            endingIndex += rowsPerPage;
            if (endingIndex > copyData.length - 1) {
                remainingNumbers = endingIndex - (copyData.length - 1);
                endingIndex = copyData.length - 1;
            }
        }
    } else {
        if (currentPage === totalPages) {
            endingIndex += remainingNumbers;
        } else {
            remainingNumbers = 0;
        }
        if (currentPage > 1) {
            currentPage--;
            startingIndex -= rowsPerPage;
            endingIndex -= rowsPerPage;
        }
    }
    renderTable(copyData, startingIndex, endingIndex);
    renderButton();
}

// reset the button when search or chane entries list
const renderButton = () => {
    let c = Math.floor((currentPage - 1) / 5);
    document.querySelectorAll(".button-div button").forEach((headerCell, index) => {
        if (totalPages >= (index + 1) + (c * 5)) {
            headerCell.innerText = (index + 1) + (c * 5);
            headerCell.id = 'page_' + Number((index + 1) + (c * 5));
            headerCell.className = '';
            if (currentPage === Number((index + 1) + (c * 5))) {
                headerCell.className = 'activePage';
            }
        } else {
            headerCell.className = 'hidePage'
        }
    });
}

const handleDirectPagination = (e) => {
    currentPage = e.target.innerText;
    const ind = buttonProperties['button_' + (e.target.innerText - 1)];
    startingIndex = ind.startIndex;
    endingIndex = ind.endIndex;
    document.getElementsByClassName('activePage')[0].className = '';
    document.getElementById('page_' + (currentPage)).className = 'activePage';
    renderTable(copyData, ind.startIndex, ind.endIndex);
}

document.addEventListener('DOMContentLoaded', fetchDetails, false);
window.onload = function () {
    let entriesEle = document.getElementById('entries');
    let searchEle = this.document.getElementById('search');

    entriesEle.addEventListener('change', (e) => {
        endingIndex = Number(e.target.value) - 1;
        startingIndex = 0;
        currentPage = 1;
        rowsPerPage = e.target.value;
        changeButtonProperties();
        totalPages = Math.ceil(copyData.length / rowsPerPage);
        remainingNumbers = 0;
        renderButton();
        renderTable(copyData, startingIndex, endingIndex);
    });

    // reset the entries in a page
    searchEle.addEventListener('keyup', (e) => {
        const searchQuery = e.currentTarget.value;
        copyData = countryDetails.filter((fVal, index) => {
            const { name = '', capital = '', region = '', demonym = '', currencies = [], population = 0 } = fVal || {};
            const { code = '' } = currencies[0] || {};
            if (demonym.toLowerCase().includes(searchQuery.toLowerCase()) ||
                name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                capital.toLowerCase().includes(searchQuery.toLowerCase()) ||
                region.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (code && code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    String(population).toLowerCase().includes(String(searchQuery).toLowerCase()))) {
                return fVal;
            }
        });
        startingIndex = 0;
        currentPage = 1;
        totalPages = Math.ceil(copyData.length / rowsPerPage);
        remainingNumbers = 0;
        renderButton();
        endingIndex = rowsPerPage - 1;
        renderTable(copyData, startingIndex, endingIndex);
    });

    // do sort when click headers
    document.querySelectorAll(".table-sortable th").forEach(headerCell => {
        headerCell.addEventListener("click", () => {
            if (!headerCell.classList.contains("not-sort")) {
                const sortKey = headerCell.getAttribute("data-key");
                const table = this.document.getElementsByClassName('table-sortable')[0];
                const headerIndex = Array.prototype.indexOf.call(headerCell.parentElement.children, headerCell);
                const currentIsAscending = headerCell.classList.contains("th-sort-asc");

                if (sortKey !== 'population') {
                    copyData = currentIsAscending ? sortDesc(sortKey) : sortAsc(sortKey);
                } else {
                    if (!currentIsAscending) {
                        copyData = copyData.sort((a, b) => a.population - b.population)
                    } else {
                        copyData = copyData.sort((a, b) => b.population - a.population)
                    }
                }

                table.querySelectorAll("th").forEach(th => th.classList.remove("th-sort-asc", "th-sort-desc"));
                table.querySelector(`th:nth-child(${headerIndex + 1})`).classList.toggle("th-sort-asc", !currentIsAscending);
                table.querySelector(`th:nth-child(${headerIndex + 1})`).classList.toggle("th-sort-desc", currentIsAscending);

                startingIndex = 0;
                renderTable(copyData, startingIndex, rowsPerPage);
            }
        });
    });
    document.querySelectorAll(".button-div button").forEach((headerCell, index) => {
        headerCell.innerText = ((index + 1) + ((currentPage - 1) * 5));
    });
    document.querySelectorAll(".button-div button").forEach(headerCell => {
        headerCell.addEventListener('click', handleDirectPagination);
    });
    document.getElementById('prev').addEventListener('click', handlePagination, false);
    document.getElementById('next').addEventListener('click', handlePagination, false);
}