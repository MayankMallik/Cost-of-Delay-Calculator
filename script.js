// --- FORMATTING LOGIC ---
function formatNumber(valString) {
    let value = valString.replace(/,/g, '').replace(/[^0-9.]/g, ''); 
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

const formatToWords = num => {
    const absNum = Math.abs(num);
    const sign = num < 0 ? "-" : "";
    if (absNum >= 10000000) {
        return `${sign}₹${(Math.ceil((absNum / 10000000) * 100) / 100).toFixed(2)} Cr`;
    } else if (absNum >= 100000) {
        return `${sign}₹${(Math.ceil((absNum / 100000) * 100) / 100).toFixed(2)} L`;
    } else {
        let integer = Math.ceil(absNum).toString();
        if (integer.length > 3) {
            let lastThree = integer.slice(-3);
            let otherNumbers = integer.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
            integer = otherNumbers + "," + lastThree;
        }
        return sign + "₹" + integer;
    }
};

// --- SYNC & AUTO-POPULATE ---
const inputs = ['monthlyAmount', 'rate', 'years'];
inputs.forEach(id => {
    document.getElementById(id).addEventListener('input', function() {
        this.classList.remove('error');
        if (id === 'monthlyAmount') this.value = formatNumber(this.value);
        syncDelayedFields();
    });
});

function syncDelayedFields() {
    const amt = parseFloat(document.getElementById('monthlyAmount').value.replace(/,/g, ''));
    const rt = parseFloat(document.getElementById('rate').value);
    const yr = parseFloat(document.getElementById('years').value);

    if (!isNaN(amt) && !isNaN(rt) && !isNaN(yr)) {
        document.getElementById('monthlyAmountDelayed').value = formatNumber((amt * 2).toString());
        document.getElementById('rateDelayed').value = rt;
        document.getElementById('yearsDelayed').value = yr / 2;
    } else {
        document.getElementById('monthlyAmountDelayed').value = "";
        document.getElementById('rateDelayed').value = "";
        document.getElementById('yearsDelayed').value = "";
        document.getElementById('results').style.display = 'none';
    }
}

// --- CALCULATION ---
function calculateSIP(p, annualRate, years) {
    const i = (annualRate / 100) / 12;
    const n = years * 12;
    const totalValue = p * ((Math.pow(1 + i, n) - 1) / i);
    return { invested: p * n, returns: totalValue - (p * n), total: totalValue };
}

function calculateDelay() {
    let isValid = true;
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el.value.trim() === "") { el.classList.add('error'); isValid = false; }
    });
    if (!isValid) return;

    const pNow = parseFloat(document.getElementById('monthlyAmount').value.replace(/,/g, ''));
    const rNow = parseFloat(document.getElementById('rate').value);
    const yNow = parseFloat(document.getElementById('years').value);

    const nowRes = calculateSIP(pNow, rNow, yNow);
    const delayedRes = calculateSIP(pNow * 2, rNow, yNow / 2);

    // Update Grid
    document.getElementById('investedNow').innerText = formatToWords(nowRes.invested);
    document.getElementById('returnsNow').innerText = formatToWords(nowRes.returns);
    document.getElementById('totalNow').innerText = formatToWords(nowRes.total);

    document.getElementById('investedDelayed').innerText = formatToWords(delayedRes.invested);
    document.getElementById('returnsDelayed').innerText = formatToWords(delayedRes.returns);
    document.getElementById('totalDelayed').innerText = formatToWords(delayedRes.total);

    // Update Summary Logic
    const loss = nowRes.total - delayedRes.total;
    document.getElementById('lossAmount').innerText = formatToWords(loss);

    // Solve for Required SIP: P = (FV * i) / ((1 + i)^n - 1)
    const i = (rNow / 100) / 12;
    const nDelayed = (yNow / 2) * 12;
    const reqSIP = (nowRes.total * i) / (Math.pow(1 + i, nDelayed) - 1);
    
    document.getElementById('requiredSIP').innerText = formatToWords(reqSIP);
    document.getElementById('results').style.display = 'block';
}