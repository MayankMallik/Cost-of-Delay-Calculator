// Indian numbering system formatting logic
const formatToWords = num => {
    const absNum = Math.abs(num);
    const sign = num < 0 ? "-" : "";
    
    if (absNum >= 10000000) { // Crore
        const value = Math.ceil((absNum / 10000000) * 100) / 100;
        return `${sign}₹${value.toFixed(2)} Cr`;
    } else if (absNum >= 100000) { // Lakh
        const value = Math.ceil((absNum / 100000) * 100) / 100;
        return `${sign}₹${value.toFixed(2)} Lakh`;
    } else {
        let integer = Math.round(absNum).toString();
        if (integer.length > 3) {
            let lastThree = integer.slice(-3);
            let otherNumbers = integer.slice(0, -3);
            otherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
            integer = otherNumbers + "," + lastThree;
        }
        return sign + "₹" + integer;
    }
};

function formatNumber(valString) {
    let value = valString.replace(/,/g, '');
    value = value.replace(/[^0-9.]/g, ''); 
    if (value.length > 3) {
        let parts = value.split('.');
        let integer = parts[0];
        let decimal = parts.length > 1 ? '.' + parts[1] : '';
        let lastThree = integer.slice(-3);
        let otherNumbers = integer.slice(0, -3);
        if (otherNumbers) {
            otherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
            integer = otherNumbers + "," + lastThree;
        }
        return integer + decimal;
    }
    return value;
}

// SIP Math: FV = P × [((1 + i)^n - 1) / i]
function calculateSIP(p, annualRate, years) {
    const i = (annualRate / 100) / 12;
    const n = years * 12;
    const total = p * ((Math.pow(1 + i, n) - 1) / i);
    const invested = p * n;
    return {
        invested: invested,
        returns: total - invested,
        total: total
    };
}

// Elements
const delaySlider = document.getElementById('delaySlider');
const delayVal = document.getElementById('delayVal');
const errorMsg = document.getElementById('error-message');
const resultsDiv = document.getElementById('results');

// 1. LIVE SYNC: Updates the "Delayed" column only
function syncDelayedColumn() {
    delayVal.innerText = delaySlider.value;
    
    const pNow = parseFloat(document.getElementById('monthlyAmount').value.replace(/,/g, ''));
    const rNow = parseFloat(document.getElementById('rate').value);
    const yNow = parseFloat(document.getElementById('years').value);
    const yDelay = parseFloat(delaySlider.value);

    if (yDelay >= yNow) {
        errorMsg.style.display = 'block';
        document.getElementById('monthlyAmountDelayed').value = "—";
        document.getElementById('yearsDelayed').value = "—";
        document.getElementById('rateDelayed').value = "—";
        return;
    } else {
        errorMsg.style.display = 'none';
    }

    if (!isNaN(pNow) && !isNaN(yNow)) {
        const yDelayed = yNow - yDelay;
        // Logic: P_now * y_now = P_delayed * y_delayed
        const pDelayed = Math.round(pNow * (yNow / yDelayed));

        document.getElementById('monthlyAmountDelayed').value = formatNumber(pDelayed.toString());
        document.getElementById('yearsDelayed').value = yDelayed;
        document.getElementById('rateDelayed').value = !isNaN(rNow) ? rNow : "—";
    }
}

// 2. FINAL CALCULATION: Runs only when button is clicked
function calculateDelay() {
    const pNow = parseFloat(document.getElementById('monthlyAmount').value.replace(/,/g, ''));
    const rNow = parseFloat(document.getElementById('rate').value);
    const yNow = parseFloat(document.getElementById('years').value);
    const yDelay = parseFloat(delaySlider.value);

    // Validation
    if (isNaN(pNow) || isNaN(rNow) || isNaN(yNow) || yDelay >= yNow) {
        document.querySelectorAll('input:not(:disabled)').forEach(input => {
            if (!input.value) input.classList.add('error');
        });
        return;
    }

    const yDelayed = yNow - yDelay;
    const pDelayed = pNow * (yNow / yDelayed);

    const nowRes = calculateSIP(pNow, rNow, yNow);
    const delayedRes = calculateSIP(pDelayed, rNow, yDelayed);

    // Update Result Table
    document.getElementById('investedNow').innerText = formatToWords(nowRes.invested);
    document.getElementById('returnsNow').innerText = formatToWords(nowRes.returns);
    document.getElementById('totalNow').innerText = formatToWords(nowRes.total);

    document.getElementById('investedDelayed').innerText = formatToWords(delayedRes.invested);
    document.getElementById('returnsDelayed').innerText = formatToWords(delayedRes.returns);
    document.getElementById('totalDelayed').innerText = formatToWords(delayedRes.total);

    // Update Summary Text
    const loss = nowRes.total - delayedRes.total;
    document.getElementById('lossAmount').innerText = formatToWords(loss);

    // Required SIP for same goal
    const i = (rNow / 100) / 12;
    const nDelayed = yDelayed * 12;
    const reqSIP = (nowRes.total) / [((Math.pow(1 + i, nDelayed) - 1) / i)];
    document.getElementById('requiredSIP').innerText = formatToWords(reqSIP);

    resultsDiv.style.display = 'block';
}

// Event Listeners for Live Sync
delaySlider.addEventListener('input', syncDelayedColumn);
document.getElementById('monthlyAmount').addEventListener('input', (e) => {
    e.target.value = formatNumber(e.target.value);
    syncDelayedColumn();
});
document.getElementById('rate').addEventListener('input', syncDelayedColumn);
document.getElementById('years').addEventListener('input', syncDelayedColumn);

// Initial Sync on load
syncDelayedColumn();
