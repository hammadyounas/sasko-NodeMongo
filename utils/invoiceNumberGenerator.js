
let getInvoiceNumber = invoices => {
    return invoices.map((invoice, index) => {
        let invoiceIndex = index++;
        if (invoiceIndex < 10) {
            return ({
                ...invoice._doc,
                invoiceNo: `00000${invoiceIndex}`
            });
        }
        else if (invoiceIndex < 100) {
            return ({
                ...invoice._doc,
                invoiceNo: `0000${invoiceIndex}`
            });
        }
        else if (invoiceIndex < 1000) {
            return ({
                ...invoice._doc,
                invoiceNo: `000${invoiceIndex}`
            });
        }
        else if (invoiceIndex < 10000) {
            return ({
                ...invoice._doc,
                invoiceNo: `00${invoiceIndex}`
            });
        }
        else if (invoiceIndex < 100000) {
            return ({
                ...invoice._doc,
                invoiceNo: `0${invoiceIndex}`
            });
        }
    });
};

module.exports = getInvoiceNumber;